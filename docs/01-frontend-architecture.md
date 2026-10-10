# 01 — Frontend Architecture (React Native)

## Stack
- **Framework:** React Native (bare or Expo — recommend **Expo** for faster iteration on location permissions, image picker, and Google Sign-In config; switch to bare only if a native module forces it)
- **Language:** TypeScript
- **Navigation:** React Navigation (native-stack for the main flow, a bottom-tab navigator for Map/Trips/Profile, modal/bottom-sheet presentation for the plan card and New Event sheet)
- **State / data fetching:** React Query (TanStack Query) for all server state (events, comments, profile) — no Redux needed for MVP. Local-only UI state (form inputs, sheet open/closed) stays in component state or a tiny Zustand store if it needs to cross screens.
- **Maps:** react-native-maps (Google Maps provider on Android, Apple Maps or Google Maps on iOS) — see `05-third-party-credentials.md`. Marker clustering via `react-native-map-clustering` or `supercluster`.
- **Auth:** `@react-native-google-signin/google-signin` for the native Google Sign-In flow, token sent to the backend's `POST /auth/google`.
- **Secure storage:** `expo-secure-store` (or `react-native-keychain` on bare) for access/refresh tokens.
- **Forms:** plain controlled components for MVP — no need for a form library given the onboarding steps are simple.
- **Image picking/upload:** `expo-image-picker` for camera/gallery, uploaded via the backend's storage endpoints (never directly to Supabase from the client — keeps the service role key server-side).

## Folder structure

```
frontend/
├── app.json / app.config.ts           # Expo config — app name, icons, permissions, plugins
├── .env
├── App.tsx
│
├── src/
│   ├── api/
│   │   ├── client.ts                  # axios/fetch instance, base URL, auth header injection, 401 refresh handling
│   │   ├── auth.ts                    # POST /auth/google, /auth/refresh
│   │   ├── users.ts                   # GET/PATCH /users/me, photo upload, location update
│   │   ├── onboarding.ts              # PATCH /onboarding/step-1 ... step-6
│   │   ├── interests.ts               # GET /interests
│   │   ├── events.ts                  # /events CRUD, join/leave, trips
│   │   ├── comments.ts                # /events/{id}/comments
│   │   ├── reports.ts                 # POST /reports
│   │   └── blocks.ts                  # /blocks
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx          # switches between Auth stack, Onboarding stack, Main tabs
│   │   ├── AuthStack.tsx              # Login screen
│   │   ├── OnboardingStack.tsx        # Steps 1–6 + location permission
│   │   ├── MainTabs.tsx               # Map / Trips / Profile bottom tabs
│   │   └── types.ts                   # route param types
│   │
│   ├── screens/
│   │   ├── auth/LoginScreen.tsx
│   │   ├── onboarding/
│   │   │   ├── NameStep.tsx
│   │   │   ├── GenderStep.tsx
│   │   │   ├── PhotoStep.tsx
│   │   │   ├── HometownStep.tsx
│   │   │   ├── StoryStep.tsx
│   │   │   ├── InterestsStep.tsx
│   │   │   └── LocationPermissionScreen.tsx
│   │   ├── map/
│   │   │   ├── MapHomeScreen.tsx
│   │   │   ├── PlanListScreen.tsx     # "See list" view
│   │   │   └── components/ (PlanPin, ClusterMarker, PlanCardSheet, NewEventSheet, JoinedDialog)
│   │   ├── trips/TripsScreen.tsx
│   │   ├── comments/CommentsScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── BlockedUsersScreen.tsx
│   │   └── shared/ReportModal.tsx
│   │
│   ├── components/                    # design-system primitives (see 02-design-system.md)
│   │   ├── Button.tsx
│   │   ├── PillChip.tsx
│   │   ├── TextInputField.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Avatar.tsx
│   │   └── EmojiPicker.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                 # current user, token state, login/logout
│   │   ├── useLocation.ts             # permission + live/periodic location
│   │   ├── useEvents.ts               # React Query hooks wrapping api/events.ts
│   │   └── useComments.ts
│   │
│   ├── store/
│   │   └── authStore.ts               # Zustand — tokens, current user, onboarding progress
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   │
│   └── utils/
│       ├── distance.ts                # client-side display formatting (backend computes actual distance_km)
│       └── age.ts                     # display-only age calc from birthday
```

## Data flow pattern
- Every screen reads/writes through a `hooks/use*.ts` React Query hook — screens never call `api/*.ts` directly.
- `api/client.ts` attaches the bearer token from `authStore` to every request and handles a 401 by attempting one silent refresh (`POST /auth/refresh`) before logging the user out.
- Mutations (join, leave, create plan, post comment) invalidate the relevant React Query cache key on success so the UI updates without a manual refetch — this covers the "refresh when card opens, after posting, on pull-to-refresh" behavior from the product spec without needing realtime.

## Navigation flow (high level)
```
RootNavigator
 ├─ AuthStack        (not logged in)         → LoginScreen
 ├─ OnboardingStack   (logged in, onboarding_completed=false) → step screens in order, resumes at onboarding_step
 └─ MainTabs          (logged in, onboarding_completed=true)
     ├─ Map tab   → MapHomeScreen → (modal) PlanCardSheet → (push) CommentsScreen
     │                            → (modal) NewEventSheet
     ├─ Trips tab → TripsScreen → (modal) PlanCardSheet
     └─ Profile tab → ProfileScreen → EditProfileScreen / SettingsScreen / BlockedUsersScreen
```

`RootNavigator` decides which stack to render based on `authStore` state (token present + `onboarding_completed`), read from `GET /users/me` on app launch.
