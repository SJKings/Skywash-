# Skywash — project memory

Car wash booking service. Customers book from a mobile app with **no account**; each booking gets a code (`SW-XXXX`) that is the only way to look it up. Staff manage bookings in an admin web dashboard. Both apps share one Postgres database, reached **only** through the admin-web API.

## Layout

```
skywash-/
├── apps/
│   ├── admin-web/          Next.js 16 (App Router) — admin dashboard + backend API
│   │   ├── app/            / (dashboard), /login, api/ route handlers (the only way into the database)
│   │   ├── components/     dashboard UI (client components; data via /api only)
│   │   ├── lib/            prisma client, auth, validation, catalog, booking codes, display formatting
│   │   ├── prisma/         schema.prisma, migrations/, seed.ts
│   │   ├── proxy.ts        Login redirect for pages + CORS for /api/* (Next 16 renamed middleware.ts → proxy.ts)
│   │   └── design/         Ops dashboard prototype + design handoff (reference only)
│   └── mobile-app/         Expo SDK 58 / React Native (TypeScript)
│       ├── lib/api.ts      Typed client for the admin-web API
│       └── design/         Customer app prototype + design handoff (reference only)
├── CLAUDE.md
└── README.md
```

npm workspaces; run everything from the repo root.

## Commands

| Task | Command |
|---|---|
| Install all | `npm install` (also runs `prisma generate` for admin-web) |
| Admin web dev server (:3000) | `npm run dev:admin` |
| Mobile dev server (Expo) | `npm run dev:mobile` |
| Build admin web | `npm run build:admin` |
| Lint (admin web) | `npm run lint` |
| Typecheck both apps | `npm run typecheck` |
| Regenerate Prisma client | `npm run db:generate` |
| New migration after editing schema | `npm run db:migrate -- --name <change>` |
| Apply migrations (prod / fresh DB) | `npm run db:deploy` |
| Seed demo bookings (incl. `SW-4FQ2`) | `npm run db:seed` |
| Prisma Studio | `npm run db:studio` |
| Add a mobile dependency | `cd apps/mobile-app && npx expo install <pkg>` (never plain `npm i`) |

Before finishing a change: `npm run lint && npm run typecheck && npm run build:admin`.

## Environment variables

admin-web (`apps/admin-web/.env`, see `.env.example`; on Vercel: Project → Settings → Environment Variables):

| Key | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon / Vercel Postgres **pooled** connection string. Used at runtime via `@prisma/adapter-neon`. |
| `DATABASE_URL_UNPOOLED` | no | Direct connection, preferred by the Prisma CLI (`migrate`, `studio`, `seed`). Falls back to `DATABASE_URL`. Vercel's Neon integration sets it. |
| `ADMIN_PASSWORD` | yes | Staff password for the dashboard and admin API. Unset → all admin requests are rejected. |
| `CORS_ALLOWED_ORIGINS` | no | Comma-separated browser origins allowed to call `/api/*`. `http://localhost:8081` (Expo web) is allowed automatically outside production. |

mobile-app (`apps/mobile-app/.env`):

| Key | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of admin-web (default `http://localhost:3000`; Android emulator `http://10.0.2.2:3000`). |

Never commit `.env` files or real secrets.

