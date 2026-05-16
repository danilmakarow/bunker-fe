'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/api-client';
import type { RoomSnapshot } from '@/lib/api/types';
import { queryKeys } from './keys';

/**
 * Polls the lobby snapshot for a given room code at 1 Hz while the tab
 * is visible. Background tabs fall back to a slow 5 s tick so the
 * lobby→game transition is still picked up reasonably fast.
 */
export const useRoom = (code: string, enabled = true) =>
  useQuery<RoomSnapshot>({
    queryKey: queryKeys.room(code),
    queryFn: ({ signal }) => apiRequest<RoomSnapshot>(`/rooms/${code}`, { signal }),
    enabled: enabled && code.length > 0,
    refetchInterval: (query) => (query.state.status === 'success' ? 1000 : false),
    refetchIntervalInBackground: true,
  });
