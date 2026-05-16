'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/api-client';
import type { User } from '@/lib/api/types';
import { queryKeys } from './keys';

/**
 * Returns the currently signed-in user, or null if the session cookie is
 * missing/invalid. No polling — the user identity is stable for a session.
 */
export const useMe = () =>
  useQuery<User | null>({
    queryKey: queryKeys.me(),
    queryFn: async () => {
      try {
        return await apiRequest<User>('/auth/me');
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
