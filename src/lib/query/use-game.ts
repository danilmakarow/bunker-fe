'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/api-client';
import type { GameSnapshot } from '@/lib/api/types';
import { queryKeys } from './keys';

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
    refetchInterval: (query) => (query.state.status === 'success' ? 1000 : false),
    refetchIntervalInBackground: true,
  });
