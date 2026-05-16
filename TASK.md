# Bunker — Frontend (Next.js) — Implementation Plan

## 1. Overview

Next.js client for the "Bunker" / "Shelter" party game. All state lives on the API (`bunker-api`); the FE is a thin polling client. UI strings are in Ukrainian via i18n (`uk` is the only locale shipped at v1, but the i18n plumbing must be in place so adding `en` later is just a JSON file).

The game has three screens after auth:
1. **Home** — Connect / Start new + Logout
2. **Room (lobby)** — code, participants, start button, admin kick controls
3. **Game** — apocalypse + shelter, my character, other players' cards with reveal interaction, exit button

State is **never** stored only on the client. On every page mount we re-fetch from the API, and we re-fetch on a 1s poll while on room/game pages. This makes reconnection automatic — refresh the tab and you're back in the same place.

## 2. Tech stack

- **Framework:** Next.js 15 (App Router). `/` is SSR-static, `/home` is SSR-dynamic per request, the rest are SPA shells (server entry → client form/feature). See §13 for the rationale and the `page.tsx` + `_components/` split pattern.
- **Language:** TypeScript strict, no `any`
- **Styling:** MUI v6 + Emotion, with the Apple liquid-glass primitives ported 1:1 from [`checkout-flow-demo/app/components/`](~/projects/checkout-flow-demo/app/components). Tailwind was dropped — keeping a single styling system avoids fighting Emotion's `sx` and the glass tokens. SSR-safe via `@mui/material-nextjs/v15-appRouter`'s `AppRouterCacheProvider`. Shared design tokens live in [`src/theme/tokens.ts`](src/theme/tokens.ts).
- **Data fetching:** TanStack Query (React Query). Built-in polling, request dedup, retries, cache; way better than rolling our own with `setInterval`. Client created in [`src/lib/query/query-client.ts`](src/lib/query/query-client.ts).
- **Auth:** Server-side via the API. FE has no NextAuth. The user clicks "Sign in with Google" → browser navigates to `${API_URL}/auth/google` → API completes OAuth and sets an HttpOnly cookie `bunker_session`, then redirects to `/home`. The FE never touches the token directly; every `fetch` runs with `credentials: 'include'`.
- **i18n:** `next-intl` v3 (App-Router-native, type-safe with `messages/uk.json`). `timeZone` is pinned to `Europe/Kyiv` in [`src/i18n/request.ts`](src/i18n/request.ts) so SSR and CSR formatting never drift.
- **Forms:** native + `react-hook-form` if any form gets >2 fields (probably overkill for v1; just the 4-letter code input — see [`src/components/code-input.tsx`](src/components/code-input.tsx)).
- **Icons:** lucide-react
- **State:** TanStack Query for server state. For local UI state, `useState`. **One global Zustand store only** — the modal channel at [`src/lib/modal/modal-store.ts`](src/lib/modal/modal-store.ts), needed because confirm/alert/prompt dialogs are imperative and fired from arbitrary callers (see §14). No Redux.
- **Toasts:** `sonner`, with one `<Toaster />` mounted in providers ([`src/components/toaster.tsx`](src/components/toaster.tsx)). Thin helpers in [`src/lib/notify.ts`](src/lib/notify.ts).

## 3. Pages & routes (App Router)

```
src/app/
  layout.tsx                      -- SSR root: next-intl getLocale/getMessages/getTimeZone,
                                     viewport meta (viewport-fit=cover, max=1), apple meta,
                                     full-bleed gradient body. Mounts <Providers>.
  page.tsx                        -- "/" landing (SSR static). Pure hero + "Sign in with Google" anchor.
  home/
    page.tsx                      -- "/home" (SSR, force-dynamic). Greeting + avatar server-rendered.
    _components/home-actions.tsx  -- client island: Create/Join sticky CTAs + Logout app-bar button.
  join/
    page.tsx                      -- server shell, force-dynamic.
    _components/join-form.tsx     -- 'use client' PIN code form + submit.
  room/[code]/page.tsx            -- "/room/ABCD" — client component, dynamic by virtue of [code].
  game/[code]/page.tsx            -- "/game/ABCD" — client component, dynamic by virtue of [code].
  manifest.ts                     -- PWA manifest (§15).
  icon.tsx | apple-icon.tsx       -- procedurally generated PNGs via ImageResponse (§15).
```

