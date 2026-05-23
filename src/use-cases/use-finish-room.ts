'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/infrastructure/http/api-client';
import type { RoomSnapshot } from '@/entities';
import { queryKeys } from './query-keys';

/**
 * POST /rooms/:code/finish — admin transitions IN_GAME → FINISHED.
 * Used by the game screen (M5 wiring); included now for parity with the
 * other lifecycle mutations.
 */
export const useFinishRoom = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<RoomSnapshot>(`/rooms/${code}/finish`, { method: 'POST' }),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(queryKeys.room(snapshot.code), snapshot);
    },
  });
};
