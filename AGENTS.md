# Navneet Portfolio — Agent Guide

## Stack
- **Next.js 14** (App Router) + TypeScript (strict mode)
- **Supabase** (Postgres, Auth, Storage) via `@supabase/ssr`
- Deployed on **Vercel**
- No testing framework, no Prettier config

## Commands
| Command | Action |
|---|---|
| `npm run dev` | Dev server (localhost:3000) |
| `npm run build` | Type-check + production build |
| `npm run start` | Start production server |
| `npm run lint` | `next lint` (built-in ESLint) |

## Supabase clients (3 contexts)
- `lib/supabase/client.ts` — browser client for Client Components (`createBrowserClient`)
- `lib/supabase/server.ts` — server client for Server Components / Route Handlers / Server Actions (`createServerClient` + `cookies()`)
- `lib/supabase/middleware.ts` — middleware client (reads/writes request cookies, redirects unauthenticated `/admin` → `/admin/login`)

## Key architecture
- `middleware.ts` matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and static assets. Refreshes session + protects `/admin/*` (except `/admin/login`).
- Public homepage (`app/page.tsx`) sets `revalidate = 0` — always fetches fresh data from Supabase; never cached.
- All content comes from Supabase tables: `profile`, `links`, `projects`, `experience`, `education`, `certifications`. All public-readable (RLS), admin-writable only.
- Path alias `@/*` → root directory.
- Supabase schema lives in `supabase/schema.sql` — run manually once via Supabase SQL Editor when bootstrapping. Sets up tables, RLS, storage buckets, and seeds demo content.
- Only ONE admin account exists — created manually in Supabase Auth panel. No public sign-up.

## Design system
- Fonts: **Lexend Exa** (headings), **Lexend Deca** (body) — loaded via Google Fonts import in `globals.css`
- CSS custom properties in `:root` block in `globals.css` — colors, spacing (`--xs` through `--xl`), border-radius
- Image config in `next.config.mjs` allows Supabase Storage remote patterns (`*.supabase.co/storage/v1/object/public/**`)

## Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # safe for browser
SUPABASE_SERVICE_ROLE_KEY=        # server-side only, never in browser
```
