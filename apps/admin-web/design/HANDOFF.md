# Handoff: Skywash — Car Wash Booking (Mobile App + Ops Web App)

## Overview
Skywash is a car wash booking service with **no sign-up or sign-in**. Customers book a wash and receive a **booking code** (format `SW-XXXX`); that code is the only way to look the booking up later.

Two deliverables:
1. **Customer mobile app (React Native / Expo)** — browse services, book, and track a booking by code.
2. **Operations web app (React)** — staff receive incoming bookings in real time, view details, and advance status.

Service types:
- **Home service** — team travels to the customer's address (+$10).
- **Car center** with two options:
  - **Pickup & return** — we collect the car from an address and bring it back (+$15).
  - **Drive in** — customer drives to a selected center ($0 fee).

Home service and Pickup require the customer to enter a location. Drive in requires choosing a center.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code. Open them in a browser (keep `support.js` next to them). The task is to **recreate these designs** in:
- **Mobile:** React Native (Expo recommended, TypeScript, React Navigation native stack + bottom tabs).
- **Web:** React (Vite or Next.js, TypeScript).
- **Backend:** a shared API + database (e.g. Supabase/Postgres, or Node + Postgres) with realtime updates (Supabase Realtime, WebSockets or SSE) so new bookings and status changes appear live.

In the prototype, both apps share data via browser `localStorage` (`skywash.bookings`, `skywash.status`) and the dashboard polls every 2s. Replace this with the real API.

Template syntax in the files: `{{ path }}` holes and `<sc-for>` / `<sc-if>` are prototype-runtime constructs; the logic class at the bottom of each file (`class Component`) holds all data, state and handlers — read it for exact behavior.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii and copy. Recreate closely. Image areas (service photos, promo banner photo, map) are **placeholders** — use real photos and a real map (react-native-maps / Google Places autocomplete).

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| brand / sky-500 | `#0EA5E9` | Primary buttons, header bg, selected states, active tab, progress |
| sky-600 | `#0284C7` | Icons on tinted fills |
| sky-700 | `#0369A1` | Prices, links, accent text (body-size text in brand) |
| sky-200 | `#BAE6FD` | Outline of soft buttons |
| sky-100 | `#E0F2FE` | Icon circles, tag fills, subtitle text on brand bg |
| sky-50 | `#F0F9FF` | Selected card bg, soft button bg, selected table row |
| ink | `#0F172A` | Primary text, dark buttons, promo card |
| slate-800 | `#1E293B` | Promo photo area |
| slate-700 | `#334155` | Secondary strong text |
| slate-600 | `#475569` | Body copy |
| slate-500 | `#64748B` | Muted text / labels |
| slate-400 | `#94A3B8` | Placeholder, inactive tab |
| slate-300 | `#CBD5E1` | Input border (find screen), inactive timeline dot |
| slate-200 | `#E2E8F0` | Borders, dividers, unselected card border |
| slate-100 | `#F1F5F9` | Segmented track (web) |
| app bg | `#F5F8FB` | Screen background |
| placeholder img | `#DCE8F0` / `#C9D8E3` | Image placeholders |
| white | `#FFFFFF` | Cards |
| star | `#F59E0B` | Rating star |

Status colors (bg / text):
- New / Received: `#E0F2FE` / `#0369A1`
- Confirmed: `#E2E8F0` / `#334155`
- In progress: `#FEF3C7` / `#92400E`
- Completed: `#DCFCE7` / `#166534`
- Cancelled: `#FEE2E2` / `#991B1B`
- Live indicator: bg `#DCFCE7`, dot `#16A34A`, text `#166534`
- Error banner: bg `#FEF2F2`, text `#991B1B`

### Typography
Font: **Archivo** (Google Fonts) — weights 400, 500, 600, 700, 800. Use `@expo-google-fonts/archivo` on mobile.

| Role | Size / weight |
|---|---|
| Hero (confirmation) | 30 / 800, line-height 1.1 |
| Promo discount | 40 / 800, line-height 1 |
| Booking code (confirmation) | 40 / 800, letter-spacing 0.1em |
| Screen title | 26 / 800 |
| Step heading | 23 / 800 |
| Section title | 19 / 700 |
| Card title | 15–16 / 700 |
| Body | 14–15 / 400–500, line-height 1.45–1.55 |
| Label / meta | 12–13 / 400–600 |
| Tab label | 12 / 600 |
| Table header (web) | 12 / 600 uppercase, letter-spacing 0.04em |

### Spacing
4-based: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26. Screen horizontal padding **20**. Section gap **26** on Home.

### Radii
- Phone sheet header bottom corners: 28
- Cards: 18–20 (large), 16 (option tiles), 14 (inputs, icon tiles, buttons), 12 (small buttons/time slots), 10 (seg options), 8 (tags)
- Pills/status: 20
- Circles: 50%

