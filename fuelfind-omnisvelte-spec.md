# FuelFind — OmniSvelte Build Specification

**Brief:** SD-07, Fuel Station Finder
**Problem:** Drivers in Nigeria waste time and fuel hunting for stations that actually have fuel at a fair price, especially during scarcity periods. Prices and availability shift fast and word-of-mouth doesn't scale.
**MVP goal:** A crowdsourced fuel price/availability finder — station list with distance, price reports from real users, freshness-aware display, filters, deployed and demoable by **July 31**.

This document is the single source of truth for the build agent. Follow it in order. Where a decision is marked `[DECISION]`, that choice has already been made — don't re-litigate it, just implement it.

---

## 1. Scope

### In scope (MVP)
- Station list (not map, see §3) with name, address, distance from user, last reported price, freshness indicator
- Price report submission (station, fuel type, price, optional "no fuel" flag)
- Freshness-aware price aggregation (see §5)
- Filters: fuel type, max distance, "reported in last 24h only"
- Light auth (so reports aren't fully anonymous)
- Seed data: 25–30 real stations in one Nigerian city (see §7)
- Deployed, public URL

### Explicitly out of scope (do not build)
- Interactive map / Leaflet / Google Maps — list + distance sort only, see §3
- Payments, loyalty, ads
- Admin dashboard beyond a basic seed script
- Native mobile app / Tauri packaging
- Push notifications
- Station owner accounts or verified/claimed listings
- Multi-city support (single city is fine for MVP)

---

## 2. Tech stack

`[DECISION]` — matches existing architectural preferences, do not substitute alternatives.

| Layer | Choice |
|---|---|
| Framework | **OmniSvelte** (SvelteKit + Svelte 5 runes) |
| Styling | Tailwind CSS v4 + shadcn-svelte |
| ORM / DB | **OmniSvelte `defineSchema` & ActiveRecord Models** + PostgreSQL |
| Auth | **OmniSvelte Built-in Auth** (Better Auth under the hood) |
| Offline queue | Dexie.js — queue price reports submitted with poor/no connectivity, sync on reconnect |
| Server logic | **OmniSvelte Remote Functions** (`resource`, `query`, `form`, `command`) |
| Package manager | pnpm |
| Deployment | Vercel (adapter-vercel) or Railway; Postgres via Neon or Supabase |
| Geolocation | Browser Geolocation API (`navigator.geolocation`) — no external geocoding service needed |

No AI provider is needed for this MVP — skip MCP/AI integrations entirely, it doesn't serve this feature set.

---

## 3. Why list, not map

`[DECISION]` — a map (Leaflet/Mapbox) adds real implementation and styling time without adding to the core product insight being demonstrated, which is the **freshness-aware pricing logic**, not the visualization.

Build: a **sorted list**, distance computed client-side via Haversine formula from the user's geolocation (or a manually entered location/city if geolocation is denied), sortable by distance or price. This is faster to build correctly and is the honest MVP choice.

If time genuinely allows after everything else in §9 is done and tested, a simple Leaflet map view can be added as a stretch enhancement — not before.

---

## 4. Data model (OmniSvelte `defineSchema`)

Use OmniSvelte's schema definition API.

```ts
// src/lib/db/schemas/station.schema.ts
import { defineSchema, field } from 'omni-svelte/schema';

export default defineSchema('stations', {
  id: field.serial().primaryKey(),
  name: field.string(255).required(),
  brand: field.string(255).optional(), // e.g. "NNPC", "Mobil", "Total", "Independent"
  address: text('address').required(),
  lat: field.float().required(),
  lng: field.float().required(),
}, {
  timestamps: true, // auto-adds created_at and updated_at
});
```

```ts
// src/lib/db/schemas/price_report.schema.ts
import { defineSchema, field } from 'omni-svelte/schema';

export default defineSchema('price_reports', {
  id: field.serial().primaryKey(),
  stationId: field.integer().required(), // References stations.id
  userId: field.string(255).required(),  // References auth user.id
  fuelType: field.enum('pms', 'diesel', 'kerosene').required(),
  pricePerLiter: field.integer().required(), // store in naira, no decimals needed
  hasFuel: field.boolean().default(true), // false = "no fuel" report
}, {
  timestamps: true, // we will use created_at as reported_at
  indexes: ['stationId', 'created_at']
});
```

*(Note: Define relationships in a separate file or using OmniSvelte's model hooks so `Station.hasMany(PriceReport)` works).*

---

## 5. Freshness / aggregation logic

This is the core product logic.

`[DECISION]` rules:

1. For each station + fuel type, the **displayed price** is the price from the **most recent report within the last 24 hours**.
2. If there are 2+ reports within the last 3 hours, show the **median** of those (not mean — resistant to a single bad-faith outlier report), labeled "recent consensus."
3. If the most recent report is older than 24 hours, display it grayed out with a "Last reported X hours/days ago — may be outdated" label instead of a confident price.
4. If a station has **any** "no fuel" report within the last 6 hours and no contradicting "has fuel" report since, show a "Reportedly out of fuel" badge above the price.
5. No reports at all → show "No reports yet — be the first" with a prominent report CTA.

Implement this as an OmniSvelte remote function (`query()`) or inside a custom `resource()` list query. Example: `Station.query().with('reports').all()` and process the freshness server-side before returning to the client.

---

## 6. Pages / routes

| Route | Purpose |
|---|---|
| `/` | Station list — sorted by distance (default) or price, filter bar at top |
| `/stations/[id]` | Station detail — price history (last ~10 reports), report form |
| `/report/[stationId]` | Standalone report form (also embeddable on detail page as a component) |
| `/login`, `/signup` | OmniSvelte Auth UI flows |
| `/onboarding` (optional) | One-time location permission prompt with a manual-entry fallback |

Use OmniSvelte's remote functions (`data.remote.ts`) for all data fetching and mutations:
- `export const { list: stations } = resource(Station, ...)`
- `export const submitReport = form(PriceReport.validation.create, ...)`

---

## 7. Seed data

`[DECISION]` — pick **one city** you can source real or realistic station data for. Write a `seed.ts` script utilizing OmniSvelte's `Model.create()` that inserts 25–30 stations with real names/addresses/approximate coordinates. Do not leave this to be entered manually through the UI.

Also seed 2–3 demo user accounts and a handful of realistic price reports (varying timestamps, including some intentionally >24h old and one "no fuel" report) so the freshness logic in §5 has something to visibly demonstrate.

---

## 8. Auth

Use OmniSvelte's built-in Better Auth integration (`import { signIn, signUp } from 'omni-svelte/auth/client'`). Email/password only. No need for email verification flows, password reset, or social login for MVP. Reports must be tied to a logged-in `userId`.

---

## 9. Build order (for the agent)

Work in this order — each step should be independently testable before moving to the next:

1. Project scaffold: Run `npx omni init fuelfind` (select pnpm, Tailwind, shadcn).
2. OmniSvelte schemas (§4): Create schemas in `src/lib/db/schemas/`, run `omni db push` or `omni db generate/migrate`.
3. Auth: Ensure OmniSvelte auth is wired up, build simple login/signup pages.
4. Seed script (§7): Use `Station.create()`, run it, confirm data via `omni db studio`.
5. Station list page: Use OmniSvelte `resource(Station)` or `query()`, no filters yet, distance via Haversine from a hardcoded test location.
6. Geolocation integration: request browser location, fallback to manual city/location entry if denied.
7. Freshness/aggregation logic (§5): Implement server-side processing on the fetched ActiveRecord models.
8. Filters (fuel type, distance, 24h toggle): Wire up OmniSvelte's `fromURL()` utility to pass URL params to the remote function.
9. Station detail page + report form (`form()` remote function) + Dexie offline queue.
10. Polish: loading states, empty states, mobile responsiveness (test at 375px width first).
11. Deploy (Vercel + Neon/Supabase), verify the live URL end-to-end.
12. Write README.md.
13. Record demo video.

---

## 10. Acceptance checklist (must all be true before submission)

- [ ] Live deployed URL loads and works without dev tools open
- [ ] List shows 25+ seeded stations sorted by distance
- [ ] At least one station displays a "recent consensus" median price
- [ ] At least one station displays a ">24h old, may be outdated" state
- [ ] At least one station displays a "reportedly out of fuel" badge
- [ ] Filters (fuel type, distance, 24h toggle) visibly change the list via remote function params
- [ ] A logged-in user can submit a new price report via an OmniSvelte `form()` and see it reflected
- [ ] Submitting a report while offline queues it in Dexie and syncs when back online
- [ ] Mobile viewport (375px) is fully usable

---

## 11. Environment variables

```
DATABASE_URL=
OMNI_AUTH_SECRET= # Or whatever OmniSvelte uses for Better Auth secret
PUBLIC_APP_NAME=FuelFind
```
