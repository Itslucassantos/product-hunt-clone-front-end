# P.H CLONE — Frontend

A Product Hunt clone built with **Next.js (App Router)**, **React**, **TypeScript**, **TailwindCSS** and **Clerk**. People can browse products, filter them by topic, upvote their favourites and read editorial reviews. Admins manage products, reviews and topics from a protected area. The UI is available in **English** and **Brazilian Portuguese**, with light and dark themes.

This repository contains only the frontend. It talks over HTTP to the separate **[product-hunt-clone-backend](https://github.com/Itslucassantos/product-hunt-clone-backend)** (Express 5, Prisma, PostgreSQL, Redis; all routes under `/api`), which has its own README with the full API reference.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Routes](#routes)
- [Backend API used by the frontend](#backend-api-used-by-the-frontend)
- [Architecture](#architecture)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Conventions](#conventions)
- [Continuous integration](#continuous-integration)
- [License](#license)

## Features

**Public**

- Home with trending topics (filter through `?topic=`), the list of published products, "Reviewed by us" and "Coming soon" side lists.
- Categories page with one card per topic and the most upvoted products of the selected topic.
- Product page with upvote, long description, details, topics, editorial review and "More in {topics}".
- About page.
- Sign in and sign up (Clerk, with custom screens), synced with a local user in the backend.
- Upvotes with optimistic updates, rollback on failure and instant list re-ordering.

**Admin** (role `ADMIN` only)

- Product list with filters and deletion.
- Create and edit products: image upload with progress, topics, published / coming soon status, optional review (1–5 stars + summary), field-level validation and an error summary.
- Topic management with names in both languages, optimistic re-ordering and deletion blocked while a topic is in use.
- Warning when leaving a form with unsaved changes.

**Cross-cutting**

- Internationalisation (`en`, `pt-BR`) with the locale in the URL.
- Light / dark theme.
- Dedicated screens for each API error code (session expired, forbidden, not found, rate limited, server error, offline, …).
- Accessibility: `aria-current` in navigation, accessible skeletons, 44 px touch targets, focus management and `prefers-reduced-motion` support.
- Per-page `<title>`, Open Graph data on products and `noindex` on admin and auth routes.

## Tech stack

| Area                   | Technology                                                 |
| ---------------------- | ---------------------------------------------------------- |
| Framework              | Next.js 16 (App Router, Server Components)                 |
| UI                     | React 19, TypeScript 6                                     |
| Styling                | TailwindCSS 3, CSS variables for theming                   |
| Authentication         | Clerk (`@clerk/nextjs`, `@clerk/localizations`)            |
| Server state           | TanStack Query 5                                           |
| i18n                   | next-intl 4 (`en` default, `pt-BR`)                        |
| Theme                  | next-themes                                                |
| Fonts                  | Bricolage Grotesque + Instrument Sans (`next/font/google`) |
| Unit / component tests | Vitest, Testing Library, jsdom                             |
| End-to-end tests       | Playwright                                                 |
| Quality                | ESLint, Prettier, `tsc`, translation key check             |

## Getting started

### Prerequisites

- **Node.js 24** (the version used in CI) and npm.
- The **backend repository**: <https://github.com/Itslucassantos/product-hunt-clone-backend> (clone it next to this repo, see [Running the backend](#running-the-backend)).
- A **Clerk** application (a free development instance is enough) to get the publishable and secret keys.
- The **backend API** running locally, by default on `http://localhost:3333` (see [Running the backend](#running-the-backend)).
- Google Chrome installed, only if you want to run the end-to-end tests locally.

### Installation

```bash
git clone https://github.com/Itslucassantos/product-hunt-clone-front-end.git
cd product-hunt-clone-front-end
npm install
cp .env.example .env
```

Fill in `.env` (see [Environment variables](#environment-variables)), start the backend ([next section](#running-the-backend)), then:

```bash
npm run dev
```

Open <http://localhost:3000>. The middleware redirects `/` to the default locale, so you land on `/en`. Use `/pt-BR` for Portuguese.

### Running the backend

Backend repository: <https://github.com/Itslucassantos/product-hunt-clone-backend>. Clone it next to this repo, so both folders share the same parent:

```bash
cd ..
git clone https://github.com/Itslucassantos/product-hunt-clone-backend.git
cd product-hunt-clone-backend
```

It needs Node.js 24 and Docker. Two options (details in the backend README):

```bash
# Option 1: everything in Docker (PostgreSQL, Redis, migrations + seed, API on :3333)
docker compose up -d --build --wait

# Option 2: infrastructure in Docker, API on your machine with hot reload
cp .env.example .env
docker compose up -d --wait postgres redis
npm install
npx prisma migrate dev
npx prisma db seed     # 4 topics and 3 sample products
npm run dev            # http://localhost:3333
```

Check it with `curl http://localhost:3333/health/ready` and `curl http://localhost:3333/api/products`.

Settings in the **backend** `.env` that matter for this frontend:

| Variable                   | Value for local development                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CORS_ORIGIN`              | `http://localhost:3000` (the default). Change it if the frontend runs on another origin.                                                                           |
| `CLERK_SECRET_KEY`         | The secret key of the **same Clerk instance** as this frontend. Without it the backend only accepts `Bearer dev:<id>` development tokens, not real Clerk sessions. |
| `CLERK_AUTHORIZED_PARTIES` | Optional: the frontend origin, to validate the token `azp` claim.                                                                                                  |
| `CLERK_WEBHOOK_SECRET`     | Optional: enables the Clerk webhook that syncs users. Without it the backend creates the user on the first authenticated request.                                  |
| `ADMIN_EXTERNAL_IDS`       | Comma-separated Clerk user ids that become admins when first created.                                                                                              |
| `REPOSITORY_DRIVER=memory` | Runs the API with in-memory data and no database, handy for quick frontend work.                                                                                   |

### Becoming an admin

The role is stored in the backend database, and `GET /api/me` must return `role: "ADMIN"` for the signed-in user. Put your Clerk user id (`user_…`, visible in the Clerk dashboard) in the backend's `ADMIN_EXTERNAL_IDS` **before** the user is first created in the backend (that is, before the first sign-in), or promote the existing user in the database. Without the role, `/admin/*` shows a "no permission" screen.

### Running everything with Docker

The [docker-compose.yaml](docker-compose.yaml) starts the whole stack with one command: PostgreSQL, Redis, the backend migrations and seed, the backend API (`:3333`) and this frontend (`:3000`).

```bash
cp .env.example .env     # fill in the two Clerk keys (and ADMIN_EXTERNAL_IDS if you want an admin)
docker compose up -d --build --wait
```

Open <http://localhost:3000>. Useful commands:

```bash
docker compose logs -f web api   # follow the logs
docker compose down              # stop, keep the database
docker compose down -v           # stop and delete the database volume
```

Things to know:

- The backend ([github.com/Itslucassantos/product-hunt-clone-backend](https://github.com/Itslucassantos/product-hunt-clone-backend)) is built from the sibling folder `../product-hunt-clone-backend`, so clone it there first. Use `BACKEND_CONTEXT=/path/to/backend` in `.env` if it lives elsewhere.
- `NEXT_PUBLIC_*` values are baked into the browser bundle at **build time**. After changing the Clerk publishable key, run `docker compose up -d --build` again.
- The browser talks to the API at `http://localhost:3333`, while the Next.js server inside the container reaches it as `http://api:3333` (`API_INTERNAL_URL`, used only for server-side fetches).
- Ports 3000, 3333 and the database are taken by this stack. Stop the backend's own `docker compose` stack first if it is running, or the ports will clash.
- To build only the frontend image: `docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_… -t product-hunt-web .` and run it with `-e CLERK_SECRET_KEY=… -e API_INTERNAL_URL=http://<backend-host>:3333 -p 3000:3000`. The [Dockerfile](Dockerfile) is multi-stage and uses Next.js `output: "standalone"`; the runtime image runs as the non-root `node` user and has a health check.

### Production build

```bash
npm run build
npm run start
```

The project is meant to run locally; no deployment is configured.

## Environment variables

Defined in `.env` (template in [.env.example](.env.example)).

| Variable                            | Required                             | Description                                                                      |
| ----------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`          | No (default `http://localhost:3333`) | Base URL of the backend. The client appends `/api/...`.                          |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes                                  | Clerk publishable key (starts with `pk_`).                                       |
| `CLERK_SECRET_KEY`                  | Yes                                  | Clerk secret key (starts with `sk_`). Server only, never exposed to the browser. |

The backend must be configured with the same Clerk instance so it can verify the tokens sent by the frontend.

Product images are served by the backend at `/files/<name>`. `ProductImage` renders them with `next/image` in `unoptimized` mode, and `images.remotePatterns` in [next.config.ts](next.config.ts) only allows `http://localhost:3333/files/**`. If you ever drop `unoptimized` or serve images from another host (for example S3), add that host there.

## Scripts

| Command                  | What it does                                                                     |
| ------------------------ | -------------------------------------------------------------------------------- |
| `npm run dev`            | Starts the Next.js dev server on port 3000.                                      |
| `npm run build`          | Creates the production build.                                                    |
| `npm run start`          | Serves the production build.                                                     |
| `npm run lint`           | Runs ESLint.                                                                     |
| `npm run typecheck`      | Runs `tsc --noEmit`.                                                             |
| `npm run check:messages` | Fails if `messages/en.json` and `messages/pt-BR.json` do not have the same keys. |
| `npm run format`         | Formats the repo with Prettier.                                                  |
| `npm run format:check`   | Checks formatting without writing.                                               |
| `npm test`               | Runs the unit and component tests once (Vitest).                                 |
| `npm run test:watch`     | Runs Vitest in watch mode.                                                       |
| `npm run test:e2e`       | Runs the Playwright end-to-end tests.                                            |

## Testing

### Unit and component tests

```bash
npm test
```

Vitest runs in a jsdom environment (config in [vitest.config.mts](vitest.config.mts)). Tests live next to the code as `*.test.ts(x)`. Shared helpers are in [src/test/](src/test/):

- `setup.ts` — jest-dom matchers, automatic cleanup and a `<dialog>` polyfill for jsdom.
- `render.tsx` — `renderWithProviders`, which wraps a component in `next-intl` (English messages), TanStack Query (no retries), the rate-limit provider and the toast provider.

What is covered today:

| Area                                                                                      | Files                                          |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Safe redirect after login                                                                 | `src/lib/auth/redirect.test.ts`                |
| Error code → message key / screen kind, retry-after, field errors                         | `src/lib/api/errors.test.ts`                   |
| Optimistic voting (instant update, re-ordering, rollback, `PRODUCT_NOT_VOTABLE`, success) | `src/hooks/useToggleVote.test.tsx`             |
| `VoteButton`                                                                              | `src/components/features/VoteButton.test.tsx`  |
| `ConfirmDialog`                                                                           | `src/components/ui/ConfirmDialog.test.tsx`     |
| `ProductForm` (validation, error summary focus, creation)                                 | `src/components/features/ProductForm.test.tsx` |

Clerk, the API endpoints and the i18n navigation helpers are mocked in these tests, so they need neither network nor a backend.

### End-to-end tests

```bash
npm run test:e2e
```

Playwright (config in [playwright.config.ts](playwright.config.ts), specs in [e2e/](e2e/)) starts `next dev` on port **3100** by default (`E2E_PORT` changes it) and drives your installed Chrome. These tests need the **backend running** and valid Clerk keys in `.env`. They cover:

- a signed-out visitor voting and being sent to `/sign-in` with the right `redirect_url`;
- an unknown route showing the 404 screen;
- `/admin/*` redirecting to sign-in and keeping the destination.

Not covered: real login and creating a product in the admin, because they require a dedicated test user in Clerk. End-to-end tests are not run in CI.

## Routes

All pages live under `/{locale}` where `locale` is `en` or `pt-BR`. Route and file names are always English; only the UI text changes with the language.

| Page                 | Route                                            | Notes                                                                                 |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Home                 | `/`                                              | `?topic=<slug>` filters by topic.                                                     |
| Categories           | `/categories`                                    | `?topic=<slug>` selects a topic.                                                      |
| About                | `/about`                                         | Static.                                                                               |
| Product              | `/products/[id]`                                 | 404 screen for unknown ids; "coming soon" products have no voting.                    |
| Sign in              | `/sign-in`                                       | `?redirect_url=` brings the user back after login (only internal paths are accepted). |
| Sign up              | `/sign-up`                                       | Syncs the user with the backend.                                                      |
| Admin (index)        | `/admin`                                         | Redirects to the product list.                                                        |
| Admin — products     | `/admin/products`                                | List, filters, delete.                                                                |
| Admin — new product  | `/admin/products/new`                            |                                                                                       |
| Admin — edit product | `/admin/products/[id]/edit`                      | Deleting is only available from the list.                                             |
| Admin — topics       | `/admin/topics`                                  | Create, edit, reorder, delete.                                                        |
| Not found / error    | `not-found.tsx`, `error.tsx`, `global-error.tsx` | Used for unknown routes and unexpected failures.                                      |

## Backend API used by the frontend

Typed wrappers live in [src/lib/api/endpoints.ts](src/lib/api/endpoints.ts). Every path is prefixed with `/api`. "Auth" means the request carries `Authorization: Bearer <Clerk token>`.

| Method and path                              | Auth        | Purpose                                                                                                 |
| -------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `GET /products?locale&topic&status&reviewed` | No          | Product list. `status` is `published` or `coming-soon`; `reviewed=true` returns only reviewed products. |
| `GET /products/:id?locale`                   | No          | Product detail (with review, when it exists).                                                           |
| `GET /topics?locale`                         | No          | Topics ordered by position, with product counts. Cached by the browser for 60 s.                        |
| `GET /me`                                    | Yes         | Current user and role (`USER` / `ADMIN`).                                                               |
| `GET /me/votes`                              | Yes         | Ids of the products the user has voted for.                                                             |
| `POST /products/:id/vote`                    | Yes         | Toggles the vote; returns `{ upvotes, voted }`.                                                         |
| `GET /admin/products?locale`                 | Yes (admin) | All products, any status, with votes and reviews.                                                       |
| `POST /products`                             | Yes (admin) | Creates a product; `201` with `{ id }`.                                                                 |
| `PATCH /products/:id`                        | Yes (admin) | Updates a product; `204` with no body.                                                                  |
| `DELETE /products/:id`                       | Yes (admin) | Deletes a product.                                                                                      |
| `PUT /products/:id/review`                   | Yes (admin) | Creates or updates the review (`{ rating, summary }`).                                                  |
| `DELETE /products/:id/review`                | Yes (admin) | Removes the review.                                                                                     |
| `POST /uploads/product-image`                | Yes (admin) | Multipart image upload (PNG or JPG, up to 5 MB); returns `imageUrl`.                                    |
| `POST /topics`                               | Yes (admin) | Creates a topic with translations for both languages.                                                   |
| `PATCH /topics/:id`                          | Yes (admin) | Updates a topic's names and descriptions (the slug never changes).                                      |
| `DELETE /topics/:id`                         | Yes (admin) | Deletes a topic; `TOPIC_IN_USE` if a product would be left without topics.                              |
| `PUT /topics/order`                          | Yes (admin) | Saves the topic order (`{ ids }`).                                                                      |

The backend also exposes `GET /files/:fileName` (uploaded images), `GET /health` and `GET /health/ready`, which the frontend does not call directly. Names are returned in the language given by `?locale=`. Lists are not paginated.

Rate limits per minute: 120 per IP for public reads, 30 per user for votes, 60 per user for admin writes and 10 per user for image uploads. Over the limit the API answers `429 RATE_LIMITED` with a `Retry-After` header, and the frontend disables actions until the countdown ends.

Errors come in a single shape, which the client turns into an `ApiRequestError` (`code`, `status`, `requestId`, `details`):

```json
{
  "error": {
    "code": "PRODUCT_NOT_VOTABLE",
    "status": 409,
    "message": "…",
    "requestId": "…",
    "details": {}
  }
}
```

Codes handled by the frontend: `MALFORMED_REQUEST`, `VALIDATION_ERROR`, `INVALID_TOPIC_ORDER`, `UNAUTHENTICATED`, `SESSION_EXPIRED`, `FORBIDDEN`, `ROUTE_NOT_FOUND`, `PRODUCT_NOT_FOUND`, `TOPIC_NOT_FOUND`, `REVIEW_NOT_FOUND`, `USER_NOT_FOUND`, `PRODUCT_NOT_VOTABLE`, `PRODUCT_ALREADY_EXISTS`, `TOPIC_ALREADY_EXISTS`, `TOPIC_IN_USE`, `IMAGE_TOO_LARGE`, `UNSUPPORTED_IMAGE_TYPE`, `RATE_LIMITED`, `INTERNAL_ERROR`, `UPSTREAM_ERROR` and `SERVICE_UNAVAILABLE`. Unknown codes fall back to a generic message.

A network failure becomes an `ApiRequestError` with `code: null`, which the UI treats as "offline".

## Architecture

```text
 Browser ── Next.js (this repo) ──HTTP /api──> Express backend ──> database / storage
    │              │
    │              └── Server Components prefetch data and hydrate TanStack Query
    └── Clerk (sign-in / sign-up, session token)
```

Key decisions:

- **Server Components for the first load, TanStack Query afterwards.** Pages prefetch their data on the server and hand it to the client through `HydrationBoundary`, so the first HTML already contains the content. After hydration, TanStack Query owns caching, refetching and mutations.
- **A single typed HTTP client.** Components never call `fetch` directly. [src/lib/api/client.ts](src/lib/api/client.ts) builds the request, adds `X-Request-Id` and the bearer token, parses errors and exposes typed endpoint functions.
- **"Have I voted?" is computed on the client.** List and detail responses do not include `hasVoted`, so the backend can cache them in a shared cache. Signed-in users fetch `GET /me/votes` once and check membership locally.
- **Locale in the URL and in query keys.** Topic names inside products come in the requested language, so the locale is part of every cache key; switching language never shows the other language's cache.
- **Authentication layers for the admin.** `src/proxy.ts` (Next.js middleware) runs Clerk and i18n routing and redirects signed-out visitors away from `/admin`. `admin/layout.tsx` calls `GET /me` on the server and renders the "no permission" screen unless the role is `ADMIN`. If the backend is unreachable, the client-side `AdminGuard` is the second layer.
- **Centralised error handling.** A global error bus reacts to cross-cutting codes (for example `UNAUTHENTICATED` / `SESSION_EXPIRED` send the user to `/sign-in` and back; `RATE_LIMITED` disables actions until `retryAfterSeconds` elapses).

## How it works

### Data fetching and cache

Query keys:

| Key                                                 | Data                                                |
| --------------------------------------------------- | --------------------------------------------------- |
| `['products', locale, { topic, status, reviewed }]` | Product lists (also reviewed and coming-soon lists) |
| `['products', locale, id]`                          | Product detail (`[..., id, 'fresh']` in the admin)  |
| `['topics', locale]`                                | Topics                                              |
| `['admin-products']`                                | Admin product list (`staleTime: 0`)                 |
| `['my-votes']`                                      | Ids of products the user voted for                  |
| `['me']`                                            | Current user and role                               |

The backend caches lists for up to 15 s and the browser for 10 s more, so public lists use a `staleTime` of about 10 s; another person's vote can take up to ~25 s to show. That is expected. The admin reads topics and the product being edited with the `fresh` option (`cache: "no-cache"`), so forms never open with stale data right after a save. Admin mutations invalidate `['products']`, `['topics']` and `['admin-products']`.

### Optimistic voting

`useToggleVote` ([src/hooks/useToggleVote.ts](src/hooks/useToggleVote.ts)):

1. `onMutate` cancels in-flight queries, flips `['my-votes']`, adjusts the count in every cached list and detail, re-sorts lists that were sorted by votes, and remembers the previous state.
2. `onError` rolls everything back, refetches `['my-votes']` and shows an error toast. For `PRODUCT_NOT_VOTABLE` it also refetches the products, since the product's status changed.
3. `onSuccess` writes the server's `{ upvotes, voted }`. Lists are intentionally not refetched afterwards, because the backend cache could briefly bring the old count back.

The button is disabled while a request is pending or the user is rate limited. Signed-out visitors see a link to `/sign-in?redirect_url=<current page including query>`.

### Authentication

Clerk handles sign-in and sign-up with custom screens (localised with `@clerk/localizations`). `useAuthToken` returns a fresh session token for each request and throws `UNAUTHENTICATED` when there is none. `BackendUserSync` makes sure the Clerk user exists in the backend after login. Redirect targets are validated by `getSafeRedirectPath`, which only accepts internal paths (it rejects `https://…`, `//host` and backslashes).

### Error handling

Each API error code maps to a message key (`errorMessageKey`) and to a screen kind (`errorKind`: offline, unauthenticated, session expired, forbidden, not found, rate limited, server error, unavailable, upstream, generic). The `ErrorState` component renders these consistently, including the `requestId` to help debugging. Mutation errors surface as toasts (`role="alert"`); error toasts stay until dismissed, success toasts last 3 s, and identical toasts are not repeated. Form errors are shown per field with a summary that receives focus after a failed submit, and server-side field errors (`VALIDATION_ERROR`, `TOPIC_ALREADY_EXISTS`, …) are mapped back to the right input.

### Internationalisation

Locales are `en` (default) and `pt-BR`, configured in [src/i18n/routing.ts](src/i18n/routing.ts). Translations are in [messages/](messages/), and no component has hard-coded UI text. `npm run check:messages` (also run in CI) fails if the two files diverge. Navigation helpers from [src/i18n/navigation.ts](src/i18n/navigation.ts) keep the locale prefix on links and redirects.

### Theming

Colours are CSS variables for light and dark, exposed to Tailwind in [tailwind.config.ts](tailwind.config.ts). `next-themes` toggles the theme (system preference by default) via `ThemeToggle`.

## Project structure

```text
.
├── .github/workflows/ci.yaml   # CI pipeline
├── Dockerfile                  # multi-stage production image (standalone output)
├── docker-compose.yaml         # full stack: Postgres, Redis, backend, frontend
├── e2e/                        # Playwright specs
├── messages/                   # en.json, pt-BR.json
├── scripts/check-messages.mjs  # translation key parity check
├── src/
│   ├── app/
│   │   ├── global-error.tsx
│   │   └── [locale]/
│   │       ├── layout.tsx      # fonts, Clerk, next-intl, providers
│   │       ├── not-found.tsx, error.tsx
│   │       ├── (site)/         # public pages: home, categories, about, products/[id]
│   │       ├── (auth)/         # sign-in, sign-up
│   │       └── admin/          # products, products/new, products/[id]/edit, topics
│   ├── components/
│   │   ├── ui/                 # generic building blocks (Button, Toast, ErrorState, ConfirmDialog, …)
│   │   ├── features/           # screen-level components (ProductForm, VoteButton, HeaderNav, …)
│   │   └── *.tsx               # providers and global handlers (Providers, RateLimit, GlobalErrorHandler, …)
│   ├── hooks/                  # data and behaviour hooks (useProducts, useToggleVote, useMe, …)
│   ├── i18n/                   # routing, navigation helpers, request config
│   ├── lib/
│   │   ├── api/                # HTTP client, endpoints, errors, query options, upload
│   │   ├── auth/               # redirect helpers, Clerk error mapping
│   │   ├── get-query-client.ts
│   │   └── metadata.ts
│   ├── proxy.ts                # middleware: Clerk + i18n + admin sign-in redirect
│   ├── styles/globals.css
│   ├── test/                   # test setup and render helpers
│   └── types/api.ts            # API types shared by the whole app
├── next.config.ts
├── playwright.config.ts
├── tailwind.config.ts
└── vitest.config.mts
```

## Conventions

- **Code in English**: identifiers, files, routes, query parameters, JSON fields, branches, commit messages and test names. The code carries no comments.
- **No UI text in code**: everything user-facing comes from `messages/*.json`, in both languages.
- **Naming**: components in `PascalCase` (`ProductRow.tsx`); hooks in `camelCase` files named after the hook (`useTopics.ts`); other files and folders in `kebab-case`; constants in `UPPER_SNAKE_CASE`; types in `PascalCase` without an `I` prefix.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/), for example `feat: add upvote button`.
- **Formatting**: Prettier; run `npm run format` before committing.
- **Accessibility**: interactive targets are at least 44 px, animations respect `prefers-reduced-motion`, and loading states are announced with `role="status"`.

## Continuous integration

[.github/workflows/ci.yaml](.github/workflows/ci.yaml) runs on pushes and pull requests to `main` and `develop`, with Node 24:

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run check:messages`
7. `npm run build` (with placeholder Clerk keys)
8. `npm audit --omit=dev --audit-level=critical`

To reproduce CI locally, run steps 2–6 and 8 with the matching `npm run` commands.

## License

Released under the [MIT License](LICENSE).