### Shadows
- Home lookup card: `0 6px 20px rgba(14,165,233,.10)`
- Bottom CTA bar: `0 -6px 20px rgba(15,23,42,.06)`

### Icons
Lucide (`lucide-react-native` / `lucide-react`). Used: droplets, map-pin, chevron-down, bell, search, sliders-horizontal, ticket, spray-can, armchair, sparkles, cog, star, clock, house, calendar-plus, arrow-left, share-2, check, building-2, truck, car-front, locate-fixed, info, copy, circle-alert, calendar, car, user, signal/wifi/battery (status bar only — omit in RN), inbox, loader, circle-check, phone, arrow-right, arrow-up-right, image.

---

## Data Model

```ts
type Mode = 'home' | 'pickup' | 'self';
type Status = 'new' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface Booking {
  code: string;        // 'SW-' + 4 chars from 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' (no 0/O/1/I/L). Unique — generate server-side.
  pkgId: string;       // 'ext' | 'int' | 'full' | 'eng'
  pkgName: string;
  mode: Mode;
  address: string;     // required for home & pickup; '' for self
  lat?: number; lng?: number; // add in real build
  notes: string;       // directions for team (optional)
  center: string;      // center name for self; 'Nearest center' for pickup; '' for home
  centerId?: string;
  date: string;        // 'YYYY-MM-DD'
  time: string;        // 'HH:mm'
  vehicle: 'Sedan' | 'SUV' | 'Hatchback' | 'Truck';
  plate: string;       // uppercase
  name: string;
  phone: string;
  total: number;       // package price + fee
  status: Status;      // starts 'new'
  createdAt: number;
}
```

Packages:
| id | name | short | icon | price | duration | rating | reviews |
|---|---|---|---|---|---|---|---|
| ext | Exterior Wash | Exterior | spray-can | 25 | 45 min | 4.8 | 412 |
| int | Interior Clean | Interior | armchair | 35 | 1 hr | 4.7 | 286 |
| full | Full Detail | Full detail | sparkles | 89 | 2.5 hrs | 4.9 | 365 |
| eng | Engine Bay | Engine bay | cog | 45 | 40 min | 4.6 | 98 |

Descriptions and "What's included" lists are in `PKGS` in `Skywash App.dc.html`.

Centers: Skywash Mission Bay (1200 Garnet Ave, San Diego · 1.2 mi · 7am–8pm), Skywash North Park (3015 University Ave, San Diego · 2.8 mi · 7am–7pm), Skywash Chula Vista (455 Broadway, Chula Vista · 7.4 mi · 8am–6pm).

Fees: home +$10, pickup +$15, self $0. Payment: "Pay on completion. Cash or card." (no in-app payment).

Time slots: 08:00, 09:30, 11:00, 12:30, 14:00, 15:30, 17:00 (displayed as `8:00 AM` etc). Dates: today + next 5 days.

### API (suggested)
- `POST /bookings` → `{ code }` (no auth). Rate-limit by IP/phone.
- `GET /bookings/:code` → public booking view (customer). Codes are case-insensitive; accept input with or without `SW-` prefix.
- `GET /admin/bookings?mode=&q=` (staff auth required) — list.
- `PATCH /admin/bookings/:code { status }` — staff only.
- Realtime channel for inserts/updates on bookings.

Staff dashboard **must** be behind auth in production even though customers have none.

---

## Mobile App — Screens

Frame reference: 390×844 (iPhone 14/15). Background `#F5F8FB`. Status bar is light text on Home and Confirmation (brand bg), dark elsewhere.

### Bottom tab bar (Home, My booking)
Height 88 incl. home indicator, white, top border 1px `#E2E8F0`. Three items: **Home** (house), **Book** (calendar-plus — starts booking flow for currently selected package, default Full Detail), **My booking** (ticket). Icon 22, label 12/600. Active `#0EA5E9`, inactive `#94A3B8`. Shown only on Home and My booking.

### 1. Home
- **Header** bg `#0EA5E9`, padding 62/20/26 (top accounts for safe area), bottom radius 28, vertical gap 18.
  - Row: "Location" (13, `#E0F2FE`) over "San Diego, CA" (17/600 white) with map-pin + chevron-down. Right: 44×44 bell button, radius 14, bg `rgba(255,255,255,.2)`.
  - Row: search field (flex, 48h, white, radius 14, search icon + "Search services" placeholder `#94A3B8`) + 48×48 white filter button (sliders icon `#0284C7`).
