'use client';

import { Avatar, Box, Stack, Typography } from '@mui/material';
import { Crown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type {
  BiologyAxis,
  GamePlayer,
  MyCharacter,
  Polarity,
  Trait,
} from '@/lib/api/types';
import {
  ALL_SLOTS,
  BIOLOGY_AXES,
  TRAIT_KIND_ORDER,
  TRAIT_SLOT_COUNTS,
} from '@/lib/game/attributes';
import { GlassCard, GlassLabel } from './glass';
import RevealSlot from './reveal-slot';

interface PlayerCardHeaderProps {
  seatNumber: number;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isSelf: boolean;
  youLabel: string;
}

const PlayerCardHeader = ({
  seatNumber,
  name,
  avatarUrl,
  isAdmin,
  isSelf,
  youLabel,
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

    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75 }}>
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
  </Box>
);

interface MyPlayerCardProps {
  variant: 'mine';
  player: GamePlayer;
  character: MyCharacter;
  isAdmin: boolean;
  isSelf: boolean;
}

interface OtherPlayerCardProps {
  variant: 'other';
  player: GamePlayer;
}

type PlayerCardProps = MyPlayerCardProps | OtherPlayerCardProps;

const traitsForKind = (traits: Trait[], kind: Trait['kind']): Trait[] =>
  traits.filter((trait) => trait.kind === kind);

const biologyEntry = (
  character: MyCharacter,
  axis: BiologyAxis,
): { value: string; polarity: Polarity } => {
  const value =
    axis === 'AGE'
      ? character.age.valueUk
      : axis === 'WEIGHT'
        ? character.weight.valueUk
        : axis === 'SEX'
          ? character.sex.valueUk
          : axis === 'GENDER'
            ? character.gender.valueUk
            : character.race.valueUk;
  return { value, polarity: 'NEUTRAL' };
};

/**
 * Player card.
 *
 *  - `variant: 'mine'` — the local player's character, all 5 biology rows
 *    + every drawn trait rendered as revealed slots.
 *  - `variant: 'other'` — any other player's identity header + an
 *    `ALL_SLOTS`-sized grid of locked tiles. M5 will fold revealed
 *    attributes into the grid as they come in via the snapshot.
 */
const PlayerCard = (props: PlayerCardProps) => {
  const t = useTranslations('game');
  const youLabel = t('you');

  if (props.variant === 'other') {
    return (
      <GlassCard sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <PlayerCardHeader
          seatNumber={props.player.seatNumber}
          name={props.player.name}
          avatarUrl={props.player.avatarUrl}
          isAdmin={props.player.isAdmin}
          isSelf={false}
          youLabel={youLabel}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 0.75,
          }}
        >
          {ALL_SLOTS.map((slot) => (
            <RevealSlot
              key={`${slot.kind}-${slot.instance}`}
              variant="locked"
              kind={slot.kind}
              compact
            />
          ))}
        </Box>
      </GlassCard>
    );
  }

  const { player, character } = props;

  return (
    <GlassCard sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PlayerCardHeader
        seatNumber={player.seatNumber}
        name={player.name}
        avatarUrl={player.avatarUrl}
        isAdmin={props.isAdmin}
        isSelf={props.isSelf}
        youLabel={youLabel}
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
          {BIOLOGY_AXES.map((axis, index) => {
            const { value, polarity } = biologyEntry(character, axis);
            return (
              <Box key={axis}>
                {index > 0 && (
                  <Box sx={{ mx: 1.5, height: '0.5px', background: 'rgba(0,0,0,0.07)' }} />
                )}
                <RevealSlot variant="revealed" kind={axis} value={value} polarity={polarity} />
              </Box>
            );
          })}
        </Box>

        <GlassLabel sx={{ px: 0.5, mb: 0, mt: 1 }}>{t('section.traits')}</GlassLabel>
        <Box
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.4)',
          }}
        >
          {TRAIT_KIND_ORDER.flatMap((kind) => {
            const matches = traitsForKind(character.traits, kind);
            const expectedCount = TRAIT_SLOT_COUNTS[kind];
            return Array.from({ length: expectedCount }, (_, index) => {
              const trait = matches[index];
              return { kind, index, trait };
            });
          }).map(({ kind, index, trait }, flatIndex) => (
            <Box key={`${kind}-${index}`}>
              {flatIndex > 0 && (
                <Box sx={{ mx: 1.5, height: '0.5px', background: 'rgba(0,0,0,0.07)' }} />
              )}
              {trait ? (
                <RevealSlot
                  variant="revealed"
                  kind={kind}
                  value={trait.titleUk}
                  description={trait.descriptionUk}
                  polarity={trait.polarity}
                />
              ) : (
                <RevealSlot variant="locked" kind={kind} />
              )}
            </Box>
          ))}
        </Box>
      </Stack>
    </GlassCard>
  );
};

export default PlayerCard;
