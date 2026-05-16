'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/api-client';
import type { RoomSnapshot } from '@/lib/api/types';
import { queryKeys } from './keys';

interface JoinRoomVariables {
  code: string;
}

/**
 * POST /rooms/:code/join — idempotent for already-JOINED callers; flips
 * LEFT→JOINED; rejects KICKED with 403. Returns the fresh snapshot which
 * we use to seed the room cache before navigating to /room/[code].
 */
export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code }: JoinRoomVariables) =>
      apiRequest<RoomSnapshot>(`/rooms/${code}/join`, { method: 'POST' }),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(queryKeys.room(snapshot.code), snapshot);
    },
  });
};
