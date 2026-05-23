'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Global toast surface. Mounted once at the root layout level.
 * Styled to match the Apple liquid-glass aesthetic.
 */
const Toaster = () => (
  <SonnerToaster
    position="top-center"
    duration={4000}
    closeButton
    toastOptions={{
      style: {
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        border: '0.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        color: 'rgba(255,255,255,0.85)',
        borderRadius: '14px',
        fontFamily:
          '-apple-system, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", sans-serif',
      },
    }}
  />
);

export default Toaster;
