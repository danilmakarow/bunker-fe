/**
 * Cross-cutting timing constants. Shared by the data-fetching use-cases and
 * the query-client/infrastructure so the same numbers aren't re-declared per
 * hook. Pure values — no framework or domain coupling.
 */

/** Lobby / game snapshot poll cadence while a screen is mounted (ms). */
export const POLL_INTERVAL_MS = 1000;

/** Default cache freshness window for queries (ms). */
export const DEFAULT_STALE_TIME_MS = 30_000;

/** User-identity cache freshness — identity is stable for a session (ms). */
export const USER_STALE_TIME_MS = 60_000;

/** Abort budget for the SSR auth lookup before degrading to login (ms). */
export const SSR_AUTH_TIMEOUT_MS = 3_000;
