'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { X } from 'lucide-react';
import { glass, safeArea } from '@/theme/tokens';

interface InfoSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Bottom sheet on phones / centered card on tablet+ for displaying rich,
 * scrollable content (apocalypse + shelter details, etc).
 *
 * Separate from LiquidModal — that component is action-focused (confirm /
 * cancel buttons); InfoSheet is a read-only details surface with a close
 * affordance and unconstrained body content.
 *
 * Rendered through a portal anchored at `document.body` so the sheet's
 * `position: fixed` is resolved against the viewport rather than the
 * AppBar's containing block (the AppBar has `backdrop-filter`, which on
 * WebKit promotes itself to a containing block for fixed descendants and
 * would otherwise trap the sheet inside the header strip).
 */
const InfoSheet = ({ open, title, onClose, children }: InfoSheetProps) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const sheetContainerSx = isPhone
    ? {
        alignItems: 'flex-end',
      }
    : {
        alignItems: 'center',
      };

  const sheetCardSx = isPhone
    ? {
        width: '100%',
        maxWidth: 560,
        maxHeight: '90dvh',
        borderTopLeftRadius: glass.radiusSheet,
        borderTopRightRadius: glass.radiusSheet,
        pb: safeArea.bottom,
        animation: 'sheetSlideUp 0.26s cubic-bezier(.32,.72,0,1)',
        '@keyframes sheetSlideUp': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      }
    : {
        width: '100%',
        maxWidth: 480,
        maxHeight: '85vh',
        mx: 2,
        borderRadius: '20px',
        animation: 'sheetFadeUp 0.22s cubic-bezier(.4,0,.2,1)',
        '@keyframes sheetFadeUp': {
          from: { opacity: 0, transform: 'scale(0.97) translateY(8px)' },
          to: { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
      };

  const overlay = (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(10px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.2)',
        animation: 'sheetFadeIn 0.18s ease-out',
        '@keyframes sheetFadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        ...sheetContainerSx,
      }}
    >
      <Box
        onClick={(event) => event.stopPropagation()}
        sx={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(40px) saturate(2)',
          WebkitBackdropFilter: 'blur(40px) saturate(2)',
          border: '0.5px solid rgba(255,255,255,0.7)',
          boxShadow: '0 -12px 48px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          ...sheetCardSx,
        }}
      >
        {isPhone && (
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
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            pt: isPhone ? 1 : 2,
            pb: 1.25,
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'rgba(0,0,0,0.88)',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={onClose}
            aria-label="close"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(0,0,0,0.05)',
              color: 'rgba(0,0,0,0.55)',
              cursor: 'pointer',
              transition: glass.transition,
              '&:active': { background: 'rgba(0,0,0,0.1)' },
            }}
          >
            <X size={18} strokeWidth={2.2} />
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pb: 3 }}>{children}</Box>
      </Box>
    </Box>
  );

  return createPortal(overlay, document.body);
};

export default InfoSheet;
