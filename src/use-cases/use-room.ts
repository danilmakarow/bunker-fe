'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/infrastructure/http/api-client';
import type { RoomSnapshot } from '@/entities';
import { POLL_INTERVAL_MS } from '@/shared/timing';
import { queryKeys } from './query-keys';

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
    refetchInterval: (query) => (query.state.status === 'success' ? POLL_INTERVAL_MS : false),
    refetchIntervalInBackground: true,
  });
