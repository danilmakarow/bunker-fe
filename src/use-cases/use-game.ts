'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/infrastructure/http/api-client';
import type { GameSnapshot } from '@/entities';
import { POLL_INTERVAL_MS } from '@/shared/timing';
import { queryKeys } from './query-keys';

/**
 * Polls the in-game snapshot for a given room code at 1 Hz while
 * the player is on the game screen. See useRoom for the analogous
 * lobby polling logic.
 */
export const useGame = (code: string, enabled = true) =>
  useQuery<GameSnapshot>({
    queryKey: queryKeys.game(code),
    queryFn: ({ signal }) => apiRequest<GameSnapshot>(`/rooms/${code}/game`, { signal }),
    enabled: enabled && code.length > 0,
    refetchInterval: (query) => (query.state.status === 'success' ? POLL_INTERVAL_MS : false),
    refetchIntervalInBackground: true,
  });
