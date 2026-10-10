# 03 — Screens & Navigation (full screen list, mapped to backend)

Each screen lists: purpose, key UI elements (from the reference screenshots + product doc), and which backend endpoint(s) it calls (see `04-api-integration.md` for request/response detail).

## Auth

### LoginScreen
- One screen, one button: "Continue with Google."
- Calls: native Google Sign-In → `POST /auth/google`.
- On success: route to Onboarding (if `onboarding_completed=false`) or Main tabs.

## Onboarding (steps 1–6, light theme, progress bar + back button on every step)

### 1. NameStep
- Fields: Name (green check when valid — client-side validation only, e.g. non-empty), Birthday (date picker, shows computed age pill).
- Calls: `PATCH /onboarding/step-1` on Continue. Surfaces the `under_18` error inline if the backend rejects it.

### 2. GenderStep
- Single-select: male / female / non-binary, pill list (not chips — full-width rows per the screenshot, selected row gets `accentBorder` + checkmark).
- Calls: `PATCH /onboarding/step-2`.

### 3. PhotoStep
- Camera or gallery picker, prefilled from Google photo if available.
- Calls: `PATCH /onboarding/step-3` (multipart upload).

### 4. HometownStep
- Hometown text field + country flag dropdown.
- Calls: `PATCH /onboarding/step-4`.

### 5. StoryStep (skippable)
- Bio textarea (300 char counter), one social link field with a platform picker (Instagram default).
- Calls: `PATCH /onboarding/step-5` — empty body allowed if skipped.

### 6. InterestsStep (skippable)
- Search bar, category-grouped chips, multi-select, selection counter.
- Calls: `GET /interests` on mount, `PATCH /onboarding/step-6` with selected IDs on Continue (empty array if skipped). This call sets `onboarding_completed = true`.

### LocationPermissionScreen
- Native OS permission prompt, triggered right after step 6.
- On grant: call `PATCH /users/me/location` once with the initial fix, then navigate into Main tabs.
- On deny: show a lightweight explainer screen with a retry button — the map can't function meaningfully without it, so don't silently continue; block entry to Map tab until granted (Trips/Profile can still be reached).

## Main tabs

### MapHomeScreen (Map tab)
- Full-screen map, blue dot = user location.
- Pins: emoji-in-white-circle markers; clustering with a numeric badge when zoomed out; small host avatar overlay on single (unclustered) pins.
- Top bar: logo pill (left), bell + stub icon (right), "Zoom in to explore" hint (center, auto-hides past a zoom threshold).
- Floating controls: search (bottom-left), "See list" (bottom-center), red **+** → opens NewEventSheet (bottom-right), locate-me (below +).
- Calls: `GET /events?lat&lng&radius_km&type` — refetch on significant map pan/zoom (debounced) or pull-to-refresh, not on every frame.
- Tapping a pin opens **PlanCardSheet** as a modal.

### PlanListScreen ("See list")
- Flat list version of the same `GET /events` result set — reuse the query, just render as a scrollable list instead of pins.

### NewEventSheet (modal, triggered from the red +)
- Fields in order: emoji picker, "want to…" title text, type (event/trip/party), when (now/today/pick a time), where (current location or drop a pin), max people (optional), join radius. Top-right arrow button greyed out until title is non-empty.
- Calls: `POST /events` on Publish. Closes and the new pin should appear on the map immediately (optimistic update or immediate refetch).
- Host can later reach an edit version of this same sheet from their own plan's card → `PATCH /events/{id}`.

### PlanCardSheet (modal, from a map pin, list item, or Trips row)
- Emoji + headline ("**Adss** wants to **Coffee** now"), time, distance.
- "X going 🎉" row with avatar stack (tap → full member list, `GET /events/{id}/members`).
- Top icons: report (→ ReportModal with `target_type: event`), share (native share sheet, just the deep link/plan info), close.
- **Not joined:** orange "I'm in" button, or disabled "Too far" / "Full" depending on the error the backend would return — check reachability client-side first using the `distance_km`/`can_join` fields from `GET /events` for instant feedback, but the real gate is server-side on `POST /events/{id}/join`.
- **Joined:** green "chat" button (→ CommentsScreen) + red "leave" button (→ `POST /events/{id}/leave`).
- Calls: `GET /events/{id}`, `POST /events/{id}/join`, `POST /events/{id}/leave`.

### JoinedDialog (centered modal, shown right after a successful join)
- "Successfully joined! 🎉 Want to say hi in the comments?" — "Not now" / "Go to chat" (→ CommentsScreen).

### TripsScreen (Trips tab)
- List of `type: trip` plans: destination, dates, spots left, host, Join button.
- Calls: `GET /events/trips`. Tapping a row opens the same PlanCardSheet.

### CommentsScreen (pushed from PlanCardSheet/JoinedDialog — styled as "chat")
- Header: plan emoji/name, participant count, shield icon (safety/report).
- RSVP dropdown pill (going/maybe/cant) — if you wire this to `event_members.rsvp_status`, add a small `PATCH /events/{id}/rsvp` endpoint to the backend when you build this screen (not in the current contract — flag it then).
- Message list: chat-bubble styling, newest at bottom, host messages carry a star badge. Pull-to-refresh, refetch on screen focus and after posting — no realtime/websocket.
- Input bar: text field (300 char) + send button. Long-press or a per-bubble menu for report/delete/pin (host only for pin/remove-any).
- Calls: `GET /events/{id}/comments`, `POST /events/{id}/comments`, `DELETE .../comments/{id}`, `PATCH .../comments/{id}/pin`.

### Profile tab

#### ProfileScreen
- World-map cover image (static asset, not interactive), circular photo with completion-% ring, name/age/hometown, Edit Profile + Share buttons, "Get verified" banner (visual only, no backend call — out of MVP scope), About Me / Photos / Interests sections, past & upcoming plans list.
- Calls: `GET /users/me`.

#### EditProfileScreen
- Re-presents the editable onboarding fields (name, bio, hometown, social link, photo, interests) in one form rather than stepped.
- Calls: `PATCH /users/me`, `PATCH /users/me/photo`.

#### SettingsScreen
- Rows: Edit details (→ EditProfileScreen), Blocked users (→ BlockedUsersScreen), Log out, Delete account.
- Calls: `DELETE /users/me` (delete account, with a confirm dialog), local token clear for logout.

#### BlockedUsersScreen
- List of blocked users with an unblock action per row.
- Calls: `GET /blocks`, `DELETE /blocks/{id}`.

### ReportModal (shared, opened from a plan card, a comment's menu, or a user's profile)
- Reason text/select + submit.
- Calls: `POST /reports` with the appropriate `target_type`/`target_id`.

## Navigation summary
```
Login
 → Onboarding (1→2→3→4→5(skip)→6(skip)→LocationPermission)
   → MainTabs
      Map:    MapHome ⇄ PlanList, MapHome → PlanCardSheet → CommentsScreen
                        MapHome → NewEventSheet
      Trips:  TripsScreen → PlanCardSheet → CommentsScreen
      Profile: ProfileScreen → EditProfile / Settings → BlockedUsers
```
