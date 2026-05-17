# bunker-fe

Next.js client for the **Бункер / Shelter** party game. The frontend is a thin polling client — all state lives in [`bunker-api`](../bunker-api). Refresh the tab at any point and you land back where you were.

UI is Ukrainian (`uk`). The i18n plumbing is in place so adding `en` is just another JSON file under [`messages/`](messages/).

## Stack

- **Next.js 15** (App Router, React 19, TypeScript strict)
- **MUI v6 + Emotion** — Apple-style liquid-glass primitives in [`src/components/glass.tsx`](src/components/glass.tsx); shared tokens in [`src/theme/tokens.ts`](src/theme/tokens.ts)
- **TanStack Query** — server state, polling, retries ([`src/lib/query/`](src/lib/query/))
- **next-intl v3** — `uk` only at v1; `Europe/Kyiv` time zone is pinned in [`src/i18n/request.ts`](src/i18n/request.ts)
- **Zustand** — one global store: the imperative modal channel in [`src/lib/modal/modal-store.ts`](src/lib/modal/modal-store.ts)
- **sonner** — toasts via the helpers in [`src/lib/notify.ts`](src/lib/notify.ts)
- **lucide-react** — icons

## Getting started

Prereqs: Node 22+, pnpm, and a running `bunker-api` (see its README).

```bash
pnpm install
cp .env.local.example .env.local   # then edit API_ORIGIN if needed
pnpm dev                           # http://localhost:3001 (or whichever free port Next picks)
```

If `bunker-api` is on port 3000, the FE dev server will likely take 3001. Adjust `API_ORIGIN` in `.env.local` if the API moves.

### Useful scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | `next lint` |
| `pnpm typecheck` | `tsc --noEmit` |

## How requests reach the API

The browser always talks to `/api/*` on its own origin. Two layers handle the redirect:

- **Local dev** — [`next.config.ts`](next.config.ts) rewrites `/api/:path*` → `${API_ORIGIN}/api/:path*`. Same-origin in the browser means the `bunker_session` cookie just works.
- **Server-side** — `apiRequest` in [`src/lib/api/api-client.ts`](src/lib/api/api-client.ts) hits `${API_ORIGIN}/api` directly and forwards cookies for SSR.

Every API response is unwrapped from the BE's `{ status, data, errorMessage, ... }` envelope by `apiRequest`. Never assume raw resources come back — always go through that wrapper.

## Auth

Google OAuth runs entirely on the API. The flow:

1. User clicks **Увійти через Google** → browser navigates to `${API_ORIGIN}/api/auth/google`
2. API completes OAuth, sets HttpOnly cookie `bunker_session`, redirects to `/home`
3. Every `fetch` from the FE uses `credentials: 'include'`. There is no token in JS.

Logout = `POST /auth/logout` then `router.replace('/')`.

## Pages

```
/                  landing (SSR static) — Sign in with Google
/home              greeting + Create / Join (SSR force-dynamic)
/join              4-letter code form
/room/[code]       lobby — participants, start button, kick (admin)
/game/[code]       game — apocalypse / shelter, own card, others' cards with reveal slots
```

`page.tsx` in each routed folder is a tiny server shell that renders a colocated `_components/` client island. This lets `force-dynamic` coexist with `'use client'` and avoids `useTranslations` running during prerender.

## Polling discipline

- **One** polling query per route. Don't poll `/me` on the lobby page — the user is already in memory.
- Lobby polls `useRoom(code)`; game polls `useGame(code)`. The `enabled` flags gate them by route.
- Both run with `refetchIntervalInBackground: true` so alt-tabbed players still pick up the lobby → game transition within ~1 s.
- After every mutation, invalidate the matching room/game query — don't optimistically update participant lists; let the next poll be the source of truth.

## Conventions

- TypeScript strict, no `any`. Add to [`src/lib/api/types.ts`](src/lib/api/types.ts) when a shape is missing.
- All visible strings come from [`messages/uk.json`](messages/uk.json) — no hard-coded Ukrainian in components. Game content (apocalypse names, trait labels) comes from the API in Ukrainian and is rendered as-is.
- Arrow functions, early-exit pattern, no single-letter names.
- One global Zustand store only (the modal channel). Everything else is `useState` or React Query.

## Deployment (Vercel)

- Set `API_ORIGIN` in **Project Settings → Environment Variables** for Production / Preview / Development. The value must be a publicly reachable `https://…` origin of `bunker-api`.
- The rewrite and server-side `apiRequest` read `API_ORIGIN` at runtime — no rebuild needed when it changes.
- Vercel uses its own build output format; the `output: 'standalone'` flag in `next.config.ts` is suppressed when `VERCEL=1`.

## Project layout

```
src/
  app/            App Router pages (server shells + _components/ client islands)
  components/    Reusable UI: page-shell, app-bar, glass primitives, modals, sheet, cards…
  lib/
    api/         apiRequest, ApiError, auth helpers, response types
    game/        attribute taxonomy
    modal/       Zustand modal store + types
    query/       QueryClient, keys, useRoom/useGame/useMe + mutations
    notify.ts   sonner helpers
  theme/        MUI theme + design tokens (gradient, glass tints, radii)
  i18n/         next-intl request/config
messages/        uk.json (and en.json one day)
public/         static assets (bg.jpg, etc.)
```

Implementation plan and design decisions live in [`TASK.md`](TASK.md).
