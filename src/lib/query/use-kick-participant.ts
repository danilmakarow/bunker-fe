'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/api-client';
import type { RoomSnapshot } from '@/lib/api/types';
import { queryKeys } from './keys';

interface KickParticipantVariables {
  userId: string;
}

/**
 * DELETE /rooms/:code/participants/:userId — admin kicks a participant.
 * BE returns the fresh snapshot; we write it to cache directly so the
 * participant list updates without waiting for the next poll tick.
 */
export const useKickParticipant = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: KickParticipantVariables) =>
      apiRequest<RoomSnapshot>(`/rooms/${code}/participants/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(queryKeys.room(snapshot.code), snapshot);
    },
  });
};
