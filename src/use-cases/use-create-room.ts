'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/infrastructure/http/api-client';
import type { RoomSnapshot } from '@/entities';
import { queryKeys } from './query-keys';

/**
 * POST /rooms — create a new room. Caller becomes admin and seat #1.
 * Seeds the room cache with the returned snapshot so the next navigation
 * to /room/[code] paints immediately without a loading flash.
 */
export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<RoomSnapshot>('/rooms', { method: 'POST' }),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(queryKeys.room(snapshot.code), snapshot);
    },
  });
};
