import { ApiError } from './api-error';

type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /**
   * Forward a cookie header from a Next.js Server Component / Route Handler.
   * Necessary for SSR data fetching since the bunker_session HttpOnly cookie
   * cannot be inferred outside the browser.
   */
  cookie?: string;
}

/**
 * Wire-format envelope returned by every bunker-api endpoint. The BE wraps
 * both success and error responses via `ResponseWrapperInterceptor` so the
 * FE branches on `status` once and unwraps `data`.
 *
 * Mirror of the `StandardResponse<T>` declared in bunker-api at
 * `src/services/unify-response.service.ts`.
 */
interface StandardResponse<T = unknown> {
  status: 'Success' | 'Error';
  hasData: boolean;
  data: T;
  errorCode?: string;
  errorStatusCode?: number;
  errorMessage?: string;
}

const isStandardResponse = (value: unknown): value is StandardResponse => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<StandardResponse>;
  return (
    (candidate.status === 'Success' || candidate.status === 'Error') &&
    'hasData' in candidate
  );
};

/**
 * Resolve the base URL for API requests.
 *
 * The bunker-api mounts every controller under a global `/api` prefix.
 * - In the browser we use the Next.js `/api` rewrite (same-origin so cookies
 *   match) — the rewrite already preserves the prefix when forwarding to BE.
 * - On the server we hit the BE directly, so we add `/api` ourselves.
 */
const resolveBaseUrl = (): string => {
  if (typeof window !== 'undefined') return '/api';
  const origin = process.env.API_ORIGIN ?? 'http://localhost:3000';
  return `${origin}/api`;
};

/**
 * Single typed fetch wrapper used by every query/mutation hook.
 *
 * Unwraps the bunker-api `StandardResponse` envelope so callers receive the
 * inner `data` payload directly. On non-2xx (or Error-status envelopes)
 * throws an `ApiError` carrying the BE's `errorCode` + `errorMessage`.
 */
export const apiRequest = async <TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> => {
  const { method = 'GET', body, headers, signal, cookie } = options;
  const url = `${resolveBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const init: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    cache: 'no-store',
  };

  const response = await fetch(url, init);

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload: unknown = isJson ? await response.json() : await response.text();

  if (isStandardResponse(payload)) {
    if (payload.status === 'Success' && response.ok) {
      return payload.data as TResponse;
    }
    throw new ApiError(
      payload.errorMessage ?? response.statusText ?? 'Request failed',
      payload.errorStatusCode ?? response.status,
      payload.errorCode,
      payload,
    );
  }

  if (!response.ok) {
    throw new ApiError(response.statusText || 'Request failed', response.status, undefined, payload);
  }

  return payload as TResponse;
};