## API contract

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/bookings` | public | Mobile app submits a booking. Server generates `code` and computes `totalPrice`. → `201 { booking }` |
| `GET /api/bookings` | admin | List. `?status=active` (default: PENDING/APPROVED/IN_PROGRESS) \| `all` \| `PENDING,APPROVED`; `?mode=HOME\|PICKUP\|DRIVE_IN`; `?q=` code/name/plate. Newest first, max 200. |
| `GET /api/bookings/[code]` | public | Customer tracking by code. Case-insensitive, `SW-` optional. Returns no name/phone/notes. |
| `PATCH /api/bookings/[id]` | admin | `{ status }`. Only `PENDING→APPROVED→IN_PROGRESS→COMPLETED`, or `→CANCELLED` before completion. `409` on invalid/concurrent change. |
| `POST /api/auth/session` | — | `{ password }` → sets `skywash_admin` HttpOnly cookie (12 h). |
| `DELETE /api/auth/session` | — | Sign out. |

Admin auth = `skywash_admin` cookie (dashboard) **or** `Authorization: Bearer <ADMIN_PASSWORD>` (scripts). Cookie-authenticated writes must come from the same origin (CSRF guard in `lib/auth.ts`). `proxy.ts` redirects pages to `/login` without a valid cookie (and `/login` → `/` with one); API routes still check auth themselves.

## Setup rules & decisions

- **Next.js 16 and Expo 58 differ from older docs.** Before writing Next code, read `node_modules/next/dist/docs/`; for Expo, the versioned docs at docs.expo.dev (see each app's `AGENTS.md`).
- **Prisma 7**: `prisma.config.ts` holds the datasource URL (not `schema.prisma`); the client is generated to `apps/admin-web/lib/generated/prisma` (gitignored) and imported from `@/lib/generated/prisma/client`. The app connects through the Neon driver adapter (`lib/prisma.ts`).
- Change the schema only via `prisma migrate dev` so every change has a committed migration in `prisma/migrations/`.
- **Server is the source of truth** for prices, booking codes and status transitions — never trust totals or codes from the client. Prices/centers live in `apps/admin-web/lib/catalog.ts`.
- Booking codes: `SW-` + 4 chars from `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no 0/O/1/I/L), unique, generated in `lib/booking-code.ts`.
- Validation with zod in `lib/validation.ts`; route handlers return `{ error, issues? }` with 400/401/404/409.
- Times are stored as UTC instants and **displayed in `America/Los_Angeles`** (`BUSINESS_TIME_ZONE` in `lib/catalog.ts`, helpers in `lib/format.ts`). Never use the server's local time zone.
- Dashboard styling: Tailwind v4 classes; `app/globals.css` pins the `sky`/`slate`/`green`/`red` steps the design uses to the handoff's exact hex values. Status pill colors and labels live in `STATUS_STYLES` (`lib/format.ts`).
- The dashboard polls `GET /api/bookings?status=all` every 5 s while the tab is visible (stand-in until realtime). It only sees the 200 newest bookings, so stats and counts cover those.
- `apps/mobile-app/lib/api.ts` mirrors the Prisma enums by hand — update it whenever the schema changes.
- CORS only affects browser clients; the native app sends no `Origin`. Never enable `Access-Control-Allow-Credentials`.
- Design references in each app's `design/` are prototypes (open the `.dc.html` in a browser with `support.js` beside it). Recreate them in real code; don't import them. Tokens: brand `#0EA5E9`, ink `#0F172A`, bg `#F5F8FB`, font Archivo, icons Lucide. Full spec in `design/HANDOFF.md`.

### Schema vs. design naming

| Design prototype | Database |
|---|---|
| status `new / confirmed / in_progress / completed / cancelled` | `PENDING / APPROVED / IN_PROGRESS / COMPLETED / CANCELLED` |
| mode `home / pickup / self` | `HOME / PICKUP / DRIVE_IN` |
| package `ext / int / full / eng` | washType `EXTERIOR / INTERIOR / FULL_DETAIL / ENGINE_BAY` |
| vehicle `Sedan / SUV / Hatchback / Truck` | vehicleType `SEDAN / SUV / HATCHBACK / TRUCK` |
| `date` + `time` | `bookingDate` (one timestamp) |
| `name`, `plate`, `total` | `customerName`, `licensePlate`, `totalPrice` |

## Progress

- [x] Monorepo scaffold (npm workspaces), design files placed per app
- [x] Prisma schema + initial migration (`20261018000000_init`), seed script
- [x] API routes, admin auth, CORS
- [ ] Connect Neon: set `DATABASE_URL`, run `npm run db:deploy && npm run db:seed`
- [x] Admin dashboard UI (login + bookings table/detail) from `Skywash Dashboard.dc.html`
- [ ] Mobile screens (Expo Router) from `Skywash App.dc.html`
- [ ] Realtime updates (dashboard + "My booking"), rate limiting on public endpoints
