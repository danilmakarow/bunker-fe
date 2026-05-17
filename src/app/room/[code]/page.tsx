'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Stack, Typography } from '@mui/material';
import PageShell from '@/components/page-shell';
import ParticipantList from '@/components/participant-list';
import RoomCodeShare from '@/components/room-code-share';
import { GlassButton, GlassSpinner } from '@/components/glass';
import { confirm, alertModal } from '@/lib/modal/modal-store';
import { notify } from '@/lib/notify';
import { ApiError } from '@/lib/api/api-error';
import { errorMessageKey } from '@/lib/api/error-message';
import { useRoom } from '@/lib/query/use-room';
import { useMe } from '@/lib/query/use-me';
import { useLeaveRoom } from '@/lib/query/use-leave-room';
import { useKickParticipant } from '@/lib/query/use-kick-participant';
import { useStartGame } from '@/lib/query/use-start-game';
import { queryKeys } from '@/lib/query/keys';
import type { Participant } from '@/lib/api/types';

const ROOM_MIN_PARTICIPANTS_TO_START = 4;

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

/**
 * Lobby. Polls `/rooms/:code` at 1 Hz, drives the participant list, handles
 * status transitions (IN_GAME / FINISHED → /game; ABANDONED → /home), surfaces
 * the "you were kicked" sheet, and toasts admin promotion when the cookie
 * holder becomes admin via succession.
 */
