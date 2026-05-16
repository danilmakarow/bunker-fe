'use client';

import { Box, Typography } from '@mui/material';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AttributeKind, Polarity } from '@/lib/api/types';
import { kindLabelKey, polarityColor } from '@/lib/game/attributes';
import { glass } from '@/theme/tokens';
import AttributeIcon from './attribute-icon';

interface BaseSlotProps {
  kind: AttributeKind;
  /**
   * Compact mode renders the small lock-tile shape used in the other-player
   * grid. Default rendering is the larger row used on the local player card.
   */
  compact?: boolean;
}

interface LockedSlotProps extends BaseSlotProps {
  variant: 'locked';
}

interface RevealedSlotProps extends BaseSlotProps {
  variant: 'revealed';
  /** Primary text shown to the right of the icon (biology value or trait title). */
  value: string;
  /** Optional secondary line (trait description). */
  description?: string | null;
  /** Polarity drives the accent dot/border colour. */
  polarity?: Polarity;
}

type RevealSlotProps = LockedSlotProps | RevealedSlotProps;

/**
 * Single attribute slot on a player card.
 *
 *  - `variant: 'locked'` — shown for unrevealed slots on other players.
 *    Compact mode is the small tile in the grid; the default mode is a row
 *    matching the local player's card.
 *  - `variant: 'revealed'` — shown for any revealed attribute (always on
 *    the local player's own card, plus M5+ reveals on others'). Renders
 *    the kind icon + label, the value, and the polarity accent.
 */
const RevealSlot = (props: RevealSlotProps) => {
  const t = useTranslations('game');
  const kindLabel = t(kindLabelKey(props.kind));

  if (props.variant === 'locked' && props.compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          aspectRatio: '1 / 1',
          borderRadius: '12px',
          background: 'rgba(0,0,0,0.04)',
          border: '0.5px solid rgba(0,0,0,0.06)',
          color: 'rgba(0,0,0,0.4)',
          p: 0.5,
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <AttributeIcon kind={props.kind} size={20} color="rgba(0,0,0,0.35)" />
          <Box
            sx={{
              position: 'absolute',
              bottom: -3,
              right: -5,
              background: 'rgba(255,255,255,0.85)',
              borderRadius: '50%',
              p: '1px',
              display: 'inline-flex',
            }}
          >
            <Lock size={9} strokeWidth={2.4} color="rgba(0,0,0,0.45)" />
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: '0.6rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'rgba(0,0,0,0.4)',
            textAlign: 'center',
            lineHeight: 1.1,
            mt: 0.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {kindLabel}
        </Typography>
      </Box>
    );
  }

  const isRevealed = props.variant === 'revealed';
  const accent = isRevealed && props.polarity ? polarityColor(props.polarity) : 'rgba(0,0,0,0.25)';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.5,
        py: 1.1,
        borderLeft: `2px solid ${accent}`,
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '8px',
          background: isRevealed ? 'rgba(0,122,255,0.08)' : 'rgba(0,0,0,0.05)',
          color: isRevealed ? 'rgba(0,122,255,0.85)' : 'rgba(0,0,0,0.4)',
          flexShrink: 0,
          mt: '1px',
        }}
      >
        {isRevealed ? (
          <AttributeIcon kind={props.kind} size={16} />
        ) : (
          <Lock size={14} strokeWidth={2.2} />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.66rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'rgba(0,0,0,0.45)',
            lineHeight: 1.2,
          }}
        >
          {kindLabel}
        </Typography>
        {isRevealed ? (
          <>
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'rgba(0,0,0,0.88)',
                lineHeight: 1.3,
                mt: 0.25,
                transition: glass.transition,
              }}
            >
              {props.value}
            </Typography>
            {props.description && (
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: 'rgba(0,0,0,0.55)',
                  lineHeight: 1.35,
                  mt: 0.25,
                }}
              >
                {props.description}
              </Typography>
            )}
          </>
        ) : (
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'rgba(0,0,0,0.45)',
              fontStyle: 'italic',
              mt: 0.25,
            }}
          >
            {t('locked')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default RevealSlot;
