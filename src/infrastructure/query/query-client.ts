'use client';

import { QueryClient } from '@tanstack/react-query';
import { DEFAULT_STALE_TIME_MS } from '@/shared/timing';

/**
 * Build a fresh QueryClient. Called once per browser session.
 * - 1 retry on transient errors
 * - 30 s default staleTime so the lobby/game polls (which set their own
 *   refetchInterval) remain the source of truth
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: DEFAULT_STALE_TIME_MS,
        refetchOnWindowFocus: false,
      },
    },
  });
