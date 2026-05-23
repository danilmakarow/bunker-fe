'use client';

import { useState, type MouseEvent, type ReactElement } from 'react';
import { Box, ClickAwayListener, Tooltip, Typography } from '@mui/material';
import { ChevronRight, Eye, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Polarity } from '@/entities';
import type { SlotKind } from '@/entities/attributes';
import { kindLabelKey } from '@/adapters/attribute-labels';
import { polarityColor } from '@/theme/polarity';
import { glass } from '@/theme/tokens';
import AttributeIcon from './attribute-icon';

interface LockedSlotProps {
  variant: 'locked';
  kind: SlotKind;
  /**
   * Compact mode renders the small lock-tile shape used in the other-player
   * grid. Default rendering is the larger row used on the local player card.
   */
  compact?: boolean;
  /** Optional tap handler — used on other players' grids to show a hint toast. */
  onTap?: () => void;
}

interface RevealedSlotProps {
  variant: 'revealed';
  kind: SlotKind;
  /** Primary text shown to the right of the icon (biology value or trait title). */
  value: string;
  /** Optional secondary line (trait description). */
  description?: string | null;
  /** Polarity drives the accent dot/border colour. */
  polarity?: Polarity;
  compact?: boolean;
}

interface PrivateSlotProps {
  variant: 'private';
  kind: SlotKind;
  /** Caller's own value — always visible to themselves. */
  value: string;
  description?: string | null;
  polarity?: Polarity;
  /** Tap handler; absence makes the row non-interactive (e.g. mid-mutation). */
  onReveal?: () => void;
  /** Suppress the tap affordance while a reveal mutation is in flight. */
  busy?: boolean;
}

type RevealSlotProps = LockedSlotProps | RevealedSlotProps | PrivateSlotProps;

interface SlotTooltipProps {
  title: string;
  description?: string | null;
  children: ReactElement;
}

/**
 * Tap-to-toggle tooltip used on the compact revealed tiles in the others'
 * grid — the text inside those tiles is truncated to two lines, so the
 * tooltip surfaces the full value (and description, when available) without
 * forcing the user to open the player card.
 */
const SlotTooltip = ({ title, description, children }: SlotTooltipProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (event: MouseEvent) => {
    event.stopPropagation();
    setOpen((current) => !current);
  };

  const body = description ? (
    <Box sx={{ maxWidth: 260 }}>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', opacity: 0.88, mt: 0.5, lineHeight: 1.4 }}>
        {description}
      </Typography>
    </Box>
  ) : (
    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: 260, lineHeight: 1.35 }}>
      {title}
    </Typography>
  );

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Tooltip
        open={open}
        title={body}
        placement="top"
        arrow
        disableHoverListener
        disableFocusListener
        disableTouchListener
        slotProps={{
          tooltip: {
            sx: {
              background: 'rgba(20,20,22,0.94)',
              color: '#fff',
              borderRadius: '10px',
              px: 1.25,
              py: 1,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            },
          },
          arrow: { sx: { color: 'rgba(20,20,22,0.94)' } },
        }}
      >
        <Box
          onClick={handleToggle}
          sx={{ cursor: 'pointer', minWidth: 0, display: 'flex' }}
        >
          {children}
        </Box>
      </Tooltip>
    </ClickAwayListener>
  );
};

/**
 * Single attribute slot on a player card.
 *
 *  - `variant: 'locked'` — unrevealed slot on another player's card.
 *  - `variant: 'revealed'` — publicly revealed slot, visible to everyone.
 *  - `variant: 'private'` — caller's own slot, value visible but not yet
 *    shared with the room. Tappable to fire the reveal confirm dialog.
 *
 * Compact mode (`locked` / `revealed` only) renders the small tile shape
 * used in the other-player grid. Private slots are never compact — the
 * caller's own card always uses the row layout.
 */
