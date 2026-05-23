'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/infrastructure/http/api-client';
import type { User } from '@/entities';
import { USER_STALE_TIME_MS } from '@/shared/timing';
import { queryKeys } from './query-keys';

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
    staleTime: USER_STALE_TIME_MS,
  });
