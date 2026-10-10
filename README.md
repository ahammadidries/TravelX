# TravelX

TravelX is a mobile-first Expo app that helps visitors feel ready for everyday life in **Tokyo, Japan** and **Kozhikode, Kerala**. It includes city starter packs, visitor-focused local app listings, practical travel notes, saved essentials, and a secondary Together meetup feature. There is no AI assistant or trip planner.

## Run the app

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and add the Supabase project URL and **publishable** key. Never put a Supabase secret or service-role key in an Expo app.
3. Run the migration in `supabase/migrations/202610110001_travelx.sql` in your Supabase SQL Editor. Together events, chat and account sync need those tables and policies.
4. Use `npm run web` to open a laptop browser preview, or `npm start` to launch the app in Expo Go.

Email/password auth uses the Supabase Auth service. Email confirmation follows the project’s Auth settings. City guides and app information are available without an account; accounts are required to create or join Together meetups and use their group chat.

## Main features

- Tokyo and Kozhikode destination selection with destination photography.
- A four-step travel setup for language, local phone number, payment preference, and step-free access.
- Local app suggestions grouped by transport, taxi, food, and connectivity, with provider links and visitor notes.
- Expandable, source-linked practical guidance for transport, taxis, payments, etiquette, phrases, toilets, luggage and charging.
- Locally saved city packs and apps, with optional Supabase account sync.
- Together activities on a city map: public meeting points, create/join/leave/cancel, RSVP, member removal, and participant chat.

The laptop web preview uses an illustrative map. Native Android and iOS use `react-native-maps`. Google Maps API credentials are needed for standalone native builds; Expo Go supplies its own map configuration.

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

City photography attribution and license links are included in the city guide and [assets/cities/ATTRIBUTION.md](assets/cities/ATTRIBUTION.md). App and local guidance entries are illustrative and link to official providers or public-information sources; confirm current details with each provider.

## Checks

- `npx tsc --noEmit`
- `npx expo lint`
- `npx expo export --platform web --max-workers 1`

Run `npx expo-doctor` to review Expo configuration and package compatibility.
