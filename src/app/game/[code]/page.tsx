'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Stack, Typography } from '@mui/material';
import PageShell from '@/components/page-shell';
import GameTopBar from '@/components/game-top-bar';
import PlayerCard from '@/components/player-card';
import { GlassButton, GlassCard, GlassLabel, GlassSpinner } from '@/components/glass';
import { confirm, alertModal } from '@/components/modal/modal-store';
import { notify } from '@/components/notify';
import { ApiError } from '@/infrastructure/http/api-error';
import { errorMessageKey } from '@/adapters/error-message';
import { BIOLOGY_AXES } from '@/entities/attributes';
import { polarityColor } from '@/theme/polarity';
import { useGame } from '@/use-cases/use-game';
import { useMe } from '@/use-cases/use-me';
import { useLeaveRoom } from '@/use-cases/use-leave-room';
import { useFinishRoom } from '@/use-cases/use-finish-room';
import { useReveal } from '@/use-cases/use-reveal';
import { queryKeys } from '@/use-cases/query-keys';
import type { AttributeKind } from '@/entities';

interface GamePageProps {
  params: Promise<{ code: string }>;
}

/**
 * Game screen.
 *
 * Polls `/rooms/:code/game` at 1 Hz. Renders the scenario header (full
 * apocalypse / shelter details live in the InfoSheet behind the AppBar's
 * trailing info button), the local player's character card with every
 * attribute revealed, and a stacked grid of other players' cards with
 * locked slot placeholders (M5 will swap individual slots to revealed).
 *
 * Status handling mirrors the lobby's:
 *  - LOBBY → /room/[code] (race-condition fallback)
 *  - ABANDONED → toast + /home
 *  - FINISHED → "game finished" alertModal + /home (BE returns 409 on
 *    snapshot for FINISHED until the post-mortem decision in §10 lands)
 *  - 403 → kicked detection mirroring the lobby
 *  - 404 / 409 → translated toast + /home
 */
