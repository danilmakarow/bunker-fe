import 'server-only';
import { cookies } from 'next/headers';
import { apiRequest } from '@/infrastructure/http/api-client';
import { ApiError } from '@/infrastructure/http/api-error';
import type { User } from '@/entities';
import { SSR_AUTH_TIMEOUT_MS } from '@/shared/timing';

/**
 * Server-only helper that reads the request's session cookie, forwards it
 * to `${API_ORIGIN}/api/auth/me`, and returns the authenticated user — or
 * `null` if the cookie is missing/invalid, the BE returns 401, the BE is
 * down, or the request exceeds {@link SSR_AUTH_TIMEOUT_MS}.
 *
 * Returning `null` instead of throwing keeps page-level redirect logic
 * trivial (`if (!user) redirect('/start')`) and means a transient BE outage
 * gracefully degrades to the login screen rather than a 500.
 *
 * Calling `cookies()` automatically opts the calling route into dynamic
 * rendering — no `export const dynamic = 'force-dynamic'` needed.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SSR_AUTH_TIMEOUT_MS);

  try {
    return await apiRequest<User>('/auth/me', {
      cookie: cookieHeader,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    return null;
  } finally {
    clearTimeout(timer);
  }
};
