# TravelX

TravelX is a mobile-first Expo app that helps visitors feel ready for everyday life in **Tokyo, Japan** and **Kozhikode, Kerala**. It includes city starter packs, visitor-focused local app listings, practical travel notes, and saved essentials. There is no AI assistant or trip planner.

## Run the app

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and add the Supabase project URL and **publishable** key. Never put a Supabase secret or service-role key in an Expo app.
3. Run **all of `supabase/setup.sql`** in your Supabase SQL Editor. It installs the schema, access policies, signup profiles and researched city catalog in one transaction. It is safe to rerun, including if the original migration was already installed.
4. Use `npm run web` to open a laptop browser preview, or `npm start` to launch the app in Expo Go.

Email/password auth uses the Supabase Auth service. Email confirmation follows the project’s Auth settings. City guides and app information are available without an account; accounts are optional and enable syncing saved city packs and apps.

## Main features

- Tokyo and Kozhikode destination selection with destination photography.
- A four-step travel setup for language, local phone number, payment preference, and step-free access.
- Local app suggestions grouped by transport, taxi, food, and connectivity, with provider links and visitor notes.
- Expandable, source-linked practical guidance for transport, taxis, payments, etiquette, phrases, toilets, luggage and charging.
- Locally saved city packs and apps, with optional Supabase account sync.

The main navigation contains City, Apps and Saved.

## Backend setup and verification

The app reads `travelx_apps` and `travelx_guides` from Supabase, with bundled content available offline. The initial catalog contains 13 provider entries and 13 source-linked guide entries across the two cities. Visitors can read the catalog but cannot edit it. Update it through the SQL Editor as a project administrator.

Paste the complete `supabase/setup.sql` into the SQL Editor and run it. After it succeeds, restart the app to fetch the hosted catalog. To verify the deployed connection, sign up with two accounts, confirm their email addresses, save a city pack and confirm it appears on another device signed into the same account. Confirm that a different account cannot see those saved items.

Saved packs use per-account local storage and ordered remote writes. Unsynced edits survive restarting the app; the Saved screen offers a retry. Guest bookmarks remain separate from account bookmarks.

Run `npm run backend:prepare` to rebuild SQL after editing the bundled catalog. For an already deployed database, apply the regenerated `202610110003_seed_catalog.sql` to update its catalog; the setup ledger skips previously applied phases.

`npm run backend:test` executes the setup twice in local PostgreSQL (PGlite) and checks signup profiles, catalog permissions, account isolation and historical migration compatibility. It does not verify Supabase email delivery or HTTP access; those require the deployed project.

Together has been removed from the app, including its routes, map components and native map dependency. Historical SQL migrations and their regression tests are retained for existing database compatibility; the app no longer calls the activity or chat APIs. This change does not delete existing server data.

## Project layout

```text
src/app/                 Expo Router screens and layouts
src/components/           Reusable UI components
src/data/                 Tokyo and Kozhikode city/app content
src/lib/                  Supabase and external-link helpers
src/screens/              Auth and destination screens
src/state/                Auth and travel-pack state
src/theme/                Design tokens
assets/cities/             Destination photography and license credits
supabase/migrations/       Database schema, policies and RPCs
```

City photography attribution and license links are included in the city guide and [assets/cities/ATTRIBUTION.md](assets/cities/ATTRIBUTION.md). App and local guidance entries link to official providers or public-information sources; confirm current details with each provider.

## Checks

- `npx tsc --noEmit`
- `npx expo lint`
- `npx expo export --platform web --max-workers 1`

Run `npx expo-doctor` to review Expo configuration and package compatibility.
