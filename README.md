# TravelX

TravelX is a mobile-first Expo app that helps visitors feel ready for everyday life in **Tokyo, Japan** and **Kozhikode, Kerala**. It includes city starter packs, visitor-focused local app listings, practical travel notes, saved essentials, and a secondary Together meetup feature. There is no AI assistant or trip planner.

## Run the app

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and add the Supabase project URL and **publishable** key. Never put a Supabase secret or service-role key in an Expo app.
3. Run **all of `supabase/setup.sql`** in your Supabase SQL Editor. It installs the schema, access policies, activity RPCs, signup profiles and researched city catalog in one transaction. It is safe to rerun, including if the original migration was already installed.
4. Use `npm run web` to open a laptop browser preview, or `npm start` to launch the app in Expo Go.

Email/password auth uses the Supabase Auth service. Email confirmation follows the project’s Auth settings. City guides and app information are available without an account; accounts are required to create or join Together meetups and use their group chat.

## Main features

- Tokyo and Kozhikode destination selection with destination photography.
- A four-step travel setup for language, local phone number, payment preference, and step-free access.
- Local app suggestions grouped by transport, taxi, food, and connectivity, with provider links and visitor notes.
- Expandable, source-linked practical guidance for transport, taxis, payments, etiquette, phrases, toilets, luggage and charging.
- Locally saved city packs and apps, with optional Supabase account sync.
- Together activities on a city map: public meeting points, create/join/leave/cancel, RSVP, member removal, and participant chat.

The laptop web preview uses an illustrative map. Native Android and iOS use `react-native-maps`. Google Maps API credentials are needed for a standalone Android build; iOS uses the default Apple map. Expo Go supplies its own map configuration.

## Backend setup and verification

The app reads `travelx_apps` and `travelx_guides` from Supabase, with bundled content available offline. The initial catalog contains 13 provider entries and 13 source-linked guide entries across the two cities. Visitors can read the catalog but cannot edit it. Update it through the SQL Editor as a project administrator.

Paste the complete `supabase/setup.sql` into the SQL Editor and run it. After it succeeds, restart the app to fetch the hosted catalog. To verify the deployed connection, sign up with two accounts, confirm their email addresses, create an activity, join it from the second account, exchange messages and test removal. No fake accounts, meetups, ratings or messages are seeded.

Saved packs use per-account local storage and ordered remote writes. Unsynced edits survive restarting the app; the Saved screen offers a retry. Guest bookmarks remain separate from account bookmarks. Participant counts are public; group membership details and messages are restricted to members. Host removals prevent immediate rejoining.

Run `npm run backend:prepare` to rebuild SQL after editing the bundled catalog. For an already deployed database, apply the regenerated `202610110003_seed_catalog.sql` to update its catalog; the setup ledger skips previously applied phases.

`npm run backend:test` executes the setup twice in local PostgreSQL (PGlite) and checks signup profiles, catalog permissions, account isolation, chat access, capacity, RSVP validation, host actions and blocks. It does not verify Supabase email delivery, HTTP access or Realtime delivery; those require the deployed project.

## Project layout

```text
src/app/                 Expo Router screens and layouts
src/components/           Reusable UI and platform-specific Together maps
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
