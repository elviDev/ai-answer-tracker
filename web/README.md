# AI Answer Tracker — Web

The dashboard and public site for AI Answer Tracker. It uses Next.js 16 (App Router), React 19, Tailwind CSS v4, TanStack Query, Zustand and Zod.

## Run locally

```bash
cp .env.example .env.local      # then fill in SESSION_SECRET, ADMIN_PASSWORD, API_TOKEN
npm install
npm run dev                     # http://localhost:3000
```

The FastAPI backend must be running (`API_URL`, default `http://localhost:8000`). `API_TOKEN` must match the backend's `API_TOKEN`.

| Script | |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` / `npm run lint` / `npm run format` | Static checks / Prettier with Tailwind class sorting |

## Architecture

```
src/
  app/                      Routes only: layouts, pages, metadata files, route handlers
    (marketing)/            Public, statically prerendered landing page (+ JSON-LD)
    (auth)/login/           Sign-in (Server Action)
    (app)/dashboard/        Authenticated app: server-prefetched, client-cached
    api/backend/[...path]/  BFF proxy to FastAPI
    robots.ts  sitemap.ts  manifest.ts  llms.txt/  opengraph-image.tsx  icon.svg
  features/                 Vertical slices; each owns its schemas, API, hooks and components
    auth/  trackers/  snapshots/  stats/  engines/  marketing/
  components/
    ui/                     Design-system primitives (Button, FormField, Badge, ConfirmButton…)
    layout/  theme/         App shell, site header/footer, theme script + toggle
  lib/
    api/                    HttpClient interface, browser/server transports, composition root
    auth/                   JWT session tokens, DAL guard, rate limiter
    query/                  QueryClient factory, query keys, server prefetch helper
    seo/  utils/  env.ts  site.ts
  providers/                QueryProvider, ApiProvider (dependency injection)
  stores/                   Zustand: preferences (persisted), toasts, active runs
  proxy.ts                  Optimistic auth redirects + sliding session refresh
```

### Data flow

```
Browser ──fetch──▶ /api/backend/* (BFF, verifies session) ──Bearer API_TOKEN──▶ FastAPI
Server Components ──serverHttp (direct, with token)──▶ FastAPI ──▶ dehydrate ──▶ HydrationBoundary
```

- **One API contract, validated at runtime.** Every response passes through a Zod schema (`features/*/schemas.ts`). Timestamps become `Date`s, and a backend change fails loudly instead of rendering `undefined`.
- **Dependency inversion.** Feature APIs (`createTrackersApi(http)`) depend on the `HttpClient` interface, not on `fetch`. The browser injects the BFF transport and the server injects a direct transport with the token. `ApiProvider` lets tests swap in fakes.
- **Query option factories** (`trackerQueries.detail(api, id)`) are shared by server prefetching and client hooks, so cache keys can't drift apart.

### Caching and latency

- **Static where possible.** The landing page, `robots.txt`, `sitemap.xml`, `llms.txt` and the OG image are prerendered at build time.
- **Prefetching.** Dashboard pages are prefetched on the server and hydrated into TanStack Query, so the first paint already has data.
- **Client cache.** `staleTime` is 30s (5 min for engines). Cached data shows instantly and refreshes in the background; refetches also happen on window focus.
- **Instant navigation.** Hovering or focusing a tracker link prefetches its detail. The detail view uses the list row as placeholder data, and the snapshot filter keeps previous data while loading.
- **Optimistic mutations.** Pause, resume and delete update the UI immediately and roll back on error. Polling runs only while a "Run now" is in flight (Zustand `run-store`).
- **Smaller bundle.** Recharts is lazy-loaded (`next/dynamic`, `ssr: false`) and stays out of the initial bundle.

### Sessions

- **Token.** A stateless HS256 JWT (`jose`) is stored in an `httpOnly`, `SameSite=Lax` cookie that is `Secure` in production. It lasts 7 days, and `proxy.ts` re-issues it after a day of use (sliding expiry).
- **Defence in depth.** `proxy.ts` only redirects optimistically. The authoritative checks are `requireSession()` (the Data Access Layer, memoized per request) and the BFF route handler.
- **Password changes.** Tokens carry a fingerprint of `ADMIN_PASSWORD`, so changing the password signs everyone out.
- **Login hardening.** Login uses a constant-time comparison and a per-IP rate limit (5 attempts per 15 minutes). The `?next=` redirect is restricted to same-site paths.
- **Expiry.** A 401 from the BFF anywhere in the app sends the user to `/login?next=<current page>`.

### SEO

- **Metadata.** `metadata` provides the title template, canonical URL, Open Graph and Twitter tags. Private routes (`/dashboard`, `/login`) are `noindex`.
- **JSON-LD.** The landing page carries Organization, WebSite, SoftwareApplication, FAQPage and HowTo. The FAQ and steps come from `features/marketing/content.ts`, the same source the page renders, so structured data always matches visible content.
- **Crawler files.** `robots.txt` disallows the private routes, and `sitemap.xml` and `llms.txt` (the [llmstxt.org](https://llmstxt.org) format) are generated from the same content.

### Theming

Design tokens are CSS variables in `globals.css`, exposed to Tailwind through `@theme` (`bg-surface`, `text-fg-muted`, `text-series-1`…). Dark mode is driven by `data-theme`. An inline script sets it before first paint (no flash), and the preference (light, dark or system) is persisted with Zustand.
