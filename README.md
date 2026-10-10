# TravelX

A setup-only React Native + Expo + TypeScript project. The official blank starter is intentionally unchanged. No product screens, navigation, backend, accounts, maps, or group-chat features have been built.

## Run on your phone

1. Install dependencies with `npm ci` after cloning. Dependencies are already installed during initial setup.
2. Update Expo Go on your phone to support this project's Expo SDK version (see package.json).
3. Connect the phone and computer to the same Wi-Fi network.
4. Run `npm start` in this folder.
5. Scan the terminal QR code with Expo Go on Android or the Camera app on iOS.

Keep the terminal running while testing. If networking fails, check that both devices are on the same network and that Windows Firewall permits Node.js on your private network. Use `npm run start:clear` to reset Metro's cache when necessary.

Expo Go compatibility depends on its installed SDK support. No custom native dependencies are included. Prefer an active Node.js LTS release for ongoing development.

## Structure

```text
App.tsx                  Official blank starter / future composition root
index.ts                 Expo registration
assets/                  Starter icons and static assets
src/
  components/            Shared reusable UI primitives
  features/              Future feature modules, with their own screens and logic
  hooks/                 Shared hooks
  services/              External data and device-service adapters
  theme/                 Shared design tokens
  types/                 Truly shared TypeScript types
  utils/                 Small pure shared helpers
```

The empty source folders are intentional. Add modules only when needed. Keep feature-specific code within its feature; shared components should not import feature internals. Use the `@/` alias for imports from `src/`. Navigation and state libraries will be chosen when implementation starts.

## Development checks

- `npm run typecheck` - strict TypeScript checking
- `npm run lint` - Expo ESLint rules, no warnings accepted
- `npm run format` - format source and configuration
- `npm run format:check` - verify formatting
- `npm run check` - run type, lint, and format checks
- `npm run doctor` - Expo environment and compatibility checks
- `npx expo install --check` - check dependency alignment

Use `npx expo install <package>` for Expo/React Native dependencies so versions match the SDK. Commit package-lock.json and use npm consistently. Do not add secrets to client code: values shipped in an app, including EXPO_PUBLIC variables, are public.

## Planned scope (not implemented)

Locations: Tokyo, Japan and Kozhikode, Kerala, India only. City readiness, local apps, practical guides and offline packs remain the core. Together is an optional secondary section with the minimal map, activity sheet, create flow and chat from the approved references. No AI feature.

The source currently displays only Expo's starter message. Device testing is still required before claiming phone compatibility or a finished application.
