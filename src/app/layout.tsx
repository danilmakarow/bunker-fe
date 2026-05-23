import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import {
  getLocale,
  getMessages,
  getTimeZone,
  unstable_setRequestLocale,
} from 'next-intl/server';
import Providers from '@/components/providers';
import {
  bunkerBackgroundBlur,
  bunkerBackgroundFallback,
  bunkerBackgroundImage,
} from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Бункер',
  description: 'Психологічна гра про виживання в укритті після апокаліпсису.',
  appleWebApp: {
    capable: true,
    title: 'Бункер',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  // No theme-color / color-scheme on purpose. A solid tint can't be an image,
  // and color-scheme:dark forced an opaque black toolbar over the page. Left
  // unset, iOS Safari uses its translucent chrome, which frost-samples the
  // full-bleed background photo (the fixed inset:0 layer) sitting behind it.
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Server-rendered root layout. Loads the active locale + messages once,
 * pipes them into the client `Providers` component, and paints the
 * warm-dusk gradient that all glass primitives sit on top of.
 *
 * `viewport-fit=cover` + `apple-mobile-web-app-status-bar-style=black-translucent`
 * make iOS standalone PWAs render full-bleed under the notch / home bar
 * so `env(safe-area-inset-*)` can be honoured by the chrome.
 */
const RootLayout = async ({ children }: RootLayoutProps) => {
  const locale = await getLocale();
  unstable_setRequestLocale(locale);
  const [messages, timeZone] = await Promise.all([getMessages(), getTimeZone()]);

  return (
    <html
      lang={locale}
      style={{
        background: bunkerBackgroundFallback,
        minHeight: '100%',
      }}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          background: 'transparent',
          isolation: 'isolate',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        {/*
          Background photo lives in its own fixed layer so it always paints the
          full visual viewport — including the strip iOS Safari covers with its
          collapsible URL bar. Decoupling it from body avoids the white seam
          that appears when 100dvh shrinks under the toolbar. `isolation:
          isolate` on body anchors this negative-z layer above the body
          background (transparent) but below in-flow content.
        */}
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            backgroundImage: bunkerBackgroundImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: bunkerBackgroundBlur,
            transform: 'scale(1.08)',
            pointerEvents: 'none',
          }}
        />
        <Providers locale={locale} timeZone={timeZone} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
