# 04 — API Integration

This maps directly onto the backend's `04-api-contracts.md`. The frontend never invents endpoints — if a screen needs something not listed there (like the RSVP dropdown flagged in `03-screens-and-navigation.md`), flag it and add the endpoint to the backend contract before building the screen against it.

## Base client (`api/client.ts`)
- Base URL from `.env` (`API_BASE_URL`), versioned path `/api/v1` already included or prefixed per-request.
- Request interceptor: attach `Authorization: Bearer <access_token>` from `authStore` to every request except `POST /auth/google`.
- Response interceptor: on `401`, attempt one `POST /auth/refresh` using the stored refresh token; retry the original request once; if refresh also fails, clear `authStore` and route to Login.
- Surface the backend's error shape (`{ error, message }`) consistently — a small `ApiError` class that screens can check `error.code` against (`too_far`, `full`, `already_joined`, `comments_closed`, `onboarding_incomplete`, `under_18`, `not_found`, `forbidden`, `rate_limited`) to show the right inline message rather than a generic toast.

## Auth (`api/auth.ts`)
```ts
googleLogin(idToken: string): Promise<{ user, access_token, refresh_token, onboarding_completed, onboarding_step }>
refresh(refreshToken: string): Promise<{ access_token, refresh_token }>
```

## Onboarding (`api/onboarding.ts`)
```ts
step1(data: { name, birthday }): Promise<User>
step2(data: { gender }): Promise<User>
step3(photo: FormData): Promise<User>
step4(data: { hometown, country_code }): Promise<User>
step5(data: { bio?, social_platform?, social_handle? }): Promise<User>
step6(data: { interest_ids: string[] }): Promise<User>
```
Each screen's Continue handler calls the matching function, then advances the local step pointer (or reads the new `onboarding_step` back from the response — prefer trusting the server's value over a local counter, since it's the source of truth if the app is killed mid-flow).

## Users (`api/users.ts`)
```ts
getMe(): Promise<User>
updateMe(data: Partial<UserUpdate>): Promise<User>
updatePhoto(photo: FormData): Promise<User>
updateLocation(data: { lat, lng }): Promise<void>
getUser(id: string): Promise<PublicUser>       // 404 if blocked either direction
deleteMe(): Promise<void>
```
`updateLocation` is called: once right after the location-permission screen, then periodically while `MapHomeScreen` is mounted (e.g. every 60–120s or on significant movement — don't hammer it every frame).

## Interests (`api/interests.ts`)
```ts
list(q?: string): Promise<Interest[]>
```

## Events (`api/events.ts`)
```ts
list(params: { lat, lng, radius_km?, type? }): Promise<EventOut[]>
getById(id: string): Promise<EventDetailOut>
create(data: EventCreate): Promise<EventDetailOut>
update(id: string, data: Partial<EventCreate>): Promise<EventDetailOut>
cancel(id: string): Promise<void>
join(id: string, data: { lat, lng }): Promise<EventDetailOut>   // throws too_far/full/already_joined
leave(id: string): Promise<void>
members(id: string): Promise<MemberOut[]>
trips(params: { lat?, lng? }): Promise<EventOut[]>
```
React Query keys: `['events', params]`, `['event', id]`, `['event', id, 'members']`, `['trips', params]`. `join`/`leave`/`create`/`cancel` mutations invalidate `['events']` and `['event', id]`.

## Comments (`api/comments.ts`)
```ts
list(eventId: string): Promise<CommentOut[]>
post(eventId: string, text: string): Promise<CommentOut>
remove(eventId: string, commentId: string): Promise<void>
pin(eventId: string, commentId: string, pinned: boolean): Promise<CommentOut>
```
Query key `['comments', eventId]`, invalidated on post/remove/pin and refetched on screen focus (`useFocusEffect`) rather than polling.

## Reports (`api/reports.ts`)
```ts
create(data: { target_type, target_id, reason }): Promise<ReportOut>
```

## Blocks (`api/blocks.ts`)
```ts
list(): Promise<PublicUser[]>
create(blockedId: string): Promise<void>
remove(blockedId: string): Promise<void>
```

## Auth token storage (`store/authStore.ts`)
- Persist `access_token`, `refresh_token` in `expo-secure-store`, not `AsyncStorage` (tokens shouldn't sit in plain storage).
- Hold `currentUser` and `onboardingStep` in memory, refreshed from `GET /users/me` on app launch and after any onboarding step completes.
- `logout()` clears secure storage and resets the store; `RootNavigator` reacts to the cleared token and routes to Login.

## Error → UI mapping (apply consistently across screens)
| Error code | Where it shows up | Suggested UI |
|---|---|---|
| `too_far` | Join button | Disable button, label "Too far" |
| `full` | Join button | Disable button, label "Full" |
| `already_joined` | Join action | Silently treat as success, refetch event |
| `comments_closed` | Comment input | Disable input, show "Comments are closed for this plan" |
| `onboarding_incomplete` | Any gated action | Redirect to Onboarding stack |
| `under_18` | Onboarding step 1 | Inline field error under birthday |
| `rate_limited` | Any mutation | Toast: "You're doing that too fast — try again in a bit" |
| `forbidden` | Host-only actions shown to non-hosts | Hide the action entirely client-side (belt-and-suspenders with the server check) |
