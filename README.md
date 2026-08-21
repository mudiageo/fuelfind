# FuelFind

A crowdsourced fuel price and availability finder built for OmniSvelte. FuelFind helps drivers locate stations with fresh, accurate fuel pricing, filtering by distance, fuel type, and report recency.

## Features (MVP)
- **Station List**: See 25+ demo stations sorted by live geolocation distance.
- **Freshness Aggregation**: Smart price labels ('Recent consensus', 'May be outdated', 'Out of fuel') to help filter noise.
- **Live Filtering**: Filter by Fuel Type (PMS/Diesel/DPK), max distance, and 24h freshness.
- **Offline Reliability**: Dexie.js offline queue intercepts price reports submitted with poor connectivity and automatically syncs when reconnected.
- **Built-in Auth**: Sign in / Sign up via OmniSvelte Better Auth integration.
- **OmniSvelte Remote Functions**: End-to-end type-safe CRUD operations, powered by `resource()` generator and `omni-svelte/remote`.

## Setup & Running Locally

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Generate Database Migrations & Push (if running from scratch):
   ```bash
   pnpm exec omni db generate
   pnpm exec omni db push
   ```

3. Seed Initial Demo Data:
   ```bash
   pnpm dlx tsx src/lib/db/seed.ts
   ```

4. Start Development Server:
   ```bash
   pnpm run dev
   ```

## Tech Stack
- **Framework**: OmniSvelte (SvelteKit + Svelte 5 runes)
- **Styling**: Tailwind CSS v4 + shadcn-svelte
- **Database**: PostgreSQL (via Drizzle ORM / OmniSvelte ActiveRecord schemas)
- **Offline Sync**: Dexie.js