- **"Already booked?" card** — white, radius 20, padding 16, shadow above. Title with ticket icon (15/700). Row: input "Enter booking code" (46h, radius 12, border 1.5 `#E2E8F0`, bg `#F8FAFC`, uppercase, letter-spacing .04em) + **Find** button (46h, `#0F172A`, white 15/600, radius 12). Find → My booking screen with lookup run.
- **Special for you** — title 19/700. Promo card 160h, radius 20, bg `#0F172A`; right 48% is photo area. Content: "Limited time" white pill (11/600), "First wash" 18/700 + "20% off" 40/800 white, footer "All services · Home or center" (11, `#94A3B8`) and **Claim** pill button (`#0EA5E9`, 13/600) → Full Detail detail.
- **Services** — 4-column grid. Circle 64 bg `#E0F2FE`, icon 26 `#0284C7`, label 12 `#334155`. Tap → Service detail.
- **Popular packages** — list rows: white, radius 18, padding 10; 76×76 image tile radius 14; name 15/700; meta 13 `#64748B` (star `#F59E0B` rating, clock duration); price 16/700 `#0369A1`. Tap → Service detail.

### 2. Service detail
- Hero image 330h (placeholder). Floating 44 circular white buttons at top 60: back (left), share (right).
- Body padding 20, gap 18: "Car washing" tag (`#E0F2FE`/`#0369A1`, 13/600, radius 8) + rating "(N reviews)". Title 26/800. Meta: clock duration, map-pin "At home or at a center". **About** 16/700 + description 14 `#475569` lh 1.55. **What's included** — rows with 22 circle check (`#E0F2FE` / `#0284C7`).
- Sticky bottom bar: "From" (12) / "$89" (22/800) + **Book service now** (54h, flex, radius 16, `#0EA5E9`, 16/700).

### Booking flow (4 steps)
Shared header: back button (42 circle white), title 17/700 + "{Package} · Step N of 4" (12 `#64748B`), progress bar 5h radius 3 track `#E2E8F0` fill `#0EA5E9` at N×25%. Shared sticky CTA: full-width 54h radius 16 `#0EA5E9` "Continue" (last step "Confirm booking"); **opacity 0.4 and no-op until step valid**.

**Step 1 — Service type** ("Where should we wash your car?" 23/800)
- Option cards (white, radius 18, padding 16, border 2px — `#0EA5E9` selected / `#E2E8F0`): 48 icon tile radius 14.
  - **Home service** (house) — "+$10" right (13/600 `#0369A1`) — "Our team comes to your home or office with water and power."
  - **Car center** (building-2) — "Washed at one of our centers. We can collect it, or you drive in."
- If Car center selected, reveal "How does your car get there?" + 2-col tiles (radius 16, padding 14, selected bg `#F0F9FF`):
  - **Pickup & return** (truck) — "We collect and bring it back. +$15"
  - **I'll drive in** (car-front) — "Bring it to a center at your time."
- Valid when Home, or Center + a sub-option.

**Step 2a — Location** (Home or Pickup)
- Title: Home → "Where should we come?"; Pickup → "Where should we pick up your car?"
- Map preview 170h radius 18 (use real map with draggable pin).
- **Use my current location** soft button (46h, border 1.5 `#BAE6FD`, bg `#F0F9FF`, `#0369A1` 14/600, locate-fixed icon) → device geolocation + reverse geocode.
- Field "Address" (placeholder "Street, number, city"); field "Directions for our team (optional)" (placeholder "Gate code, parking spot, where keys are"). Inputs 50h, radius 14, border 1.5 `#E2E8F0`, white.
- Hint (13 `#64748B`, info icon): Pickup → "We return the car to this same address when the wash is done."; Home → "Make sure there is room for our van next to the car."
- Valid when address length > 3 (real build: valid geocoded place).

**Step 2b — Choose a center** (Drive in)
- List of center cards (radius 18, border 2 selected/unselected, 64 image tile): name 15/700, address 13, "{dist} · Open {hours}" 12/600 `#0369A1`. Valid when one selected. Sort by distance in real build.

**Step 3 — Time & details**
- **Date** horizontal scroller: 56w chips radius 14, weekday 12 ("Today" for first) + day 19/700; selected `#0EA5E9` white text.
- **Time** title varies: Home "Arrival window", Pickup "Pickup time", Self "Drop-off time". 3-col grid of 42h slots radius 12, border 1.5; selected filled brand.
- **Vehicle** segmented control (track `#E2E8F0` radius 14 padding 4; selected white) — Sedan, SUV, Hatchback, Truck; then Plate input (uppercase).
- **Contact** — Your name, Phone number (tel). Note: "Used only to reach you about this booking. No account is created."
- Valid when time, name and phone set.

**Step 4 — Review** ("Review your booking")
- Summary card rows with 34 icon tile (`#F0F9FF`/`#0284C7`): Service, Type, Address/Center/Pickup & return address, When, Vehicle, Contact.
- Price card: package line, fee line ("Home service fee" / "Pickup & return" / "Center drop-off"), divider, **Total** 17/800 in `#0369A1`, "Pay on completion. Cash or card."
- CTA "Confirm booking" → create booking → Confirmation.