Why `/room/[code]` and `/game/[code]` as separate routes: the URL becomes shareable and reconnection is trivial — pasting the URL after a refresh lands you in the right place because the route fetches the room state and renders accordingly. If the room is `IN_GAME` when you visit `/room/ABCD`, we redirect to `/game/ABCD`, and vice versa. The poll handles the lobby→game transition for everyone else.

### Server-shell / client-island pattern

Where a route needs SSR/cookies (`/home`) or `force-dynamic` (`/join`), the `page.tsx` is a tiny server component that renders a client component from a colocated `_components/` folder. This:
- Lets us declare `export const dynamic = 'force-dynamic'` on a client-led screen (route segment config can't be exported from a `'use client'` module).
- Keeps `useTranslations` calls inside client components from running during static prerender (which otherwise trips `ENVIRONMENT_FALLBACK`).
- Splits the SSR shell from interactive logic without inventing a third layer.

### Route guards (client-side)

- Unauthenticated → redirect to `/`.
- Authenticated but not a participant of `[code]` → API returns 403 → we show a friendly error and a link back to `/home`.

## 4. Data layer

Implemented in M1, ready to wire up as BE endpoints land:

- [`src/lib/api/api-client.ts`](src/lib/api/api-client.ts) — single `apiRequest<T>()` wrapper. `credentials: 'include'`, JSON in/out, throws typed [`ApiError`](src/lib/api/api-error.ts) on non-2xx (so React Query's `error` is well-typed). Resolves base URL per environment: browser → `/api` (via [`next.config.ts`](next.config.ts) rewrite to `${API_ORIGIN}/api/:path*`); server → `${API_ORIGIN}/api` directly. Supports a `cookie` option for SSR cookie forwarding.
- **BE response envelope:** bunker-api wraps every response via `ResponseWrapperInterceptor` as `{ status: 'Success' | 'Error', hasData, data, errorCode?, errorStatusCode?, errorMessage? }`. `apiRequest` unwraps `data` on success and throws `ApiError(message=errorMessage, status=errorStatusCode, code=errorCode)` on error envelopes. **Never assume the BE returns the raw resource** — always go through `apiRequest`. If you ever see `user.name` undefined on a typed response, suspect a bypass of the unwrap.
- [`src/lib/api/types.ts`](src/lib/api/types.ts) — placeholder type contracts mirroring `bunker-api/TASK.md` (User, RoomSnapshot, GameSnapshot, etc.). These describe the **inner payload** (post-unwrap), not the wire format. Tighten as the BE solidifies.
- Query keys colocated in [`src/lib/query/keys.ts`](src/lib/query/keys.ts):

```ts
queryKeys.me()                // ['me']
queryKeys.room(code)          // ['room', code]
queryKeys.game(code)          // ['game', code]
```

- Hook skeletons (shipped in M1, return shape locked):

```ts
useMe()              // GET /auth/me, no polling, staleTime: 60s
useRoom(code)        // GET /rooms/:code,    refetchInterval: 1000 in lobby
useGame(code)        // GET /rooms/:code/game, refetchInterval: 1000 in game
```

Mutations to add as endpoints land (planned in M2–M5):
```ts
useCreateRoom()
useJoinRoom()         // wire CodeInput's onComplete to this
useLeaveRoom(code)
useKickParticipant(code, userId)
useStartGame(code)
useReveal(code)       // body: { attribute, traitId? }
useLogout()
```

After each mutation, invalidate the matching room/game query. Don't optimistically update server-driven lists like participants — let the next poll be the source of truth.

## 5. Polling discipline

- **Only one** polling query active per route. Don't poll `/me` on the room page; we already have the user.
- **Tab-hidden polling is on (slow-tick decision locked in §10).** [`use-room`](src/lib/query/use-room.ts) and [`use-game`](src/lib/query/use-game.ts) both set `refetchIntervalInBackground: true` so alt-tabbed players still pick up the lobby→game transition within ~1 s. If load becomes a concern at scale, drop to a 5 s interval when hidden via a `useVisibilityState` hook.
- When transitioning lobby → game (admin presses Start), one player's poll will return `status: IN_GAME`. On that response, push them to `/game/[code]`.
- Lobby query polls room snapshot; game query polls game snapshot. Don't run both at once — `enabled` flags on the hooks gate them by route.
- Honour ETag/`If-None-Match` if BE supports it (§7 in API plan) — `fetch` doesn't do this for us; we keep `version` from the last response and send it manually.

## 6. UX details per screen

### 6.1 `/` landing
- One button: "Увійти через Google" → window.location to `/api/auth/google` (or a button calling the API's redirect URL).
- If already authed (the layout did `useMe()` and got a user), redirect to `/home`.

### 6.2 `/home`
- Greeting with avatar.
- Two big buttons: **"Створити кімнату"** and **"Приєднатися"**.
- Logout icon top-right.

### 6.3 `/join`
- One input — 4 chars, uppercase-only, auto-advance focus. Use `inputMode="text"` and `maxLength={4}`.
- "Приєднатися" button. On success → `/room/[code]`.
- On error: friendly Ukrainian message (room not found / room full / game already started / you were kicked).

### 6.4 `/room/[code]` (lobby)
- Big room code, copyable.
- Apocalypse/Shelter NOT shown yet (they don't exist yet on BE).
- Participants list — avatar + name + seat number. Admin gets an "✕" next to non-self participants.
- "Розпочати гру" button — visible to all, disabled & with explanatory tooltip if:
  - You are not admin, or
  - Player count < 4.
- "Вийти з кімнати" (leave) button.
- On poll: if `status === IN_GAME`, push to `/game/[code]`. If we were kicked (we no longer appear / appear as KICKED), show modal "Вас виключено" then back to `/home`.

### 6.5 `/game/[code]` (game)
- Top bar: apocalypse summary, shelter summary (toggle to expand for full descriptions), "Вийти" button.
- My card — fully visible, all attributes shown.
- Other players — grid of cards. Each card shows seat # + name + avatar + a list of attribute slots. Unrevealed slots show the kind label and a lock icon; revealed slots show the value.
- The whole reveal interaction: see §6.6.
- On poll: re-render reveals. If room transitions to FINISHED, show summary screen.

### 6.6 Reveal interaction (locked: own-card only)

- Tap a slot on **your own** card → modal "Розкрити <kind>? Це буде видно всім гравцям." → Confirm → `useReveal()` mutation → on success the slot flips to revealed; everyone else sees it on their next 1s poll.
- Tapping someone else's locked slot does nothing (optional: small hint "Гравець ще не розкрив це поле").
- No inbox, no peer requests — the spec line "asks for approval" is interpreted as the player confirming their own action.

## 7. i18n setup

```
src/i18n/
  request.ts          -- next-intl config
messages/
  uk.json             -- the only locale at v1
```

- All visible strings come from the JSON file. No hard-coded Ukrainian in components.
- Game content (apocalypse names, trait labels) comes from the API in Ukrainian — we render whatever the API returns. We do **not** duplicate game content in `uk.json`.
- Number/date formatting via `next-intl`'s formatters; keep ICU MessageFormat for pluralization (e.g. "Гравців: {count, plural, one {...}}").
- `timeZone` is pinned to `Europe/Kyiv` in both the server request config and the client `NextIntlClientProvider`. Without this, next-intl raises `ENVIRONMENT_FALLBACK` on every render and SSR/CSR markup can drift.
- Add an `en` locale only when asked. The IDE's i18n-ally extension flags missing `en` keys — that's expected noise, ignore until a second locale lands.

## 8. Auth handling on the FE

Locked to the HttpOnly-cookie flow:

- FE navigates to `${API_URL}/auth/google`. API sets the `bunker_session` cookie on callback and redirects to `/home`.
- All `fetch` calls use `credentials: 'include'`. Cookie is `SameSite=Lax`, `HttpOnly`, `Secure` (prod), with a `Domain` covering both FE and API hosts in prod.
- **Local dev:** use `next.config.ts` `rewrites` to proxy `/api/*` to the API so the cookie origin matches the FE — avoids cross-site cookie issues entirely.
- Logout = `POST /auth/logout` (clears cookie) then `router.replace('/')`.
- An `AuthProvider` at the layout level exposes `{ user, loading }` to children via context, populated by `useMe()`. There is no token to hold in JS.

## 9. Component shape

Keep it boring. No premature design system. Pages composed from small components.

### Already shipped (M1)

```
src/components/
  page-shell.tsx              -- mobile-first column shell (§13). Slots: appBar, footer.
                                 Reserves padding for the chrome + safe-area insets.
  app-bar.tsx                 -- fixed top bar (back / title / trailing slot, blurred).
  sticky-action-bar.tsx       -- fixed bottom CTA surface (blurred, safe-area aware).
  liquid-modal.tsx            -- bottom-sheet on phone, centered iOS-alert on tablet+.
  modal-root.tsx              -- registry mounted in providers; dispatches active modal.
  toaster.tsx                 -- glass-themed <Toaster /> from sonner.
  providers.tsx               -- emotion cache + MUI theme + NextIntlClientProvider +
                                 QueryClientProvider + ModalRoot + Toaster.
  code-input.tsx              -- PIN-style 4-slot input (auto-advance, paste-fill, A–Z).
  glass.tsx                   -- ported Apple liquid-glass primitives:
                                 GlassCard, GlassFieldGroup, GlassInput, GlassTextInput,
                                 GlassSelect, GlassButton, GlassIconButton, GlassLabel,
                                 GlassCheckbox, GlassDivider, GlassAlert, GlassSpinner.
```

### To build (M2–M5)

```
src/components/
  participant-list.tsx        (M3) seat-ordered list rendering ParticipantRow children
  participant-row.tsx         (M3) avatar, name, seat #, admin badge, kick button slot
  player-card.tsx             (M4) own + others — props decide which slots are visible
  reveal-slot.tsx             (M4) one attribute; locked / revealed visual states
  game-top-bar.tsx            (M4) apocalypse + shelter pills + exit, slots into AppBar's trailing
```

Confirm dialogs (kick, leave, reveal, exit) are not separate components — they go through the global `confirm()` helper from [`src/lib/modal/modal-store.ts`](src/lib/modal/modal-store.ts). See §14.

## 10. Decisions (locked) and remaining open items

### Locked

- **Auth:** HttpOnly cookie via the API, `credentials: 'include'`, dev proxy via `next.config.ts` rewrites.
- **Reveal model:** own-card-only with a confirm dialog. No request/approval inbox.
- **Admin handoff:** server auto-promotes the next admin on leave/kick; FE just reads `adminUserId` from each poll and re-renders controls accordingly. No special UI step needed beyond a small toast "Ви тепер адміністратор кімнати" when the local user becomes admin.
- **Game end:** admin presses "Завершити гру" (calls `POST /rooms/:code/finish`). FE poll picks up `status: FINISHED` and shows a read-only post-mortem screen.
- **UI kit:** MUI v6 + Emotion + ported Apple liquid-glass primitives (from `checkout-flow-demo`). Tailwind and shadcn both dropped — see §2. Detailed mobile chrome architecture in §13.
- **Mobile chrome:** full-bleed app-shell with a fixed top AppBar and a fixed bottom StickyActionBar. Safe-area insets via `env(safe-area-inset-*)`. 48 px min tap targets. See §13.
- **Modal pattern:** single global modal store + ModalRoot. iOS bottom-sheet on phone (≤ sm breakpoint), centered iOS-alert on tablet+. Imperative `confirm()` / `alertModal()` / `prompt()` helpers. See §14.
- **Notification pattern:** single sonner `<Toaster />` mounted in providers. Imperative `notify.info/success/error/warning` helpers. See §14.
- **PWA:** full manifest + procedurally generated icons + `viewport-fit=cover` + `apple-mobile-web-app-status-bar-style=black-translucent` so iOS standalone renders full-bleed. No service worker (offline stays out of scope per §12). See §15.
- **Polling while tab hidden:** slow tick — keep the 1 s `refetchInterval` and set `refetchIntervalInBackground: true` so an alt-tabbed player still catches the lobby→game transition within a second. Implemented in [`use-room.ts`](src/lib/query/use-room.ts) / [`use-game.ts`](src/lib/query/use-game.ts).
- **Kick / leave / exit / reveal confirmation:** all confirms go through the global `confirm()` helper — destructive actions get `confirmColor: 'error'` and a hint message. No dedicated dialog components.

### Still open

1. **Room code sharing** — copy code, copy full link, or both? Recommendation: both, with copy-link as the primary action.
2. **Multiple slots of one kind on others' cards** (e.g. two action cards) — show two distinct locked slots from the start, or one collapsible slot? Recommendation: distinct slots — their existence isn't a spoiler.
3. **Reconnect into a `FINISHED` room** — show the read-only post-mortem (assuming BE returns it) or a "цю гру завершено" screen? Recommendation: post-mortem if BE keeps returning data.

## 11. Milestones

1. **M1 — Skeleton ✅ (shipped 2026-05-16)**
   Next.js 15 app with MUI v6 + Emotion + ported glass primitives (Tailwind replaced — see §2), TanStack Query, next-intl (`uk` + `Europe/Kyiv`), Zustand modal store, sonner toaster, mobile-first chrome (§13), bottom-sheet modals (§14), full PWA wiring (§15), 4-slot PIN code input. All routes 200 in SSR; dummy `/home` renders hardcoded user. The "tab-hidden polling" and "mobile layout pass" line items from M6 landed early in M1 as part of the mobile-first refactor.
2. **M2 — Auth wired ✅ (shipped 2026-05-16)**
   - SSR auth: [`src/lib/api/auth.ts`](src/lib/api/auth.ts) exposes `getCurrentUser()` — reads the request cookies via `next/headers`, forwards them to `/auth/me`, returns `User | null` (3 s timeout, 401 / network failure both degrade to `null`).
   - `/` redirects to `/home` if a valid cookie is present; `/home` redirects to `/` if not. Both routes are dynamic-by-virtue-of-`cookies()` (no `force-dynamic` export needed).
   - `DUMMY_USER` deleted; `/home` server-renders greeting + avatar from the real SSR fetch.
   - Logout: [`useLogout()`](src/lib/query/use-logout.ts) POSTs `/auth/logout`, removes the `me` query from cache, then [`HomeLogoutButton`](src/app/home/_components/home-actions.tsx) does `router.replace('/') + router.refresh()` so the SSR layer re-evaluates the cookie state.
   - **Fixed `/api` proxy mismatch:** the BE mounts everything under `app.setGlobalPrefix('api')`, so `next.config.ts` rewrites and `apiRequest` server `baseUrl` now both preserve the `/api` prefix (browser `/api/auth/me` → `${API_ORIGIN}/api/auth/me`).
   - Smoke-tested end-to-end against the running BE: no-cookie `/home` → 307 → `/`; bogus-cookie `/home` → 307 → `/`; `POST /api/auth/logout` → 204 from BE through the FE proxy; `GET /api/auth/google` → 302 → Google's consent URL with the configured ngrok callback.
3. **M3 — Lobby ✅ (shipped 2026-05-17)**
   - **Mutations:** [`useCreateRoom`](src/lib/query/use-create-room.ts), [`useJoinRoom`](src/lib/query/use-join-room.ts), [`useLeaveRoom`](src/lib/query/use-leave-room.ts), [`useKickParticipant`](src/lib/query/use-kick-participant.ts), [`useStartGame`](src/lib/query/use-start-game.ts), [`useFinishRoom`](src/lib/query/use-finish-room.ts). Create/Join/Kick all seed the room cache from their response so navigation paints immediately without a poll-wait.
   - **API types** updated to match the BE DTOs ([`src/lib/api/types.ts`](src/lib/api/types.ts)): `RoomSnapshot` gains `id/createdAt/startedAt/finishedAt`, drops the speculative `version` field (no ETag on BE yet).
   - **Create:** `/home` Create button → `useCreateRoom().mutateAsync()` → `router.push('/room/${code}')`.
   - **Join:** [`<CodeInput>`](src/components/code-input.tsx)'s `onComplete` fires `useJoinRoom().mutateAsync({ code })` then navigates. Inline error message on the form for bad codes.
   - **Lobby ([`src/app/room/[code]/page.tsx`](src/app/room/[code]/page.tsx))** is now a real state-machine driven by the 1 Hz `useRoom()` poll:
     - Renders the room-code header tiles + [`<ParticipantList>`](src/components/participant-list.tsx) sorted by seat. Admin gets a 🟠 crown; the local user gets a "Ви" pill.
     - **Kick** (admin only, not self): bottom-sheet `confirm()` → `useKickParticipant.mutateAsync()`. BE returns the new snapshot, the cache update makes the row vanish before the next poll tick.
     - **Leave**: bottom-sheet `confirm()` → `useLeaveRoom.mutateAsync()` → `router.replace('/home')`.
     - **Start** (admin only, ≥4 JOINED): wired to `useStartGame()` so it lights up the moment BE M4 lands. Disabled below 4 players or for non-admins, with a translated hint line under the button.
     - **Status transitions:** `IN_GAME`/`FINISHED` → replace into `/game/[code]`; `ABANDONED` → toast + `/home`. Single-fire via an `exitHandledRef` so duplicate effect runs don't double-navigate.
     - **Kicked detection:** the BE returns 403 once you're no longer JOINED, so the FE infers "kicked" from `wasJoinedRef` + a 403 error. Surfaces the `alertModal` "Вас виключено" sheet, then `/home`. A bare 403 (never was a member) just toasts and redirects.
     - **Admin succession:** tracks `adminUserId` between polls; toasts "Ви тепер адміністратор кімнати" when it transitions to the local user (initial render is suppressed via the ref).
     - **Deep-link auth guard:** `useMe()` resolves to `null` for unauth visitors and the page bounces to `/` — no flash of broken layout.
   - **Error translation:** [`errorMessageKey()`](src/lib/api/error-message.ts) maps `ApiError` status/text to a key in `messages/uk.json` (`errors.roomNotFound`, `roomFull`, `roomNotInLobby`, etc.). The BE's English `errorMessage` is never shown to users.
   - **Verified end-to-end against the running BE** (unauth probes correctly 401 with envelope; FE proxy forwards properly; typecheck + build clean).
   - **BE gap:** `POST /rooms/:code/start` is not yet implemented on the BE — `useStartGame` will currently 404 until BE M4 lands. The UI is fully wired and Start is disabled below 4 JOINED players anyway, so users won't hit it accidentally.
4. **M4 — Game screen scaffolding (1 day)**
   Game snapshot, my card, other players' grid, locked slots. No reveal yet. GameTopBar slots into AppBar's `trailing` slot for the apocalypse/shelter pills.
5. **M5 — Reveals (0.5–1 day)**
   Confirm dialog (via global `confirm()`) + mutation + poll-driven updates.
6. **M6 — Polish (1 day)**
   Loading states, errors in Ukrainian, "copy code" affordance, refine reveal animations. (Mobile layout pass and tab-hidden polling already done in M1.)

## 12. Explicitly out of scope for v1

- Real-time (websockets/SSE) — polling per spec
- Push notifications, sound effects
- Animations beyond a fade on reveal
- Light/dark theme toggle (pick one, ship)
- Spectator mode, share-screenshot, replays
- English locale (plumbing only; no translations)
- PWA **offline** support — service workers and offline caching are out. Install-to-home-screen + standalone display + status-bar tinting are **in** (see §15); they're cheap and the game is phone-first.

## 13. Mobile-first chrome (locked, M1)

The entire UI is designed phone-first. Tablet/desktop get the same layout, just centred at a max width.

### Layout pattern

```
┌─────────────────────────────────┐
│  fixed AppBar (blurred)         │  ← env(safe-area-inset-top) padding
├─────────────────────────────────┤
│                                 │
│  scrollable <main>              │  ← content lives here;
│  (max-width capped on tablet+)  │     padding-top reserves AppBar height,
│                                 │     padding-bottom reserves footer height,
│                                 │     both adjusted for safe-area insets
│                                 │
├─────────────────────────────────┤
│  fixed StickyActionBar (blur)   │  ← env(safe-area-inset-bottom) padding
└─────────────────────────────────┘
```

[`PageShell`](src/components/page-shell.tsx) wires this together. Pages opt in to the chrome:

```tsx
<PageShell
  appBar={{ title: 'Кімната ABCD', back: { href: '/home' }, trailing: <KebabButton /> }}
  footer={<><PrimaryCTA /><SecondaryCTA /></>}
  maxContentWidth={480}
>
  {/* page content */}
</PageShell>
```

Both `appBar` and `footer` are optional. The landing page uses neither (pure hero). Each provided slot reserves the right amount of viewport padding automatically so content never lands under the notch / home bar / chrome.

### Tokens & viewport

- [`src/theme/tokens.ts`](src/theme/tokens.ts) exposes `layout.appBarHeight` (56), `layout.footerReserve` (96), `layout.minTapTarget` (48), and `safeArea.{top,bottom,left,right}` helpers — every fixed-chrome component reads from these.
- `<html>` viewport: `width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no`. The `maximum-scale=1` kills iOS double-tap-to-zoom; the `viewport-fit=cover` lets the body extend under the notch so the gradient is full-bleed.
- Body: `touch-action: manipulation` (kills the 300 ms double-tap delay), `-webkit-tap-highlight-color: transparent`, `min-height: 100dvh` (dynamic viewport so iOS' shrinking-toolbar doesn't cause a vertical jump).
- Every interactive element (buttons, icon buttons, modal actions, code-input slots) has `minHeight: 48` to satisfy WCAG 2.5.5.

### Specific decisions baked in

- **Headings up-scaled** (`h1: 2.25 rem`, `body1: 1 rem`) so thumb-distance reading is comfortable.
- **`/join` uses [`<CodeInput length={4} />`](src/components/code-input.tsx)** — four big PIN-style slots with auto-advance, backspace-to-previous, paste-fills-all, A–Z uppercase coercion. Submit auto-fires on completion via `onComplete`.
- **Logout** lives in the AppBar's `trailing` slot on `/home`, not in the sticky footer. Primary CTAs (Create / Join / Start / Submit / Exit) all live in the sticky footer.
- **Back navigation** is the AppBar's leading slot — no swipe-from-edge to compete with browser back.

## 14. Modal & notification surfaces (locked, M1)

Both are mounted **once** in [`src/components/providers.tsx`](src/components/providers.tsx). Any component anywhere in the tree can fire them imperatively. This is the only reason Zustand exists in the app.

### Modal channel

```tsx
import { confirm, alertModal, prompt } from '@/lib/modal/modal-store';

// Yes/no confirmation — resolves true/false
const ok = await confirm({
  title: t('leaveConfirm'),
  message: t('leaveConfirmHint'),
  confirmLabel: t('leave'),
  confirmColor: 'error',
});
if (!ok) return;

// Single-OK notice
await alertModal({ title: 'Вас виключено' });

// Text input — resolves to string or null
const name = await prompt({ title: 'Назва кімнати', inputLabel: 'Назва' });
```

- Store: [`src/lib/modal/modal-store.ts`](src/lib/modal/modal-store.ts) (Zustand). State is a discriminated union — `{ kind: 'closed' | 'confirm' | 'alert' | 'prompt' }`.
- Renderer: [`src/components/modal-root.tsx`](src/components/modal-root.tsx) listens to the store and dispatches to per-kind subcomponents so `useTranslations` only runs while a modal is open (avoids `ENVIRONMENT_FALLBACK` during static prerender).
- Visuals: [`src/components/liquid-modal.tsx`](src/components/liquid-modal.tsx) switches on `useMediaQuery(theme.breakpoints.down('sm'))`:
  - **Phone:** bottom-sheet with grabber, slide-up animation, stacked buttons (primary on top, cancel below), full-width up to 520 px, safe-area-aware bottom padding.
  - **Tablet+:** classic centred iOS alert — 360 px max, side-by-side buttons divided by a hairline.

### Toast channel

```tsx
import { notify } from '@/lib/notify';

notify.success('Кімнату створено');
notify.error(t('errors.roomFull'));
notify.warning('Гра ось-ось почнеться');
notify.info(t('home.comingSoon'));
```

- Powered by sonner; wrapped to keep the call site stable if we swap libraries.
- One `<Toaster />` mounted in [`src/components/toaster.tsx`](src/components/toaster.tsx), top-center, glass-themed (frosted background, hairline border, iOS palette).

### When to use what

| Need | Use |
|---|---|
| Destructive action confirmation (kick, leave, reveal, exit) | `confirm({ confirmColor: 'error' })` |
| Blocking notice the user must acknowledge ("Вас виключено") | `alertModal()` |
| Transient feedback ("Кімнату створено", "Скопійовано в буфер") | `notify.*` |
| Admin promoted ("Ви тепер адміністратор") | `notify.info` |
| Background poll error / retry | `notify.error` |
| Form-field validation | inline (`error` prop on the input), **not** toasts |

## 15. PWA setup (locked, M1)

Not a service-worker / offline play (still out of scope per §12). What we have:

- **Manifest** generated by [`src/app/manifest.ts`](src/app/manifest.ts) → served at `/manifest.webmanifest`. `name: "Бункер"`, `display: standalone`, `orientation: portrait`, `theme_color` / `background_color: #f3b27a` (matches the top of the dusk gradient).
- **Icons** procedurally generated via Next 15's `ImageResponse`:
  - [`src/app/icon.tsx`](src/app/icon.tsx) → `/icon` (512×512) for the browser favicon and Android home-screen icon.
  - [`src/app/apple-icon.tsx`](src/app/apple-icon.tsx) → `/apple-icon` (180×180) for iOS home-screen icon (maskable).
  - Both render a warm-dusk gradient disc with a "Б" glyph. Replace with branded assets by either dropping `src/app/icon.png` / `src/app/apple-icon.png` or by editing the components.
- **Meta** in [`src/app/layout.tsx`](src/app/layout.tsx) (Next's `metadata` + `viewport` exports):
  - `theme-color: #f3b27a` → iOS status bar + Android chrome tint match the gradient.
  - `apple-mobile-web-app-capable: yes` + `apple-mobile-web-app-status-bar-style: black-translucent` → installed PWAs render full-bleed under the notch with a transparent status bar.
  - `format-detection` off → no auto-linking of phone/email/address.

To install during dev: serve over LAN (`pnpm dev` on `0.0.0.0:3000`), open in iOS Safari, **Share → Add to Home Screen**. The icon, gradient splash, and standalone window all work out of the box.
