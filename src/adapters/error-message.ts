import { ApiError } from '@/infrastructure/http/api-error';

/**
 * Stable error codes raised by bunker-api's exception filter.
 * Mirror of `ErrorCodesEnum` in `bunker-api/src/common/constants/error-codes.ts`.
 */
export type BackendErrorCode =
  | 'E_UNKNOWN'
  | 'E_BAD_REQUEST'
  | 'E_VALIDATION'
  | 'E_UNAUTHORIZED'
  | 'E_FORBIDDEN'
  | 'E_NOT_FOUND'
  | 'E_ENTITY_NOT_FOUND'
  | 'E_CONFLICT'
  | 'E_INTERNAL_SERVER_ERROR'
  | 'E_QUERY_FAILURE';

/**
 * Maps an error from a mutation/query to a key under the `errors` namespace
 * in `messages/uk.json`. Falls back to a generic message when nothing
 * specific applies — the BE's `errorMessage` is English, never shown to users.
 */
export const errorMessageKey = (error: unknown): string => {
  if (!(error instanceof ApiError)) return 'generic';

  if (error.status === 401) return 'unauthorized';
  if (error.status === 403) return 'forbidden';
  if (error.status === 404) return 'roomNotFound';

  if (error.status === 409) {
    const text = error.message?.toLowerCase() ?? '';
    if (text.includes('full')) return 'roomFull';
    if (text.includes('kicked')) return 'youWereKicked';
    if (text.includes('cannot join')) return 'roomNotInLobby';
    if (text.includes('kick themselves')) return 'cannotKickSelf';
    return 'conflict';
  }

  return 'generic';
};
