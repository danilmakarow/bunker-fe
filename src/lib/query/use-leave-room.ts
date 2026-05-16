'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/api-client';
import { queryKeys } from './keys';

/**
 * POST /rooms/:code/leave — voluntary leave. Idempotent for non-JOINED
 * callers. After success we drop the cached snapshot since polling stops
 * once the caller leaves.
 */
export const useLeaveRoom = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<void>(`/rooms/${code}/leave`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.room(code) });
    },
  });
};
