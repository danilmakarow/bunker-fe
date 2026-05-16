'use client';

import type { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import { glass, safeArea } from '@/theme/tokens';

interface StickyActionBarProps {
  children: ReactNode;
}

/**
 * Fixed bottom action surface — anchors primary CTAs above the home bar.
 * Always thumb-reachable, survives keyboard open, blurs page content
 * scrolling underneath. Use AppShell's `footer` slot to mount it.
 */
const StickyActionBar = ({ children }: StickyActionBarProps) => (
  <Box
    component="footer"
    sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1100,
      background: 'rgba(255,255,255,0.28)',
      backdropFilter: glass.blur,
      WebkitBackdropFilter: glass.blur,
      borderTop: '0.5px solid rgba(255,255,255,0.35)',
      pb: `calc(${safeArea.bottom} + 12px)`,
      pt: 1.5,
      px: 2,
    }}
  >
    <Stack spacing={1}>{children}</Stack>
  </Box>
);

export default StickyActionBar;
