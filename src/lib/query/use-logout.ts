'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/api-client';
import { queryKeys } from './keys';

/**
 * POST /auth/logout — clears the bunker_session cookie on the BE, then
 * removes the cached `me` query so any subsequent useMe() refetches.
 *
 * Navigation away from `/home` after success is left to the caller (it
 * needs to also trigger `router.refresh()` so the SSR layer re-evaluates
 * the cookie state and the landing page renders the login screen).
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.me() });
    },
  });
};