### 3. Confirmation
Full-screen `#0EA5E9`, padding 90/24/40, gap 22. White 64 circle with check. "Booking received" 30/800; "Save this code. It's the only way to find your booking." (15, `#E0F2FE`). White card radius 22: "Your booking code" label, code 40/800 letter-spacing .1em, **Copy code** soft button (label → "Copied"), divider, "{Package} · {Type}" + "{When}". Bottom: **Track this booking** (54h `#0F172A`) and **Back to home** (54h outline 2px white). Real build: also offer Share and add-to-wallet/SMS of the code; store recent codes on device (AsyncStorage) so users can see them without typing — still no account.

### 4. My booking (find by code)
- Title "Find my booking" 26/800 + "Enter the code you received when you booked."
- Input (52h radius 14 border 1.5 `#CBD5E1`, 17/600 uppercase letter-spacing .08em, placeholder "SW-XXXX") + Find (brand).
- Not found: error banner "No booking found for that code. Check it and try again."
- Found: card radius 20 padding 18 — code 20/800 + status pill; **timeline** of 4 steps (20 dot, 2px connector; done = `#0EA5E9`, pending dot `#CBD5E1`, connector `#E2E8F0`; current step bold 700):
  1. Booking received 2. Confirmed by our team 3. Home: "Team on site · washing" / Pickup: "Picked up · washing" / Self: "Washing" 4. Pickup: "Returned" / else "Done".
  Then rows: Service, Type, When, Address/Pickup from/Center, Total.
- Status should update live (subscribe to booking by code).

Type labels: home "Home service", pickup "Center · pickup & return", self "Center · drive in".

---

## Ops Web App — Screen

Responsive; max content width 1440, padding 28/24.

- **Top bar** 64h white, bottom border `#E2E8F0`: 34 brand tile with droplets + "Skywash" 18/800 + "Operations" `#94A3B8`. Right: **Live** pill.
- **Heading** "Bookings" 28/800 + "New bookings from the customer app appear here automatically." Right: full date.
- **Stats** grid (auto-fit min 170): New, Scheduled today, In progress, Completed — white radius 16, label 13 with brand icon, value 28/800.
- **Main row** (wraps): table panel (flex 1 1 640) + detail panel (flex 0 1 380, sticky top 20).
  - Table toolbar: segmented filter tabs All / Home service / Pickup / Drive-in with counts; search "Code, name or plate".
  - Table columns: Code (700, letter-spacing .04em), Customer (name + "vehicle · plate"), Service, Type pill (icon + Home/Pickup/Drive-in on `#F0F9FF`/`#0369A1`), Location (address or center), When ("Today · 9:30 AM"), Status pill. Row click selects; selected row bg `#F0F9FF`. Empty: "No bookings match this filter."
  - Detail panel: code 26/800 + status; type banner (`#F0F9FF`); address label varies ("Service address" / "Pickup & return address" / "Drive-in center") + **Open in Maps** link (Google Maps search URL) for home/pickup; Directions (if any); 2-col When/Service/Vehicle/Total; customer name + phone with tel: call button.
  - Primary action advances status `new → confirmed → in_progress → completed`. Labels: new "Confirm booking"; confirmed — home "Team on site · start wash", pickup "Car picked up · start wash", self "Car arrived · start wash"; in_progress — pickup "Car returned · complete", else "Mark completed". **Cancel booking** (outline, red text) available until completed/cancelled.
- New bookings are sorted to the top. Real build: sound/desktop notification on new booking, assign to team/van, map view of home/pickup jobs.

---

## Interactions & State (mobile)
State: `screen`, `pkg`, `mode ('home'|'center')`, `how ('pickup'|'self')`, `address`, `notes`, `centerId`, `dateIdx`, `time`, `vehicle`, `plate`, `name`, `phone`, `code`, `lookup`, `result`. Effective kind = home | pickup | self. Back from each step returns to previous; back from Step 1 returns to Service detail. Booking code input normalizes: trim, uppercase, strip spaces, add `SW-` prefix if missing.

Transitions: use native stack push/pop; no custom animations specified.

## Assets
No bundled assets. Needed: service photos (4), promo photo, center photos (3), map tiles. Icons: Lucide. Font: Archivo.

## Files
- `Skywash App.dc.html` — customer mobile app prototype (template + logic class with all data/behavior).
- `Skywash Dashboard.dc.html` — ops web app prototype.
- `support.js` — prototype runtime, needed only to open the HTML files locally. Not for production.

Demo seed booking code: `SW-4FQ2` (dashboard also seeds 6 sample bookings).
