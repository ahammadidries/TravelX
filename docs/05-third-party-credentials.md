# 05 — Third-Party Credentials & Services Needed

Set these up manually before (or alongside) Phase 0 of the frontend build. Nothing here should be invented or stubbed by generated code — get real values first.

## 1. Google Sign-In
Needed for the login screen and the backend's `POST /auth/google`.
- **Google Cloud Console** → create (or reuse the one from the backend setup) OAuth 2.0 credentials. For React Native you typically need **three** client IDs in the same project:
  - **Web client ID** — used as the `idToken` audience; this is the one the backend verifies against (`GOOGLE_OAUTH_CLIENT_ID` in the backend `.env` — must match).
  - **iOS client ID** — for the iOS app bundle.
  - **Android client ID** — for the Android app, requires your app's SHA-1 signing certificate fingerprint registered in the console.
- Package needed: `@react-native-google-signin/google-signin`.
- Frontend `.env` needs: `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID` (iOS only setup, not stored as an env var — goes in `app.config.ts`/`Info.plist` reverse client ID URL scheme).

## 2. Maps
Pick one and get credentials before Phase 3 (map screen):
- **Google Maps** (recommended, works both platforms via `react-native-maps`):
  - Android: Maps SDK for Android key, added to `app.config.ts` → `android.config.googleMaps.apiKey`.
  - iOS: Maps SDK for iOS key, added to `app.config.ts` → `ios.config.googleMapsApiKey`.
  - Enable both "Maps SDK for Android" and "Maps SDK for iOS" in Google Cloud Console (same or different project from the OAuth one — your call).
- Alternative: **Mapbox** (per the original product doc's suggestion) — needs a Mapbox access token instead, and `@rnmapbox/maps` in place of `react-native-maps`. Pick one stack and don't mix; Google Maps is the simpler default if you're not already committed to Mapbox elsewhere.

## 3. Location permissions
No external credential — just native permission config:
- iOS: `NSLocationWhenInUseUsageDescription` string in `app.config.ts`/`Info.plist`.
- Android: `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` in the Expo config plugin or `AndroidManifest.xml`.
- Package: `expo-location`.

## 4. Image picker (onboarding photo, profile photo)
No external credential — `expo-image-picker`, with camera/photo-library usage descriptions set in `app.config.ts` (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` for iOS).

## 5. Push notifications
**Not needed for MVP** — explicitly out of scope per the product doc. Skip Expo push tokens / FCM / APNs setup entirely for now.

## 6. Backend connection
- `API_BASE_URL` pointing at your deployed (or local-network-reachable, for device testing) FastAPI backend. No separate credential — this just needs the backend's auth to already be working (Phase 2 of the backend build).

## 7. App distribution (only needed once you're ready to test on real devices beyond Expo Go)
- **iOS:** Apple Developer account, used for the iOS Google Sign-In client ID's bundle ID and for building with EAS/Xcode.
- **Android:** a keystore for signing — EAS can generate/manage one for you if using Expo's build service.
- Not blocking for early development (Expo Go or a dev client covers most of the build), but get the Apple Developer account sorted early since it gates the iOS Google Sign-In client ID.

---

## Credential checklist to have in hand before Phase 0
- [ ] Google OAuth Web client ID (shared with backend `.env`)
- [ ] Google OAuth iOS client ID
- [ ] Google OAuth Android client ID + SHA-1 fingerprint registered
- [ ] Maps provider API key (Google Maps SDK for Android + iOS, or Mapbox token)
- [ ] Backend `API_BASE_URL` reachable from your dev device/simulator
