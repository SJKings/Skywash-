# Skywash

Car wash booking service: customers book a wash from a mobile app (no sign-up, they get a booking code), staff manage bookings from a web dashboard.

| App | Stack | Path |
|---|---|---|
| Customer mobile app | React Native, Expo SDK 58, TypeScript | [`apps/mobile-app`](apps/mobile-app) |
| Admin dashboard + API | Next.js 16 (App Router), Prisma 7, Prisma Postgres | [`apps/admin-web`](apps/admin-web) |

## Getting started

Requires Node 22+.

```bash
npm install

# Admin web + API
cp apps/admin-web/.env.example apps/admin-web/.env   # fill DATABASE_URL and ADMIN_PASSWORD
npm run db:deploy        # create tables
npm run db:seed          # optional demo bookings (track code SW-4FQ2)
npm run dev:admin        # http://localhost:3000

# Mobile app
cp apps/mobile-app/.env.example apps/mobile-app/.env
npm run dev:mobile       # scan the QR code with Expo Go
```

## API

| Endpoint | Who |
|---|---|
| `POST /api/bookings` | Mobile app — create a booking |
| `GET /api/bookings/:code` | Mobile app — track a booking by code |
| `GET /api/bookings` | Admin — list bookings |
| `PATCH /api/bookings/:id` | Admin — approve, start, complete or cancel |
| `POST` / `DELETE /api/auth/session` | Admin — sign in / out |

Admin endpoints accept the dashboard session cookie or `Authorization: Bearer $ADMIN_PASSWORD`:

```bash
curl -H "Authorization: Bearer $ADMIN_PASSWORD" "http://localhost:3000/api/bookings?status=all"
```

## Deploying admin-web to Vercel

1. Import the repo and set **Root Directory** to `apps/admin-web`.
2. Connect Prisma Postgres (Storage → Prisma Postgres). It sets `DATABASE_POSTGRES_URL` (with the `DATABASE` prefix), which the app reads when `DATABASE_URL` is unset.
3. Add `ADMIN_PASSWORD` (and `CORS_ALLOWED_ORIGINS` if a browser client needs it).
4. Run `npm run db:deploy` against the production database once, and after each new migration.

## Design

Each app has a `design/` folder with the Claude Design prototype (`*.dc.html`, open in a browser with `support.js` next to it) and `HANDOFF.md`, the full design spec.

See [`CLAUDE.md`](CLAUDE.md) for project conventions, environment variables and the command reference.
