'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/infrastructure/http/api-client';
import type { RoomSnapshot } from '@/entities';
import { queryKeys } from './query-keys';

/**
 * POST /rooms/:code/start — admin starts the game. BE lands this endpoint
 * in M4; until then this mutation 404s and the caller surfaces a generic
 * error toast. Wiring is in place so the Start button works the moment
 * the BE goes live.
 */
export const useStartGame = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<RoomSnapshot>(`/rooms/${code}/start`, { method: 'POST' }),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(queryKeys.room(snapshot.code), snapshot);
    },
  });
};
