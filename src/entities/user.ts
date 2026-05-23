/**
 * Authenticated user identity. Kept in lockstep with the bunker-api DTO
 * (post-envelope-unwrap inner payload, not the wire format).
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}