const GamePage = ({ params }: GamePageProps) => {
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();

  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('game');
  const tErrors = useTranslations('errors');

  const [pollEnabled, setPollEnabled] = useState(true);
  const { data: game, error: gameError, isLoading } = useGame(code, pollEnabled);
  const { data: me, isLoading: meLoading } = useMe();

  const leaveRoom = useLeaveRoom(code);
  const finishRoom = useFinishRoom(code);
  const reveal = useReveal(code);

  const wasJoinedRef = useRef(false);
  const exitHandledRef = useRef(false);
  const [pendingSlotKey, setPendingSlotKey] = useState<string | null>(null);
  const [kickedUserIds, setKickedUserIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (meLoading) return;
    if (me === null) router.replace('/start');
  }, [me, meLoading, router]);

  // Once we receive a snapshot we know we were JOINED; this distinguishes
  // a later 403 (kick) from "never was a member".
  useEffect(() => {
    if (game) wasJoinedRef.current = true;
  }, [game]);

  // Status transitions.
  useEffect(() => {
    if (!game || exitHandledRef.current) return;
    if (game.status === 'LOBBY') {
      exitHandledRef.current = true;
      setPollEnabled(false);
      router.replace(`/room/${code}`);
      return;
    }
    if (game.status === 'FINISHED') {
      exitHandledRef.current = true;
      setPollEnabled(false);
      void alertModal({
        title: t('finishedNotice'),
        message: t('finishedHint'),
      }).then(() => router.replace('/home'));
      return;
    }
    if (game.status === 'ABANDONED') {
      exitHandledRef.current = true;
      setPollEnabled(false);
      notify.info(t('finishedNotice'));
      router.replace('/home');
    }
  }, [game, code, router, t]);

  // 403 / 404 / 409 handling.
  useEffect(() => {
    if (exitHandledRef.current) return;
    if (!(gameError instanceof ApiError)) return;
    if (gameError.status !== 403 && gameError.status !== 404 && gameError.status !== 409) return;

    exitHandledRef.current = true;
    setPollEnabled(false);
    queryClient.removeQueries({ queryKey: queryKeys.game(code) });

    if (wasJoinedRef.current && gameError.status === 403) {
      void alertModal({
        title: t('finishedNotice'),
        message: t('finishedHint'),
      }).then(() => router.replace('/home'));
      return;
    }

    if (gameError.status === 409) {
      notify.error(t('notInGame'));
      router.replace(`/room/${code}`);
      return;
    }

    notify.error(tErrors(errorMessageKey(gameError)));
    router.replace('/home');
  }, [gameError, code, queryClient, router, t, tErrors]);

  const myPlayer = useMemo(
    () => game?.players.find((player) => player.userId === me?.id),
    [game, me],
  );
  const otherPlayers = useMemo(
    () =>
      game?.players.filter(
        (player) => player.userId !== me?.id && player.status === 'JOINED',
      ) ?? [],
    [game, me],
  );
  const amIAdmin = Boolean(me && game && game.adminUserId === me.id);

  const handleExit = async () => {
    const ok = await confirm({
      title: t('exitConfirm'),
      message: t('exitConfirmHint'),
      confirmLabel: t('exit'),
      confirmColor: 'error',
    });
    if (!ok) return;
    try {
      await leaveRoom.mutateAsync();
    } catch (error) {
      notify.error(tErrors(errorMessageKey(error)));
      return;
    }
    exitHandledRef.current = true;
    setPollEnabled(false);
    router.replace('/home');
  };

  const handleFinish = async () => {
    const ok = await confirm({
      title: t('finishConfirm'),
      message: t('finishConfirmHint'),
      confirmLabel: t('finish'),
      confirmColor: 'error',
    });
    if (!ok) return;
    try {
      await finishRoom.mutateAsync();
    } catch (error) {
      notify.error(tErrors(errorMessageKey(error)));
    }
    // Status-transition effect will pick up FINISHED and handle redirect.
  };

  const handleKickFromView = useCallback(
    async (userId: string, name: string) => {
      const ok = await confirm({
        title: t('uiKickConfirm', { name }),
        message: t('uiKickConfirmHint'),
        confirmLabel: t('uiKick'),
        confirmColor: 'error',
      });
      if (!ok) return;
      setKickedUserIds((previous) => {
        const next = new Set(previous);
        next.add(userId);
        return next;
      });
    },
    [t],
  );

  const handleRestoreToView = useCallback((userId: string) => {
    setKickedUserIds((previous) => {
      if (!previous.has(userId)) return previous;
      const next = new Set(previous);
      next.delete(userId);
      return next;
    });
  }, []);

  /**
   * Tap handler for an unrevealed slot on the local player's card.
   * Shows the bottom-sheet confirm, then POSTs the reveal. Suppresses
   * concurrent calls on the same slot via {@link pendingSlotKey}.
   *
   * The synthetic `'BIOLOGY'` kind is fanned out into five individual
   * mutations (one per biology axis) — the UI shows biology as a single
   * combined slot, but the BE still tracks each axis independently. The
   * five calls run sequentially so the final snapshot lands with all five
   * axes public, avoiding a brief flash of a partial reveal.
   */
  const handleRevealSlot = useCallback(
    async (kind: AttributeKind | 'BIOLOGY', traitId?: string) => {
      const slotKey = `${kind}:${traitId ?? ''}`;
      if (pendingSlotKey === slotKey) return;

      const ok = await confirm({
        title: t('revealConfirm', { kind: t(`kind.${kind}`) }),
        message: t('revealConfirmHint'),
        confirmLabel: t('reveal'),
        confirmColor: 'primary',
      });
      if (!ok) return;

      setPendingSlotKey(slotKey);
      try {
        if (kind === 'BIOLOGY') {
          for (const axis of BIOLOGY_AXES) {
            await reveal.mutateAsync({ attribute: axis });
          }
        } else {
          await reveal.mutateAsync({ attribute: kind, traitId });
        }
      } catch (error) {
        notify.error(tErrors(errorMessageKey(error)));
      } finally {
        setPendingSlotKey(null);
      }
    },
    [pendingSlotKey, reveal, t, tErrors],
  );

  if (isLoading && !game) {
    return (
      <PageShell appBar={{ title: t('title', { code }) }}>
        <Box sx={{ pt: 6, textAlign: 'center' }}>
          <GlassSpinner />
          <Typography sx={{ mt: 1.5, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)' }}>
            {t('loading')}
          </Typography>
        </Box>
      </PageShell>
    );
  }

  if (!game || !myPlayer) {
    return null;
  }

  return (
    <PageShell
      maxContentWidth={720}
      appBar={{
        title: t('title', { code }),
        trailing: <GameTopBar apocalypse={game.apocalypse} shelter={game.shelter} />,
      }}
      footer={
        <>
          {amIAdmin && (
            <GlassButton
              glassVariant="secondary"
              sx={{ py: 1.3 }}
              onClick={handleFinish}
              loading={finishRoom.isPending}
            >
              {t('finish')}
            </GlassButton>
          )}
          <GlassButton
            glassVariant="danger"
            sx={{ py: 1.3 }}
            onClick={handleExit}
            loading={leaveRoom.isPending}
          >
            {t('exit')}
          </GlassButton>
        </>
      }
    >
      <Stack spacing={3} sx={{ pt: 2 }}>
        <GlassCard sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <GlassLabel sx={{ mb: 0 }}>{t('infoSheet.apocalypseHeading')}</GlassLabel>
          <Typography
            sx={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.88)',
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
            }}
          >
            {game.apocalypse.nameUk}
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>
            {game.apocalypse.descriptionUk}
          </Typography>
          <Box
            sx={{
              mt: 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: polarityColor(game.apocalypse.polarity),
              }}
            />
            <span>
              {t('infoSheet.populationRemainder')}: {game.apocalypse.populationRemainderUk}
            </span>
          </Box>
        </GlassCard>

        <Box>
          <GlassLabel sx={{ px: 0.5, mb: 1 }}>{t('section.myCard')}</GlassLabel>
          <PlayerCard
            variant="mine"
            player={myPlayer}
            character={game.myCharacter}
            isAdmin={amIAdmin}
            isSelf
            onRevealSlot={handleRevealSlot}
            pendingSlotKey={pendingSlotKey}
          />
        </Box>

        {otherPlayers.length > 0 && (
          <Box>
            <GlassLabel sx={{ px: 0.5, mb: 1 }}>
              {t('section.others')} ({otherPlayers.length})
            </GlassLabel>
            <Stack spacing={1.5}>
              {otherPlayers.map((player) => {
                const isKicked = kickedUserIds.has(player.userId);
                return (
                  <PlayerCard
                    key={player.userId}
                    variant="other"
                    player={player}
                    isKicked={isKicked}
                    onKick={() => handleKickFromView(player.userId, player.name)}
                    onRestore={() => handleRestoreToView(player.userId)}
                    kickLabel={t('uiKick')}
                    restoreLabel={t('uiKickRestore')}
                  />
                );
              })}
            </Stack>
          </Box>
        )}
      </Stack>
    </PageShell>
  );
};

export default GamePage;
