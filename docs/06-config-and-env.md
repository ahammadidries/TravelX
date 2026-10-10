# 06 — Frontend Config & Environment

## `.env`

```env
# Backend
API_BASE_URL=http://localhost:8000/api/v1    # swap for your deployed URL / LAN IP when testing on a real device

# Google Sign-In
GOOGLE_WEB_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=

# Maps (pick one path — see 05-third-party-credentials.md)
GOOGLE_MAPS_ANDROID_API_KEY=
GOOGLE_MAPS_IOS_API_KEY=
# or, if using Mapbox instead:
# MAPBOX_ACCESS_TOKEN=

# App
APP_ENV=development                           # development | staging | production
DEFAULT_MAP_RADIUS_KM=10                      # mirrors the backend's default join radius, for the initial map query
```

Use `react-native-dotenv` or Expo's built-in `app.config.ts` + `expo-constants` to surface these into the app — don't hardcode any of them in component files.

## `app.config.ts` (Expo) — what pulls from `.env`

```ts
import 'dotenv/config';

export default {
  expo: {
    name: 'Plans Map App',          // replace with final app name
    slug: 'plans-map-app',
    scheme: 'plansmapapp',
    ios: {
      bundleIdentifier: 'com.yourcompany.plansmapapp',
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'We use your location to show nearby plans and let you join ones within reach.',
        NSCameraUsageDescription: 'Used to take your profile photo.',
        NSPhotoLibraryUsageDescription: 'Used to pick your profile photo.',
      },
    },
    android: {
      package: 'com.yourcompany.plansmapapp',
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
        },
      },
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    },
  },
};
```

## What each setting feeds
| Setting | Used in |
|---|---|
| `API_BASE_URL` | `api/client.ts` — base axios/fetch instance |
| `GOOGLE_WEB_CLIENT_ID` | `@react-native-google-signin/google-signin` config (`webClientId`) — this is the one whose audience the backend verifies |
| `GOOGLE_IOS_CLIENT_ID` | iOS Google Sign-In native config |
| `GOOGLE_ANDROID_CLIENT_ID` | Android Google Sign-In native config (paired with the SHA-1 fingerprint, not read directly as an env string on Android — registered in the console) |
| `GOOGLE_MAPS_ANDROID_API_KEY` / `GOOGLE_MAPS_IOS_API_KEY` | `app.config.ts` native map SDK config, picked up automatically by `react-native-maps` |
| `DEFAULT_MAP_RADIUS_KM` | `MapHomeScreen`'s initial `GET /events` query param, before the user/host overrides it |

## Key packages (`package.json`, starting set)
```
expo
react-navigation (native-stack, bottom-tabs)
@tanstack/react-query
@react-native-google-signin/google-signin
react-native-maps  (or @rnmapbox/maps)
react-native-map-clustering
expo-location
expo-image-picker
expo-secure-store
@gorhom/bottom-sheet
zustand
```
