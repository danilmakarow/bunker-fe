'use client';

import { useState, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { bunkerTheme } from '@/theme/theme';
import { createQueryClient } from '@/infrastructure/query/query-client';
import ModalRoot from './modal-root';
import Toaster from './toaster';

interface ProvidersProps {
  locale: string;
  timeZone: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}

/**
 * Root client-side providers: emotion cache (SSR-safe), MUI theme,
 * TanStack Query, next-intl messages, the global modal root, and the
 * toast surface. Mounted once in the server layout.
 */
const Providers = ({ locale, timeZone, messages, children }: ProvidersProps) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true }}>
      <ThemeProvider theme={bunkerTheme}>
        <CssBaseline />
        <NextIntlClientProvider locale={locale} timeZone={timeZone} messages={messages}>
          <QueryClientProvider client={queryClient}>
            {children}
            <ModalRoot />
            <Toaster />
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            )}
          </QueryClientProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default Providers;