const RoomPage = ({ params }: RoomPageProps) => {
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();

  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('room');
  const tErrors = useTranslations('errors');

  const [pollEnabled, setPollEnabled] = useState(true);
  const { data: room, error: roomError, isLoading } = useRoom(code, pollEnabled);
  const { data: me, isLoading: meLoading } = useMe();

  // Deep-linked unauth users: useMe resolves to null → bounce to landing.
  useEffect(() => {
    if (meLoading) return;
    if (me === null) router.replace('/');
  }, [me, meLoading, router]);

  const leaveRoom = useLeaveRoom(code);
  const kickParticipant = useKickParticipant(code);
  const startGame = useStartGame(code);

  const previousAdminIdRef = useRef<string | undefined>(undefined);
  const wasJoinedRef = useRef(false);
  const exitHandledRef = useRef(false);

  // Capture that the local user has at any point been a JOINED member of this
  // room. Used to distinguish "you were kicked" from "you were never a member"
  // when subsequent polls 403.
  useEffect(() => {
    if (!room || !me) return;
    const stillIn = room.participants.some(
      (participant) => participant.userId === me.id && participant.status === 'JOINED',
    );
    if (stillIn) wasJoinedRef.current = true;
  }, [room, me]);

  // Status transitions: lobby → game / finished → game (post-mortem) /
  // abandoned → home. router.replace keeps the back stack clean.
  useEffect(() => {
    if (!room || exitHandledRef.current) return;
    if (room.status === 'IN_GAME' || room.status === 'FINISHED') {
      exitHandledRef.current = true;
      setPollEnabled(false);
      router.replace(`/game/${code}`);
      return;
    }
    if (room.status === 'ABANDONED') {
      exitHandledRef.current = true;
      setPollEnabled(false);
      notify.info(t('abandoned'));
      router.replace('/home');
    }
  }, [room, code, router, t]);

  // Admin succession toast: fire when adminUserId transitions to me (skipping
  // the initial render where the ref is undefined — that's not a promotion).
  useEffect(() => {
    if (!room || !me) return;
    const previousAdminId = previousAdminIdRef.current;
    if (previousAdminId && previousAdminId !== me.id && room.adminUserId === me.id) {
      notify.info(t('promotedToAdmin'));
    }
    previousAdminIdRef.current = room.adminUserId;
  }, [room?.adminUserId, me?.id, room, me, t]);

  // 403/404 handling. If we previously saw ourselves as JOINED, a 403 means
  // we were kicked — show the modal then bounce. Otherwise treat as "no access".
  useEffect(() => {
    if (exitHandledRef.current) return;
    if (!(roomError instanceof ApiError)) return;
    if (roomError.status !== 403 && roomError.status !== 404) return;

    exitHandledRef.current = true;
    setPollEnabled(false);
    queryClient.removeQueries({ queryKey: queryKeys.room(code) });

    if (wasJoinedRef.current && roomError.status === 403) {
      void alertModal({
        title: t('kickedNotice'),
        message: t('kickedNoticeHint'),
      }).then(() => router.replace('/home'));
      return;
    }

    notify.error(tErrors(errorMessageKey(roomError)));
    router.replace('/home');
  }, [roomError, code, queryClient, router, t, tErrors]);

  const amIAdmin = Boolean(me && room && room.adminUserId === me.id);
  const activeCount = useMemo(
    () => room?.participants.filter((participant) => participant.status === 'JOINED').length ?? 0,
    [room],
  );
  const canStart = amIAdmin && activeCount >= ROOM_MIN_PARTICIPANTS_TO_START;
  const startHint = !amIAdmin
    ? t('startHintNotAdmin')
    : activeCount < ROOM_MIN_PARTICIPANTS_TO_START
      ? t('startHintNotEnough', { min: ROOM_MIN_PARTICIPANTS_TO_START })
      : undefined;

  const handleLeave = async () => {
    const ok = await confirm({
      title: t('leaveConfirm'),
      message: t('leaveConfirmHint'),
      confirmLabel: t('leave'),
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

  const handleKick = async (participant: Participant) => {
    const ok = await confirm({
      title: t('kickConfirm', { name: participant.name }),
      message: t('kickConfirmHint'),
      confirmLabel: t('kick'),
      confirmColor: 'error',
    });
    if (!ok) return;
    try {
      await kickParticipant.mutateAsync({ userId: participant.userId });
    } catch (error) {
      notify.error(tErrors(errorMessageKey(error)));
    }
  };

  const handleStart = async () => {
    try {
      await startGame.mutateAsync();
      // The mutation seeds the room cache; the status-transition effect picks
      // up the IN_GAME flip and navigates. As a belt-and-braces fallback in
      // case the BE responds without IN_GAME, force the redirect here too.
      router.replace(`/game/${code}`);
    } catch (error) {
      notify.error(tErrors(errorMessageKey(error)));
    }
  };

  if (isLoading && !room) {
    return (
      <PageShell appBar={{ title: t('title', { code }) }}>
        <Box sx={{ pt: 6, textAlign: 'center' }}>
          <GlassSpinner />
          <Typography sx={{ mt: 1.5, fontSize: '0.9rem', color: 'rgba(0,0,0,0.55)' }}>
            {t('loading')}
          </Typography>
        </Box>
      </PageShell>
    );
  }

  if (!room) {
    // 403/404 effect is handling the redirect — render nothing in the interim
    // to avoid a flash of stale layout.
    return null;
  }

  return (
    <PageShell
      appBar={{ title: t('title', { code }) }}
      footer={
        <>
          <GlassButton
            glassVariant="primary"
            sx={{ py: 1.5 }}
            disabled={!canStart || startGame.isPending}
            loading={startGame.isPending}
            onClick={handleStart}
          >
            {t('start')}
          </GlassButton>
          {startHint && (
            <Typography
              sx={{
                fontSize: '0.78rem',
                color: 'rgba(0,0,0,0.55)',
                textAlign: 'center',
                mt: -0.5,
              }}
            >
              {startHint}
            </Typography>
          )}
          <GlassButton
            glassVariant="danger"
            sx={{ py: 1.3 }}
            onClick={handleLeave}
            loading={leaveRoom.isPending}
          >
            {t('leave')}
          </GlassButton>
        </>
      }
    >
      <Stack spacing={3} sx={{ pt: 3 }}>
        <RoomCodeShare code={code} />

        <ParticipantList
          participants={room.participants}
          myUserId={me?.id}
          amIAdmin={amIAdmin}
          onKick={handleKick}
          headerLabel={t('participants')}
          kickLabel={t('kick')}
          youLabel={t('you')}
        />
      </Stack>
    </PageShell>
  );
};

export default RoomPage;
