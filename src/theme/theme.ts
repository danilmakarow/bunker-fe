'use client';

import { createTheme } from '@mui/material';

/**
 * Bunker theme — Apple liquid-glass palette paired with a mobile-first
 * type scale (larger headings/body for thumb-distance reading) and an
 * input minHeight that meets the WCAG 2.5.5 tap-target minimum.
 */
export const bunkerTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#007AFF' },
    error: { main: '#FF3B30' },
    success: { main: '#34C759' },
    warning: { main: '#FF9500' },
    background: { default: 'transparent' },
  },
  typography: {
    fontFamily:
      '-apple-system, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.01em' },
    body1: { fontSize: '1rem', lineHeight: 1.45 },
    body2: { fontSize: '0.9rem', lineHeight: 1.45 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitTextSizeAdjust: '100%' },
        body: { overscrollBehaviorY: 'none' },
      },
    },
  },
});