const RevealSlot = (props: RevealSlotProps) => {
  const t = useTranslations('game');
  const kindLabel = t(kindLabelKey(props.kind));

  if (props.variant === 'locked' && props.compact) {
    const tappable = Boolean(props.onTap);
    return (
      <Box
        component={tappable ? 'button' : 'div'}
        type={tappable ? 'button' : undefined}
        onClick={props.onTap}
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
          fontFamily: 'inherit',
          cursor: tappable ? 'pointer' : 'default',
          transition: glass.transition,
          '&:active': tappable ? { background: 'rgba(0,0,0,0.07)' } : undefined,
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

  if (props.variant === 'revealed' && props.compact) {
    const accent = props.polarity ? polarityColor(props.polarity) : 'rgba(0,0,0,0.25)';
    const tile = (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          aspectRatio: '1 / 1',
          width: '100%',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.65)',
          border: `0.5px solid ${accent}`,
          color: 'rgba(0,0,0,0.85)',
          p: 0.5,
          transition: glass.transition,
          '@keyframes revealAppear': {
            '0%': { opacity: 0, transform: 'scale(0.92)' },
            '55%': { opacity: 1, transform: 'scale(1.04)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
          animation: 'revealAppear 360ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <AttributeIcon kind={props.kind} size={18} color={accent} />
        <Typography
          sx={{
            fontSize: '0.6rem',
            fontWeight: 700,
            color: 'rgba(0,0,0,0.85)',
            textAlign: 'center',
            lineHeight: 1.1,
            mt: 0.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {props.value}
        </Typography>
      </Box>
    );
    return (
      <SlotTooltip title={props.value} description={props.description}>
        {tile}
      </SlotTooltip>
    );
  }

  const isRevealed = props.variant === 'revealed';
  const isPrivate = props.variant === 'private';
  const hasValue = isRevealed || isPrivate;
  const polarity = hasValue ? props.polarity : undefined;
  const accent = polarity ? polarityColor(polarity) : 'rgba(0,0,0,0.25)';
  const interactive = isPrivate && Boolean(props.onReveal) && !props.busy;

  const bodyContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.5,
        py: 1.1,
        borderLeft: `2px solid ${accent}`,
        transition: glass.transition,
        cursor: interactive ? 'pointer' : 'default',
        opacity: isPrivate && props.busy ? 0.6 : 1,
        '&:active': interactive ? { background: 'rgba(0,0,0,0.03)' } : undefined,
        ...(isRevealed && {
          '@keyframes revealAppearRow': {
            '0%': { opacity: 0, transform: 'translateY(-4px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
          animation: 'revealAppearRow 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        }),
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
          background: isRevealed
            ? 'rgba(0,122,255,0.08)'
            : isPrivate
              ? 'rgba(0,0,0,0.04)'
              : 'rgba(0,0,0,0.05)',
          color: isRevealed
            ? 'rgba(0,122,255,0.85)'
            : isPrivate
              ? 'rgba(0,0,0,0.55)'
              : 'rgba(0,0,0,0.4)',
          flexShrink: 0,
          mt: '1px',
          position: 'relative',
        }}
      >
        {hasValue ? (
          <AttributeIcon kind={props.kind} size={16} />
        ) : (
          <Lock size={14} strokeWidth={2.2} />
        )}
        {isPrivate && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -3,
              right: -3,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)',
              color: 'rgba(255,255,255,0.95)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={8} strokeWidth={2.6} />
          </Box>
        )}
        {isRevealed && !isPrivate && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -3,
              right: -3,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'rgba(52,199,89,0.95)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Eye size={8} strokeWidth={2.6} />
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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
          {isPrivate && (
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 600,
                color: 'rgba(0,0,0,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              · {t('slot.private')}
            </Typography>
          )}
          {isRevealed && (
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 600,
                color: 'rgba(52,199,89,0.85)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              · {t('slot.public')}
            </Typography>
          )}
        </Box>

        {hasValue ? (
          <>
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'rgba(0,0,0,0.88)',
                lineHeight: 1.3,
                mt: 0.25,
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
            {interactive && (
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: 'rgba(0,122,255,0.85)',
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {t('slot.tapToReveal')}
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

      {interactive && (
        <ChevronRight
          size={16}
          strokeWidth={2.2}
          color="rgba(0,122,255,0.7)"
          style={{ marginTop: 6, flexShrink: 0 }}
        />
      )}
    </Box>
  );

  if (interactive) {
    return (
      <Box
        component="button"
        type="button"
        onClick={props.onReveal}
        sx={{
          display: 'block',
          width: '100%',
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          fontFamily: 'inherit',
          padding: 0,
          cursor: 'pointer',
          color: 'inherit',
        }}
      >
        {bodyContent}
      </Box>
    );
  }

  return bodyContent;
};

export default RevealSlot;
