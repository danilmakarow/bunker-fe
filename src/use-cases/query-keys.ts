/**
 * Centralised TanStack Query keys.
 * Use factory functions so refactors stay typo-safe and invalidations
 * are colocated with the query definitions.
 */
export const queryKeys = {
  me: () => ['me'] as const,
  room: (code: string) => ['room', code] as const,
  game: (code: string) => ['game', code] as const,
  backoffice: {
    users: () => ['backoffice', 'users'] as const,
    apocalypses: () => ['backoffice', 'apocalypses'] as const,
    shelters: () => ['backoffice', 'shelters'] as const,
    traits: () => ['backoffice', 'traits'] as const,
    biology: (axis: string) => ['backoffice', 'biology', axis] as const,
  },
};
