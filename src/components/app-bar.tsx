'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { glass, layout, safeArea } from '@/theme/tokens';

interface AppBarBackProp {
  /** Navigate to this URL when the back button is tapped. */
  href?: string;
  /** Custom handler instead of router navigation. */
  onClick?: () => void;
  /** Accessible label override (defaults to "Назад"). */
  label?: string;
}

interface AppBarProps {
  title?: string;
  back?: AppBarBackProp;
  /** Slot rendered on the right side (e.g. logout icon, kebab menu). */
  trailing?: ReactNode;
}

/**
 * Fixed top app-bar with iOS-style frosted blur, hairline bottom border,
 * and safe-area-aware top padding so it clears the notch in PWA standalone.
 * Title is centred; back arrow lives in the leading slot when `back` is set.
 */
const AppBar = ({ title, back, trailing }: AppBarProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (back?.onClick) {
      back.onClick();
      return;
    }
    if (back?.href) {
      router.push(back.href);
      return;
    }
    router.back();
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        pt: safeArea.top,
        background: 'rgba(255,255,255,0.28)',
        backdropFilter: glass.blur,
        WebkitBackdropFilter: glass.blur,
        borderBottom: '0.5px solid rgba(255,255,255,0.35)',
      }}
    >
      <Box
        sx={{
          height: layout.appBarHeight,
          display: 'grid',
          gridTemplateColumns: '56px 1fr 56px',
          alignItems: 'center',
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          {back && (
            <Box
              component="button"
              type="button"
              onClick={handleBack}
              aria-label={back.label ?? 'Назад'}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'rgba(0,122,255,0.95)',
                transition: glass.transition,
                '&:active': { background: 'rgba(0,0,0,0.05)' },
              }}
            >
              <ArrowLeft size={24} strokeWidth={2.4} />
            </Box>
          )}
        </Box>

        <Typography
          component="h1"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'rgba(0,0,0,0.85)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{trailing}</Box>
      </Box>
    </Box>
  );
};

export default AppBar;
