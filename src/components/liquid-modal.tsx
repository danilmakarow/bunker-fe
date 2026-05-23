'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { GlassInput, GlassFieldGroup } from './glass';
import type { ConfirmColor } from '@/components/modal/types';
import { glass, layout, safeArea } from '@/theme/tokens';

interface LiquidModalProps {
  open: boolean;
  title: string;
  message?: ReactNode;
  showInput?: boolean;
  inputLabel?: string;
  inputDefaultValue?: string;
  inputPlaceholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Hide the cancel button entirely (for single-action alerts). */
  hideCancel?: boolean;
  confirmColor?: ConfirmColor;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
}

/**
 * Apple liquid-glass modal with a mobile-first split:
 *  - On phones (≤ phoneBreakpoint): slides up from the bottom as a sheet
 *    with a grabber, anchored to safe-area, full-width with top-rounded
 *    corners. Stacked buttons that are reachable by thumb.
 *  - On tablets+: classic centered iOS alert (the original ported design).
 */
const LiquidModal = ({
  open,
  title,
  message,
  showInput = false,
  inputLabel = '',
  inputDefaultValue = '',
  inputPlaceholder,
  confirmLabel = 'OK',
  cancelLabel = 'Скасувати',
  hideCancel = false,
  confirmColor = 'primary',
  onConfirm,
  onCancel,
}: LiquidModalProps) => {
  const [inputValue, setInputValue] = useState(inputDefaultValue);
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) {
      setInputValue(inputDefaultValue);
    }
  }, [open, inputDefaultValue]);

  if (!open) return null;

  const handleConfirm = () => {
    if (showInput && !inputValue.trim()) return;
    onConfirm(showInput ? inputValue.trim() : undefined);
  };

  const confirmDisabled = showInput && !inputValue.trim();
  const confirmColorCss =
    confirmColor === 'error' ? 'rgba(255,59,48,0.95)' : 'rgba(0,122,255,0.95)';

  const bodyContent = (
    <Box sx={{ px: 2.5, pt: isPhone ? 1 : 2.5, pb: showInput ? 1.5 : 2.5, textAlign: 'center' }}>
      <Typography sx={{ fontSize: '1.05rem', fontWeight: 600, mb: 0.5, color: 'rgba(0,0,0,0.85)' }}>
        {title}
      </Typography>

      {message && (
        <Typography
          component="div"
          sx={{ fontSize: '0.88rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.5 }}
        >
          {message}
        </Typography>
      )}

      {showInput && (
        <Box sx={{ mt: 2, textAlign: 'left' }}>
          <GlassFieldGroup>
            <GlassInput
              autoFocus
              label={inputLabel}
              value={inputValue}
              placeholder={inputPlaceholder}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleConfirm();
              }}
            />
          </GlassFieldGroup>
        </Box>
      )}
    </Box>
  );

  if (isPhone) {
    return (
      <Box
        onClick={onCancel}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(8px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(8px) saturate(1.2)',
          animation: 'sheetFadeIn 0.18s ease-out',
          '@keyframes sheetFadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
      >
        <Box
          onClick={(event) => event.stopPropagation()}
          sx={{
            width: '100%',
            maxWidth: 520,
            borderTopLeftRadius: glass.radiusSheet,
            borderTopRightRadius: glass.radiusSheet,
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(50px) saturate(2)',
            WebkitBackdropFilter: 'blur(50px) saturate(2)',
            borderTop: '0.5px solid rgba(255,255,255,0.7)',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            pb: safeArea.bottom,
            animation: 'sheetSlideUp 0.26s cubic-bezier(.32,.72,0,1)',
            '@keyframes sheetSlideUp': {
              from: { transform: 'translateY(100%)' },
              to: { transform: 'translateY(0)' },
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 5,
                borderRadius: 999,
                background: 'rgba(0,0,0,0.18)',
              }}
            />
          </Box>

          {bodyContent}

          <Box sx={{ px: 2, pb: 1.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              component="button"
              type="button"
              onClick={handleConfirm}
              disabled={confirmDisabled}
              sx={{
                width: '100%',
                minHeight: layout.minTapTarget,
                py: 1.4,
                px: 2,
                border: 'none',
                borderRadius: glass.radius,
                background:
                  confirmColor === 'error'
                    ? 'rgba(255,59,48,0.92)'
                    : 'rgba(0,122,255,0.92)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                opacity: confirmDisabled ? 0.45 : 1,
                cursor: confirmDisabled ? 'default' : 'pointer',
                transition: glass.transition,
                '&:active': { transform: confirmDisabled ? 'none' : 'scale(0.98)' },
              }}
            >
              {confirmLabel}
            </Box>
            {!hideCancel && (
              <Box
                component="button"
                type="button"
                onClick={onCancel}
                sx={{
                  width: '100%',
                  minHeight: layout.minTapTarget,
                  py: 1.2,
                  px: 2,
                  border: 'none',
                  borderRadius: glass.radius,
                  background: 'transparent',
                  color: 'rgba(0,122,255,0.95)',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: glass.transition,
                  '&:active': { background: 'rgba(0,0,0,0.04)' },
                }}
              >
                {cancelLabel}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onClick={onCancel}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.18)',
        backdropFilter: 'blur(30px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(30px) saturate(1.4)',
        animation: 'modalFadeIn 0.18s ease-out',
        '@keyframes modalFadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <Box
        onClick={(event) => event.stopPropagation()}
        sx={{
          width: '100%',
          maxWidth: 360,
          mx: 2,
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(50px) saturate(2)',
          WebkitBackdropFilter: 'blur(50px) saturate(2)',
          border: '0.5px solid rgba(255,255,255,0.7)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.22s cubic-bezier(.4,0,.2,1)',
          '@keyframes modalSlideUp': {
            from: { opacity: 0, transform: 'scale(0.97) translateY(8px)' },
            to: { opacity: 1, transform: 'scale(1) translateY(0)' },
          },
        }}
      >
        {bodyContent}

        <Box sx={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex' }}>
            {!hideCancel && (
              <Box
                component="button"
                type="button"
                onClick={onCancel}
                sx={{
                  flex: 1,
                  minHeight: layout.minTapTarget,
                  py: 1.3,
                  background: 'transparent',
                  border: 'none',
                  borderRight: '0.5px solid rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  color: 'rgba(0,122,255,0.95)',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s ease',
                  '&:hover': { background: 'rgba(0,0,0,0.03)' },
                  '&:active': { background: 'rgba(0,0,0,0.06)' },
                }}
              >
                {cancelLabel}
              </Box>
            )}
            <Box
              component="button"
              type="button"
              onClick={handleConfirm}
              sx={{
                flex: 1,
                minHeight: layout.minTapTarget,
                py: 1.3,
                background: 'transparent',
                border: 'none',
                cursor: confirmDisabled ? 'default' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                color: confirmColorCss,
                opacity: confirmDisabled ? 0.35 : 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  background: confirmDisabled ? 'transparent' : 'rgba(0,0,0,0.03)',
                },
                '&:active': { background: 'rgba(0,0,0,0.06)' },
              }}
            >
              {confirmLabel}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LiquidModal;
