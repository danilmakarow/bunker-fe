# Architecture — Lean Clean Architecture

> _“Вигадана назва”_ — a deliberately slimmed-down take on Clean Architecture,
> adapted for a Next.js front end. The goal is to keep the business rules
> (entities + use-cases) framework-agnostic, while `app/` stays free to be as
> React/Next-specific as it wants.

## The layers

Dependencies point **inward**: an outer layer may import from inner layers,
never the reverse.

```
        Presentation   (app/, components/, theme/)   outermost
              │  uses directly
              ▼
          Adapters      (adapters/)
              │  uses directly
              ▼
          Use Cases     (use-cases/)
              │  uses (types only)
              ▼
          Entities      (entities/)                  innermost

   Shared            (shared/)            cross-cutting — used by any layer
   Infrastructure    (infrastructure/)    cross-cutting — used by any layer
```

| Layer | Folder | Responsibility | May import |
| --- | --- | --- | --- |
| **Entities** | `src/entities/` | Core domain models (the bunker-api DTOs) + pure domain rules (the player-card slot model, reveal helpers). No React, no `fetch`, no i18n. | other entities, `shared` |
| **Use Cases** | `src/use-cases/` | One file per application scenario. The TanStack Query hooks (`useCreateRoom`, `useReveal`, …) and the SSR `getCurrentUser`. Orchestrates: call the HTTP client, shape the cache. | `entities`, `infrastructure`, `shared` |
| **Adapters** | `src/adapters/` | Presenters that translate domain/transport output into something the UI consumes — `errorMessageKey` (error → i18n key), `kindLabelKey` (slot kind → i18n key). | `entities`, `infrastructure` |
| **Presentation** | `src/app/`, `src/components/`, `src/theme/` | Everything React/Next: routes, UI components, design tokens, modal/toast surfaces. | `use-cases`, `adapters`, `entities`, `shared`, (rarely) `infrastructure` |
| **Shared** | `src/shared/` | Generic, dependency-free constants/utilities (`timing.ts`). | nothing |
| **Infrastructure** | `src/infrastructure/` | I/O and framework glue: the `fetch` wrapper + `ApiError` (`http/`), next-intl config (`i18n/`), the QueryClient factory (`query/`). | `entities`, `shared` |

In Next.js the `app/` directory is reserved for the App Router, so it **is** the
Presentation layer. Shared UI (`components/`) and design tokens (`theme/`) are
part of Presentation too — they just live in sibling folders because `app/`
only holds routes.

## Folder map

```
src/
├── shared/                 # cross-cutting pure constants/utils
│   └── timing.ts           # poll interval, stale times, SSR timeout
│
├── infrastructure/         # cross-cutting I/O + framework setup
│   ├── http/
│   │   ├── api-client.ts   # apiRequest() — the single typed fetch wrapper
│   │   └── api-error.ts    # ApiError
│   ├── i18n/
│   │   ├── config.ts       # locales, defaultLocale
│   │   └── request.ts      # next-intl getRequestConfig (wired in next.config.ts)
│   └── query/
│       └── query-client.ts # createQueryClient()
│
├── app/                    # Presentation — Next.js App Router routes
├── components/             # Presentation — shared UI (+ components/modal/, notify.ts)
├── theme/                  # Presentation — MUI theme, tokens, polarity.ts
│
├── adapters/               # presenters (error-message.ts, attribute-labels.ts)
├── use-cases/              # application scenarios (RQ hooks, get-current-user, query-keys)
└── entities/               # domain models + rules
    ├── index.ts            # type-only barrel — import models from '@/entities'
    ├── user.ts | room.ts | game.ts | content.ts
    └── attributes.ts       # domain rules; import directly from '@/entities/attributes'
```

## Conventions for adding code

- **New API call / business scenario** → a hook (or async fn) in `use-cases/`.
  It imports `apiRequest` from `@/infrastructure/http/api-client`, domain types
  from `@/entities`, and the cache keys from `./query-keys`. It must not import
  anything from `adapters/` or `app/`.
- **New domain model or rule** → `entities/`. Add the type to the matching
  aggregate file (`user`/`room`/`game`/`content`) and re-export it from
  `entities/index.ts`. Pure functions/constants go in `entities/attributes.ts`
  (or a new sibling) and are imported from their module directly, not the barrel.
- **Mapping a domain value to something the view shows** (an i18n key, a label,
  a derived shape) → a presenter in `adapters/`. If it maps to a CSS value, it
  belongs in `theme/` instead (see `theme/polarity.ts`).
- **New UI** → `app/` for routes, `components/` for shared widgets, `theme/`
  for tokens. Presentation reads use-cases via hooks and formats their output
  with adapters.
- **A magic timing/number used by more than one place** → `shared/`.
- **Wrapping an external library or doing raw I/O** → `infrastructure/`.

### Import direction — the one rule

`entities` import nothing outward. `use-cases` never import `adapters` or
presentation. `adapters` never import presentation. Presentation sits on top and
may import everything below it. `shared`/`infrastructure` are leaves that anyone
may use.

### Lean tradeoff (what we deliberately skipped)

The original diagram dashes the `use-cases → entities` and
`* → infrastructure` arrows as “use interfaces” (dependency inversion). This
codebase uses **concrete imports** instead — use-cases call `apiRequest`
directly rather than through a gateway interface, and there is no DI container.
That is the “lean” in the name. If a second data source or heavy unit-testing
need ever appears, the seam to introduce is a gateway interface owned by
`use-cases/` and implemented in `infrastructure/http/` — nothing else would have
to move.

## Verifying

```bash
pnpm typecheck   # tsc --noEmit
pnpm build       # next build — compiles every route + type-checks
```

> `pnpm lint` (`next lint`) currently has no ESLint config and will prompt for
> interactive setup; it is not part of the verification loop today.
