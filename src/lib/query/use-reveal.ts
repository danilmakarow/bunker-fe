'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/api-client';
import type { AttributeKind, GameSnapshot } from '@/lib/api/types';
import { queryKeys } from './keys';

interface RevealVariables {
  attribute: AttributeKind;
  /** Required for multi-card kinds (currently only ACTION_CARD). */
  traitId?: string;
}

/**
 * POST /rooms/:code/game/reveal — reveals one of the caller's own attributes.
 *
 * BE returns the freshly updated game snapshot; we write it to the cache
 * directly so the slot flips locally without waiting for the next poll
 * tick. Other players will see the update on their next 1 Hz poll.
 *
 * Idempotent: re-revealing the same attribute returns the same snapshot
 * without surfacing an error.
 */
export const useReveal = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attribute, traitId }: RevealVariables) =>
      apiRequest<GameSnapshot>(`/rooms/${code}/game/reveal`, {
        method: 'POST',
        body: { attribute, traitId },
      }),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(queryKeys.game(snapshot.code), snapshot);
    },
  });
};
