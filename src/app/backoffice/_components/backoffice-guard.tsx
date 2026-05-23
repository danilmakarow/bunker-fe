import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/use-cases/get-current-user';
import type { User } from '@/entities';

/**
 * Server-side admin gate. Mirrors the BE's `AdminGuard`:
 *
 *   - missing/invalid session → `/`
 *   - logged-in but `!isAdmin` → `/home`
 *
 * Returning the user lets callers render their greeting/avatar without a
 * second fetch.
 */
export const requireAdmin = async (): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/start');
  }

  if (!user.isAdmin) {
    redirect('/home');
  }

  return user;
};
