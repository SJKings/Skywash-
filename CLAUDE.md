# Skywash — project memory

Car wash booking service in Lagos, Nigeria. Customers book from a mobile app with **no account**; each booking gets a code (`SW-XXXX`) that is the only way to look it up. Staff manage bookings in an admin web dashboard. Both apps share one Postgres database, reached **only** through the admin-web API.

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
│   ├── website/            Public marketing site (Next.js 16): landing page, booking tracker, /privacy
│   │   ├── app/            / (landing), /privacy (the privacy policy's home)
│   │   ├── components/     header, footer, prices (mode tabs), track-booking, faq
│   │   ├── lib/site.ts     Display copy of prices/fees/centers + FAQ, contact email, store/staff links
│   │   ├── public/screens/ Real app screenshots, transparent phone renders (from the store-listing images)
│   │   └── design/         Landing page prototype (reference only)
│   └── mobile-app/         Expo SDK 58 / React Native (TypeScript), Expo Router
│       ├── src/app/        Routes: (tabs)/index (Home), (tabs)/my-booking, service/[id],
│       │                   book/{type,location,schedule,review}, confirmed
│       ├── src/components/ Text (Archivo weights), ui (buttons, inputs, pills…), FlowScreen
│       ├── src/lib/        api.ts (API client), catalog, booking-flow (step state), time, recent-codes
│       ├── src/theme.ts    Colors and fonts from the handoff
│       ├── store-listing/  Google Play images: 4 phone screenshots (real app), feature graphic, 512 icon
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
| Website dev server | `npm run dev:website` (port 3000 too: run one at a time, or pass `-- -p 3001`) |
| Build website | `npm run build:website` |
| Build admin web | `npm run build:admin` |
| Lint (both apps) | `npm run lint` |
| Typecheck both apps | `npm run typecheck` |
| Regenerate Prisma client | `npm run db:generate` |
| New migration after editing schema | `npm run db:migrate -- --name <change>` |
| Apply migrations (prod / fresh DB) | `npm run db:deploy` — Vercel also runs this on every deploy via the `vercel-build` script |
| Seed demo bookings (incl. `SW-4FQ2`) | `npm run db:seed` |
| Prisma Studio | `npm run db:studio` |
| Add a dependency to admin-web or website | `npm install <pkg> -w admin-web` / `-w website` from the repo root, so it lands in **that app's** `package.json` and the lockfile. npm hoists packages to the root `node_modules`, so an undeclared import can still work locally and then fail on Vercel (which builds each app from its own folder): every import must be declared by the app that uses it |
| Add a mobile dependency | `cd apps/mobile-app && npx expo install <pkg>` (never plain `npm i`; in cloud sessions prefix `EXPO_OFFLINE=1`, Expo's servers are blocked) |
| Mobile web build (for browser testing) | `cd apps/mobile-app && EXPO_PUBLIC_API_URL=http://localhost:3000 npx expo export -p web` → `dist/` |

Before finishing a change: `npm run lint && npm run typecheck && npm run build:admin && npm run build:website`.

## Environment variables

admin-web (`apps/admin-web/.env`, see `.env.example`; on Vercel: Project → Settings → Environment Variables):

| Key | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes* | Postgres connection string (Prisma Postgres, `db.prisma.io`). Used at runtime via `@prisma/adapter-pg`. *If unset, `DATABASE_POSTGRES_URL` is used — the name Vercel's Prisma Postgres integration sets with the `DATABASE` prefix (resolved in `lib/database-url.ts`). |
| `DATABASE_URL_UNPOOLED` | no | Separate direct connection for the Prisma CLI (`migrate`, `studio`, `seed`), if a provider gives one. Falls back to the above. |
| `ADMIN_PASSWORD` | yes | Staff password for the dashboard and admin API. Unset → all admin requests are rejected. |
| `CORS_ALLOWED_ORIGINS` | no | Comma-separated browser origins allowed to call `/api/*`. `http://localhost:8081` (Expo web) is allowed automatically outside production. |

mobile-app (`apps/mobile-app/.env`):

| Key | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of admin-web (default `http://localhost:3000`; Android emulator `http://10.0.2.2:3000`). |

Never commit `.env` files or real secrets.

## Deployment (Vercel)

- Owner's Vercel team `sjkings-projects` (`team_m5bFNtahlMarAzpYMemIr9zG`), reachable from sessions through the **Vercel MCP** (not the `VERCEL_TOKEN`). Two projects, both building from the GitHub repo:
  - `skywash--admin-web` (root `apps/admin-web`) → https://skywash-admin-web.vercel.app. Production branch: `claude/intelligent-brown-xeisa4`.
  - `skywash-website` (root `apps/website`) → **https://skywash.space** (owner's domain, registered at Namecheap; DNS there: A record + `www` CNAME, both verified in Vercel). `www.skywash.space`, `skywash-ng.vercel.app` and `skywash-website-ruddy.vercel.app` stay attached and redirect to it from `next.config.ts` (`OTHER_HOSTS`, by `Host` header). **Never detach `skywash-ng.vercel.app`**: app 1.0.0 (versionCode 6) links to its `/privacy`. Its production branch is `main`: pushes to the working branch only make previews. The owner asked (2026-10-18) for `main` to follow the working branch, so after pushing, fast-forward it (`git push origin HEAD:main`; never force) and the website deploys itself. Without that, the MCP's `create_deployment` (gitSource: repo, branch, sha; `target: "production"`) deploys a specific commit. Dashboard "Redeploy" rebuilds the **same old commit**, not the latest.
  - Both have Standard Protection (Vercel Authentication on preview URLs only); production domains are public.
- The admin project needs `ADMIN_PASSWORD` and the database URL (`DATABASE_URL` or `DATABASE_POSTGRES_URL`); `vercel-build` applies migrations on each deploy. `.vercelignore` keeps build output and `node_modules` out of CLI uploads.
- A second project, `skywash` in the `posmo` team, was created by mistake and deleted on 2026-10-18. Don't recreate projects without asking.
- Cloud sessions can't reach `db.prisma.io` or `*.vercel.app` (network policy).
- The `VERCEL_TOKEN` in cloud sessions only sees the unrelated Posmo team projects. Never touch them, nor the owner's other projects (`beaut`, `posmo`…).

## Mobile builds (EAS)

- Android package / application ID: `com.skywash.app` (permanent once on Google Play). iOS bundle ID not set yet.
- `apps/mobile-app/eas.json`: `production` → Android App Bundle (`.aab`) for Google Play, `autoIncrement` with remote versioning; `preview` → installable `.apk` for testers. Both bake in `EXPO_PUBLIC_API_URL=https://skywash-admin-web.vercel.app` and `EXPO_PUBLIC_WEBSITE_URL` (the public website; the in-app privacy link is `${EXPO_PUBLIC_WEBSITE_URL}/privacy`). `eas-build.yml` refuses to build a profile without an https `EXPO_PUBLIC_WEBSITE_URL`.
- Build from `apps/mobile-app`: `npx eas-cli@latest build -p android --profile production`. Expo builds in the cloud and manages the signing key.
- Expo project `@sjkings/skywash` (id `3efb0282-4d97-422e-b1d7-53cdaa798243`, set in `app.json` `owner` + `extra.eas.projectId`). The Android upload keystore was generated by EAS and is stored on Expo's servers (`eas credentials` to view/download a backup).
- Cloud sessions can't build directly (`expo.dev` and Google's Android SDK downloads are blocked); use the `eas-build.yml` GitHub Action, which has the `EXPO_TOKEN` secret.
- `android.blockedPermissions` drops storage and overlay permissions the app doesn't use. Location (fine/coarse) is requested only for "Use my current location".
- Validate native config without building: `CI=1 EXPO_OFFLINE=1 npx expo prebuild --platform android --no-install`, inspect `android/`, then delete it (gitignored) and revert the `package.json` script changes prebuild makes.

## GitHub Actions (all manual: Actions tab → Run workflow, or the GitHub API)

| Workflow | What it does | Secrets |
|---|---|---|
| `eas-build.yml` | EAS Android build on Expo's servers; `production` → `.aab`, `preview` → `.apk`. Links the Expo project on first run. Build page and download link in the job summary. | `EXPO_TOKEN` |
| `api-check.yml` | Read-only check of the deployed API and website (site up, database reachable, admin protected, privacy redirects, website tracker, Vercel Authentication not blocking). Any ❌ fails the run. | — |
| `create-booking.yml` | Creates one long-lived drive-in demo booking (name/plate/status inputs) and prints its code. | `ADMIN_PASSWORD` |
| `api-booking-test.yml` | Creates one "Skywash API test" booking (plate `TEST`), tracks it, confirms it via admin, checks the flow guard, cancels it. Leaves a Cancelled booking in the database. | `ADMIN_PASSWORD` |

Cloud sessions can't reach the live site, the database or Expo, but GitHub's runners can: use these workflows to test or build, and read results with the GitHub job logs.

## API contract

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/bookings` | public | Mobile app submits a booking. Server generates `code` and computes `totalPrice`. → `201 { booking }` |
| `GET /api/bookings` | admin | List. `?status=active` (default: PENDING/APPROVED/IN_PROGRESS) \| `all` \| `PENDING,APPROVED`; `?mode=HOME\|PICKUP\|DRIVE_IN`; `?q=` code/name/plate. Newest first, max 200. |
| `GET /api/bookings/[code]` | public | Customer tracking by code. Case-insensitive, `SW-` optional. Returns no name/phone/notes. |
| `PATCH /api/bookings/[id]` | admin | `{ status }`. Only `PENDING→APPROVED→IN_PROGRESS→COMPLETED`, or `→CANCELLED` before completion. `409` on invalid/concurrent change. |
| `POST /api/auth/session` | — | `{ password }` → sets `skywash_admin` HttpOnly cookie (12 h). |
| `DELETE /api/auth/session` | — | Sign out. |

Admin auth = `skywash_admin` cookie (dashboard) **or** `Authorization: Bearer <ADMIN_PASSWORD>` (scripts). Cookie-authenticated writes must come from the same origin (CSRF guard in `lib/auth.ts`). `proxy.ts` redirects pages to `/login` without a valid cookie (and `/login` → `/` with one); API routes still check auth themselves. Admin `/privacy` is a permanent redirect in `next.config.ts` to the website's `/privacy` (config redirects run before `proxy.ts`, so no login).

## Setup rules & decisions

- **Next.js 16 and Expo 58 differ from older docs.** Before writing Next code, read `node_modules/next/dist/docs/`; for Expo, the versioned docs at docs.expo.dev (see each app's `AGENTS.md`).
- **Prisma 7**: `prisma.config.ts` holds the datasource URL (not `schema.prisma`); the client is generated to `apps/admin-web/lib/generated/prisma` (gitignored) and imported from `@/lib/generated/prisma/client`. The app connects through the `pg` driver adapter (`lib/prisma.ts`) — plain TCP Postgres, so it works with Prisma Postgres or any other Postgres. (The Neon adapter was dropped: it only speaks Neon's protocol.)
- Change the schema only via `prisma migrate dev` so every change has a committed migration in `prisma/migrations/`. Vercel applies pending migrations at deploy time (`vercel-build`: `prisma migrate deploy` before `next build`), for preview deploys too if they share the database — so migrations must be backward compatible with the code currently live.
- **Server is the source of truth** for prices, booking codes and status transitions — never trust totals or codes from the client. Prices/centers live in `apps/admin-web/lib/catalog.ts`.
- Booking codes: `SW-` + 4 chars from `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no 0/O/1/I/L), unique, generated in `lib/booking-code.ts`.
- Validation with zod in `lib/validation.ts`; route handlers return `{ error, issues? }` with 400/401/404/409.
- **The business is in Lagos, Nigeria.** Times are stored as UTC instants and **displayed in `Africa/Lagos`** (WAT, UTC+1, no DST; `BUSINESS_TIME_ZONE` in `lib/catalog.ts`, helpers in `lib/format.ts`). Never use the server's local time zone.
- Dashboard styling: Tailwind v4 classes; `app/globals.css` pins the `sky`/`slate`/`green`/`red` steps the design uses to the handoff's exact hex values. Status pill colors and labels live in `STATUS_STYLES` (`lib/format.ts`).
- The dashboard polls `GET /api/bookings?status=all` every 5 s while the tab is visible (stand-in until realtime). It only sees the 200 newest bookings, so stats and counts cover those.
- `apps/mobile-app/src/lib/api.ts` mirrors the Prisma enums by hand — update it whenever the schema changes.
- Prices, fees and centers exist in **three** places: `apps/admin-web/lib/catalog.ts` (what the server charges), `apps/mobile-app/src/lib/catalog.ts` and `apps/website/lib/site.ts` (display). Change all three together.
- Website: the booking tracker calls its own `/api/bookings/:code`, which `next.config.ts` rewrites to the admin API (`SKYWASH_API_URL`, default the live admin URL), so no CORS setup is needed. It shows only real data: no ratings, no "most booked" claims, no discounts. Store screenshots in `public/screens` are transparent phone renders; regenerate them (and `mobile-app/store-listing`) when the app's look changes.
- Mobile times: `src/lib/time.ts` computes Lagos time as a fixed UTC+1 instead of using `Intl` time zones (Hermes support varies). Bookings are sent as ISO with offset, e.g. `2026-10-19T09:30:00+01:00`. Past slots for today are disabled.
- Mobile text: always use `components/Text` with `weight` (custom fonts need a family per weight on Android). Archivo loads in `src/app/_layout.tsx` behind the splash screen.
- In cloud sessions docs.expo.dev is blocked: read the type definitions in `node_modules` instead. `expo-router` lives in `apps/mobile-app/node_modules`.
- CORS only affects browser clients; the native app sends no `Origin`. Never enable `Access-Control-Allow-Credentials`.
- Logo: the sky-blue rounded tile with Lucide's `droplets` icon (`Droplets` in lucide-react / lucide-react-native) plus the "Skywash" wordmark, as in the dashboard header.
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
- [x] Database: Prisma Postgres; migration `20261018000000_init` applied (confirmed in the Vercel build log)
- [x] Vercel `skywash-admin-web` verified live on 2026-10-18 by the `API check` and `API booking test` workflows: public, database connected, admin auth works, full book → confirm → cancel flow passes (test booking `SW-WBM2`, left Cancelled)
- [x] Admin dashboard UI (login + bookings table/detail) from `Skywash Dashboard.dc.html`
- [x] Mobile screens (Expo Router) from `Skywash App.dc.html`: all screens, wired to the API; tested in a web build with the API mocked
- [x] Mobile: photo placeholders replaced with large icons (package icon on detail and package rows, sparkle on the promo, building on centers); map preview removed — no Maps API key needed. Address comes from typing or "Use my current location" (OS geocoder, no key)
- [x] Promo ("20% off first wash") removed from Home — there are no discounts
- [x] Logo (Lucide "droplets", white on brand `#0EA5E9`, from the design) used for the mobile app icon, Android adaptive icon, splash and web favicon, and the admin favicon (`app/icon.png`). Swap in the owner's own logo file if they provide one
- [x] Mobile build config: `com.skywash.app`, `eas.json` (production `.aab`, preview `.apk`), production API URL
- [x] Google Play reviewer booking: **`SW-G72C`** ("Google Play review", plate `REVIEW`, drive-in Skywash Lekki, Confirmed, dated 2026-11-16, Lagos time). Replaced `SW-ZHPC` (San Diego center; cancelled). Staff must not cancel or complete it while the app is in review. Before 2026-11-16 passes (or if review drags on), run `create-booking.yml` with `replace_code: SW-G72C` and update the Play Console note. Reviewers' own test bookings will also show up in the dashboard; cancel those.
- [x] First EAS production build: `.aab` 1.0.0 (versionCode 2), 2026-10-18 — https://expo.dev/accounts/sjkings/projects/skywash/builds/fe98c076-2fc2-474c-a650-98a2f10e6666
- [x] Privacy policy: public page on the website, https://skywash.space/privacy (admin `/privacy` and `skywash-ng.vercel.app/privacy` redirect there, for app 1.0.0 and old links), for business "Skywash", Lagos, Nigeria (Nigeria Data Protection Act 2023, cross-border transfer disclosure), contact skywashservice@gmail.com; linked from the bottom of the app's Home screen (`PRIVACY_POLICY_URL` in `src/lib/api.ts`). Keep it in sync if data collection changes (e.g. adding analytics or payments)
- [x] Lagos localisation (owner asked us to make up realistic values): centers Skywash Lekki (`lekki`, Lekki Phase 1), Skywash Ikeja (`ikeja`, Ikeja GRA), Skywash Victoria Island (`victoria-island`), area names only, no street addresses, all open 8am–7pm; time slots 08:00–15:30 (last start leaves room for a 2.5 hr Full Detail before closing); prices in whole Naira: Exterior ₦5,000, Interior ₦7,000, Engine Bay ₦10,000, Full Detail ₦25,000, home fee ₦3,000, pickup fee ₦5,000. Distances removed. Format money with `formatNaira` (both catalogs). Payment: cash, card or bank transfer on completion
- [x] Release build for Google Play: `.aab` 1.0.0 (versionCode 4, Lagos/Naira/privacy link), 2026-10-18 — GitHub Release `android-v1.0.0-4`, Expo build `ac212cfd-11bd-4481-aaf6-4583f74ccfc2`. Live booking test passes with Naira pricing (`SW-XTMJ`, cancelled). versionCode 3 was an abandoned build; codes 2 and 3 must not be uploaded
- [x] Final release build: `.aab` 1.0.0 (versionCode 6), 2026-10-18: no ratings, privacy link https://skywash-ng.vercel.app/privacy (forwards to skywash.space). GitHub Release `android-v1.0.0-6`. This is the one to upload; earlier codes (2–5) must not be
- [ ] Owner uploads the `.aab` in Play Console: privacy URL https://skywash.space/privacy, App access note with reviewer code `SW-G72C`
- [x] Website `apps/website` built from `Skywash Landing.dc.html` with real prices/centers/screens; privacy policy page copied there
- [x] Website deployed (2026-10-18): Vercel project `skywash-website`, https://skywash-ng.vercel.app (`skywash-website.vercel.app` is taken by another account); custom domain https://skywash.space since 2026-10-19, and `eas.json` uses it from the next app build. Privacy policy moved there: admin `/privacy` redirects, `eas.json` sets `EXPO_PUBLIC_WEBSITE_URL`
- [x] Made-up package ratings/review counts from the design removed from the app (Home rows, service detail) and from the store/website screenshots. Don't add ratings back unless they come from real reviews
- [ ] Mobile: bell and filter buttons on Home are decorative; test on real devices
- [ ] Realtime updates (dashboard + "My booking"), rate limiting on public endpoints
