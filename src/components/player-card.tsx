'use client';

import type { ReactNode } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { Crown, RotateCcw, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type {
  AttributeKind,
  GamePlayer,
  MyCharacter,
  RevealedAttribute,
  Trait,
  TraitKind,
} from '@/entities';
import {
  ALL_SLOTS,
  BIOLOGY_AXES,
  BIOLOGY_SLOT_KIND,
  TRAIT_KIND_ORDER,
  TRAIT_SLOT_COUNTS,
  formatBiologySummaryFromCharacter,
  formatBiologySummaryFromReveals,
  isBiologyFullyRevealed,
  otherSlotReveal,
} from '@/entities/attributes';
import { notify } from '@/components/notify';
import { GlassCard, GlassIconButton, GlassLabel } from './glass';
import RevealSlot from './reveal-slot';
import { glass } from '@/theme/tokens';

interface PlayerCardHeaderProps {
  seatNumber: number;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isSelf: boolean;
  youLabel: string;
  /** Optional "n/N revealed" footer caption on the header row. */
  revealedSummary?: string;
  /** Optional trailing slot (e.g. kick icon button). */
  trailing?: ReactNode;
}

const PlayerCardHeader = ({
  seatNumber,
  name,
  avatarUrl,
  isAdmin,
  isSelf,
  youLabel,
  revealedSummary,
  trailing,
}: PlayerCardHeaderProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
    <Box
      sx={{
        minWidth: 32,
        height: 32,
        px: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.06)',
        borderRadius: '10px',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'rgba(0,0,0,0.55)',
        letterSpacing: '0.04em',
      }}
    >
      {seatNumber}
    </Box>

    <Avatar
      src={avatarUrl ?? undefined}
      alt={name}
      sx={{
        width: 40,
        height: 40,
        bgcolor: 'rgba(0,122,255,0.14)',
        color: 'rgba(0,122,255,0.95)',
        fontSize: '1rem',
        fontWeight: 600,
        border: '0.5px solid rgba(255,255,255,0.7)',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>

    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'rgba(0,0,0,0.88)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </Typography>

        {isAdmin && (
          <Crown size={14} strokeWidth={2.2} color="rgba(255,149,0,0.9)" aria-label="admin" />
        )}

        {isSelf && (
          <Box
            sx={{
              ml: 0.5,
              px: 0.75,
              py: 0.1,
              borderRadius: 999,
              background: 'rgba(0,122,255,0.12)',
              color: 'rgba(0,122,255,0.9)',
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {youLabel}
          </Box>
        )}
      </Box>
      {revealedSummary && (
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: 'rgba(0,0,0,0.45)',
            mt: 0.25,
            letterSpacing: '0.02em',
          }}
        >
          {revealedSummary}
        </Typography>
      )}
    </Box>

    {trailing && <Box sx={{ flexShrink: 0 }}>{trailing}</Box>}
  </Box>
);

interface MyPlayerCardProps {
  variant: 'mine';
  player: GamePlayer;
  character: MyCharacter;
  isAdmin: boolean;
  isSelf: boolean;
  /**
   * Called when the player taps an unrevealed slot to share it. The
   * synthetic `BIOLOGY` kind covers all five biology axes — the caller is
   * expected to fan out the reveal into the five underlying mutations.
   */
  onRevealSlot?: (kind: AttributeKind | 'BIOLOGY', traitId?: string) => void;
  /** Pending mutation key (`${kind}:${traitId ?? ''}`) — suppresses double-fire. */
  pendingSlotKey?: string | null;
}

interface OtherPlayerCardProps {
  variant: 'other';
  player: GamePlayer;
  /**
   * Local-only "kick" state. When true, the card collapses to a compact
   * single-row view exposing only seat + avatar + name + a restore button.
   * This is purely a viewer-side affordance — not synced to the BE.
   */
  isKicked?: boolean;
  /** Called when the viewer taps the kick icon on the full card. */
  onKick?: () => void;
  /** Called when the viewer taps "restore" on the collapsed row. */
  onRestore?: () => void;
  /** Translated label for the kick icon-button (aria + tooltip). */
  kickLabel?: string;
  /** Translated label for the restore button on the collapsed row. */
  restoreLabel?: string;
}

type PlayerCardProps = MyPlayerCardProps | OtherPlayerCardProps;

const traitsForKind = (traits: Trait[], kind: Trait['kind']): Trait[] =>
  traits.filter((trait) => trait.kind === kind);

const slotKey = (kind: AttributeKind | 'BIOLOGY', traitId?: string): string =>
  `${kind}:${traitId ?? ''}`;

const isTraitAttributeRevealed = (
  reveals: readonly RevealedAttribute[],
  kind: TraitKind,
  traitId?: string,
): boolean => {
  if (traitId) {
    return reveals.some(
      (reveal) => reveal.attribute === kind && reveal.trait?.id === traitId,
    );
  }
  return reveals.some((reveal) => reveal.attribute === kind);
};

/**
 * Counts how many of the canonical {@link ALL_SLOTS} positions the given
 * reveal set fills. Biology is treated atomically — only counts once all
 * five axes are public. Trait reveals are one-to-one with reveal entries.
 */
const countFilledSlots = (reveals: readonly RevealedAttribute[]): number => {
  const biologyCount = isBiologyFullyRevealed(reveals) ? 1 : 0;
  const traitCount = reveals.filter(
    (reveal) => !(BIOLOGY_AXES as readonly AttributeKind[]).includes(reveal.attribute),
  ).length;
  return biologyCount + traitCount;
};

/**
 * Player card.
 *
 *  - `variant: 'mine'` — the local player's character. One combined biology
 *    row + every drawn trait. Each slot renders as `'revealed'` if already
 *    public, else `'private'` (value visible to me, tap-to-share with
 *    everyone). The biology row shares all five axes in a single tap.
 *  - `variant: 'other'` — any other player's identity header + an
 *    `ALL_SLOTS`-sized grid (1 combined biology tile + the trait tiles).
 *    Tiles with a matching entry in `player.reveals` flip to compact-revealed;
 *    the rest remain locked placeholders.
 */
const PlayerCard = (props: PlayerCardProps) => {
  const t = useTranslations('game');
  const youLabel = t('you');

  if (props.variant === 'other') {
    if (props.isKicked) {
      return (
        <GlassCard sx={{ px: 1.5, py: 1 }}>
          <PlayerCardHeader
            seatNumber={props.player.seatNumber}
            name={props.player.name}
            avatarUrl={props.player.avatarUrl}
            isAdmin={props.player.isAdmin}
            isSelf={false}
            youLabel={youLabel}
            trailing={
              props.onRestore ? (
                <GlassIconButton
                  aria-label={props.restoreLabel ?? 'restore'}
                  onClick={props.onRestore}
                  sx={{ transition: glass.transition }}
                >
                  <RotateCcw size={18} strokeWidth={2.2} />
                </GlassIconButton>
              ) : undefined
            }
          />
        </GlassCard>
      );
    }
    const filledSlots = countFilledSlots(props.player.reveals);
    const summary =
      filledSlots > 0
        ? t('revealedSummary', { count: filledSlots, total: ALL_SLOTS.length })
        : undefined;
    const handleLockedTap = () => notify.info(t('lockedHint'));
    const biologySummary = formatBiologySummaryFromReveals(props.player.reveals);

    return (
      <GlassCard sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <PlayerCardHeader
          seatNumber={props.player.seatNumber}
          name={props.player.name}
          avatarUrl={props.player.avatarUrl}
          isAdmin={props.player.isAdmin}
          isSelf={false}
          youLabel={youLabel}
          revealedSummary={summary}
          trailing={
            props.onKick ? (
              <GlassIconButton
                danger
                aria-label={props.kickLabel ?? 'kick'}
                onClick={props.onKick}
                sx={{ transition: glass.transition }}
              >
                <X size={18} strokeWidth={2.2} />
              </GlassIconButton>
            ) : undefined
          }
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, minmax(0, 1fr))',
              sm: 'repeat(4, minmax(0, 1fr))',
              md: 'repeat(5, minmax(0, 1fr))',
            },
            gap: 0.75,
          }}
        >
          {ALL_SLOTS.map((slot) => {
            if (slot.kind === BIOLOGY_SLOT_KIND) {
              if (biologySummary) {
                return (
                  <RevealSlot
                    key="biology-revealed"
                    variant="revealed"
                    kind={BIOLOGY_SLOT_KIND}
                    value={biologySummary}
                    polarity="NEUTRAL"
                    compact
                  />
                );
              }
              return (
                <RevealSlot
                  key="biology-locked"
                  variant="locked"
                  kind={BIOLOGY_SLOT_KIND}
                  compact
                  onTap={handleLockedTap}
                />
              );
            }
            const reveal = otherSlotReveal(props.player.reveals, slot.kind, slot.instance);
            if (reveal) {
              const value = reveal.trait?.titleUk ?? '';
              const description = reveal.trait?.descriptionUk ?? null;
              const polarity = reveal.trait?.polarity ?? 'NEUTRAL';
              return (
                <RevealSlot
                  key={`${slot.kind}-${slot.instance}-r`}
                  variant="revealed"
                  kind={slot.kind}
                  value={value}
                  description={description}
                  polarity={polarity}
                  compact
                />
              );
            }
            return (
              <RevealSlot
                key={`${slot.kind}-${slot.instance}-l`}
                variant="locked"
                kind={slot.kind}
                compact
                onTap={handleLockedTap}
              />
            );
          })}
        </Box>
      </GlassCard>
    );
  }

  const { player, character, onRevealSlot, pendingSlotKey } = props;
  const myReveals = player.reveals;
  const biologyValue = formatBiologySummaryFromCharacter(character);
  const biologyRevealedPublicly = isBiologyFullyRevealed(myReveals);
  const biologyPending = pendingSlotKey === slotKey('BIOLOGY');
  const filledSlots = countFilledSlots(myReveals);

  return (
    <GlassCard sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PlayerCardHeader
        seatNumber={player.seatNumber}
        name={player.name}
        avatarUrl={player.avatarUrl}
        isAdmin={props.isAdmin}
        isSelf={props.isSelf}
        youLabel={youLabel}
        revealedSummary={t('revealedSummary', {
          count: filledSlots,
          total: ALL_SLOTS.length,
        })}
      />

      <Stack spacing={1.25}>
        <GlassLabel sx={{ px: 0.5, mb: 0 }}>{t('section.biology')}</GlassLabel>
        <Box
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.4)',
          }}
        >
          {biologyRevealedPublicly ? (
            <RevealSlot
              variant="revealed"
              kind={BIOLOGY_SLOT_KIND}
              value={biologyValue}
              polarity="NEUTRAL"
            />
          ) : (
            <RevealSlot
              variant="private"
              kind={BIOLOGY_SLOT_KIND}
              value={biologyValue}
              polarity="NEUTRAL"
              onReveal={onRevealSlot ? () => onRevealSlot('BIOLOGY') : undefined}
              busy={biologyPending}
            />
          )}
        </Box>

        <GlassLabel sx={{ px: 0.5, mb: 0, mt: 1 }}>{t('section.traits')}</GlassLabel>
        <Box
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.4)',
          }}
        >
          {TRAIT_KIND_ORDER.flatMap((kind: TraitKind) => {
            const matches = traitsForKind(character.traits, kind);
            const expectedCount = TRAIT_SLOT_COUNTS[kind];
            const isMultiSlot = expectedCount > 1;
            return Array.from({ length: expectedCount }, (_, index) => {
              const trait = matches[index];
              return { kind, index, trait, isMultiSlot };
            });
          }).map(({ kind, index, trait, isMultiSlot }, flatIndex) => {
            if (!trait) {
              return (
                <Box key={`${kind}-${index}-empty`}>
                  {flatIndex > 0 && (
                    <Box sx={{ mx: 1.5, height: '0.5px', background: 'rgba(0,0,0,0.07)' }} />
                  )}
                  <RevealSlot variant="locked" kind={kind} />
                </Box>
              );
            }
            const traitIdForMutation = isMultiSlot ? trait.id : undefined;
            const revealedPublicly = isTraitAttributeRevealed(
              myReveals,
              kind,
              traitIdForMutation,
            );
            const key = slotKey(kind, traitIdForMutation);
            const isPending = pendingSlotKey === key;
            return (
              <Box key={`${kind}-${index}-${trait.id}-${revealedPublicly ? 'r' : 'p'}`}>
                {flatIndex > 0 && (
                  <Box sx={{ mx: 1.5, height: '0.5px', background: 'rgba(0,0,0,0.07)' }} />
                )}
                {revealedPublicly ? (
                  <RevealSlot
                    variant="revealed"
                    kind={kind}
                    value={trait.titleUk}
                    description={trait.descriptionUk}
                    polarity={trait.polarity}
                  />
                ) : (
                  <RevealSlot
                    variant="private"
                    kind={kind}
                    value={trait.titleUk}
                    description={trait.descriptionUk}
                    polarity={trait.polarity}
                    onReveal={
                      onRevealSlot
                        ? () => onRevealSlot(kind, traitIdForMutation)
                        : undefined
                    }
                    busy={isPending}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Stack>
    </GlassCard>
  );
};

export default PlayerCard;
