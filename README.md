# TravelX

TravelX is a mobile guide for visitors in **Tokyo, Japan** and **Kozhikode, Kerala, India**. It helps people find trustworthy local apps, learn everyday essentials, follow arrival guidance, and save city packs for later.

The app works without an account. Its navigation is focused on three areas: **City**, **Apps**, and **Saved**.

## What it includes

- City selection for Tokyo and Kozhikode, with destination photography.
- Arrival guidance for connectivity, airport transport, local payments, and getting around.
- Ranked visitor app catalogs covering transit, taxis, food, groceries, hotels, SIM/data, and utilities.
- Practical guides for transport, payments, dining customs, useful phrases, public toilets, luggage storage, and plugs and charging.
- Japanese and Malayalam phrase references for the two supported cities.
- Device-local saved apps, preferences, and offline city packs.
- A public Supabase catalog with bundled offline fallback content.

## Tech stack

- [Expo](https://expo.dev/) SDK 57 and React Native
- TypeScript
- Expo Router
- Supabase for the public city catalog
- Expo Application Services (EAS) for Android builds

## Quick start

### Prerequisites

- Node.js 20 or later
- npm
- Expo Go on a phone for development, or a web browser for the web preview

### Install and run

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/travelx.git
cd travelx
npm ci
```

Copy the example environment file before starting the app:

```powershell
Copy-Item .env.example .env.local
```

Add your Supabase URL and **publishable** key to `.env.local`, then run one of these commands:

```bash
npm start       # Expo Go development server
npm run web     # web preview
npm run android # opens Expo Go on a connected Android device
```

> Never place a Supabase secret key or service-role key in an Expo app or commit it to GitHub. `.env.local` is ignored by Git.

## Supabase catalog setup

TravelX bundles its essential data, so the app remains useful if Supabase is not configured. Connecting Supabase enables hosted catalog updates.

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in the public values.
3. In the Supabase SQL Editor, run the complete [supabase/setup.sql](supabase/setup.sql) file.
4. Restart the app.

The setup file creates the public read-only catalog and seeds **35 app providers** plus **13 guides**. Visitors can read the catalog; catalog updates are made by a project administrator in Supabase.

After changing bundled catalog data, regenerate the SQL seed data with:

```bash
npm run backend:prepare
```

## Build an Android APK

The project includes a preview EAS profile that produces an installable APK. Sign in to Expo, then build:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

When the build completes, Expo provides a QR code and an Android download page. The `preview` profile in [eas.json](eas.json) builds an APK; the production profile is configured for store distribution and versioning.

For a cloud build that connects to Supabase, set these public environment variables in the EAS **preview** environment:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Project structure

```text
src/
  app/                 Expo Router routes and layouts
  components/          Reusable mobile UI components
  data/                City content, ranked apps, logos, and essentials
  lib/                 Supabase and external-link helpers
  screens/             City and arrival-flow screens
  state/               Public catalog and device-local saved state
  theme/               Design tokens
assets/
  cities/              Destination images and attribution
  apps/                Local app logo assets
supabase/
  migrations/          Schema, public catalog policies, and seed data
  setup.sql            One-file SQL setup for Supabase
scripts/               Catalog preparation and backend tests
```

## Quality checks

Run these before opening a pull request:

```bash
npm run check
npm run backend:test
npx expo export --platform web --max-workers 1
npx expo-doctor
```

## Content and attribution

City image attribution and license links are listed in [assets/cities/ATTRIBUTION.md](assets/cities/ATTRIBUTION.md). Local app listings and guide entries link to official providers or public-information sources; always verify time-sensitive travel information with the provider.

## Privacy

TravelX does not require sign-in. Saved packs and preferences remain on the current device and do not sync between devices. The hosted Supabase catalog is public, read-only data.

## License

See [LICENSE](LICENSE).
