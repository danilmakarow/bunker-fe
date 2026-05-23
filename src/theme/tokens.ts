/**
 * Shared glass design tokens.
 * Keep all magic values for the Apple liquid-glass aesthetic here so
 * components stay consistent and tokens can be swapped centrally.
 */
export const glass = {
  bg: 'rgba(0,0,0,0.40)',
  bgHover: 'rgba(0,0,0,0.50)',
  bgFocus: 'rgba(0,0,0,0.46)',
  border: 'rgba(255,255,255,0.20)',
  borderHover: 'rgba(255,255,255,0.32)',
  blur: 'blur(24px) saturate(1.6)',
  shadow: '0 1px 3px rgba(0,0,0,0.06)',
  shadowLg: '0 8px 32px rgba(0,0,0,0.08)',
  radius: '14px',
  radiusLg: '22px',
  radiusSheet: '24px',
  transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
} as const;

/**
 * Photo background used by the root layout — rendered behind a blur layer
 * so the white-glass primitives keep their contrast over any region of the
 * image.
 */
export const bunkerBackgroundImage = 'url(/bg.jpg)';

/** Warm-dusk fallback gradient — paints under the photo until it loads. */
export const bunkerBackgroundFallback =
  'linear-gradient(180deg, #f3b27a 0%, #d99873 28%, #a07a8a 60%, #4f5c75 100%)';

/** Blur applied to the background photo so foreground glass stays readable. */
export const bunkerBackgroundBlur = 'blur(28px) saturate(1.1)';

/** Top-of-gradient solid colour — used for the iOS status-bar tint and meta theme-color. */
export const themeColor = '#f3b27a';

/**
 * Default text colours — light by design, applied app-wide via the theme
 * palette + CssBaseline so copy reads against the dusky background photo.
 */
export const text = {
  primary: 'rgba(255,255,255,0.95)',
  secondary: 'rgba(255,255,255,0.72)',
} as const;

/**
 * Mobile-first layout constants.
 * Centralised so every fixed-chrome component reads the same numbers
 * (AppBar height, sticky-footer reserve, content gutter).
 */
export const layout = {
  appBarHeight: 56,
  contentGutter: { xs: 2, sm: 3 } as const,
  phoneBreakpoint: 640,
  /** Minimum tap-target side per Apple HIG / WCAG 2.5.5. */
  minTapTarget: 48,
} as const;

/**
 * Safe-area CSS helpers. `env(safe-area-inset-*)` returns 0 outside iOS
 * standalone PWAs, so they're safe to apply everywhere.
 */
export const safeArea = {
  top: 'env(safe-area-inset-top, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
} as const;
