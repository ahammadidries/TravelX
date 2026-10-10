# 02 — Design System (Light Theme, App-Wide)

**Override note:** the original product doc specified a dark onboarding theme with a light main app. Per explicit instruction, the entire app — onboarding included — is **light theme**. Everything below reflects that.

## Color tokens (`theme/colors.ts`)

```ts
export const colors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F6F6F8',          // cards, input fields, unselected chips
  surfaceElevated: '#FFFFFF',  // bottom sheets over the map

  // Text
  textPrimary: '#121214',
  textSecondary: '#6B6B76',    // muted grey subtitles
  textOnAccent: '#FFFFFF',

  // Accent — periwinkle (primary actions, progress, selected states)
  accent: '#8088F5',
  accentMuted: '#EEF0FD',      // selected chip fill
  accentBorder: '#8088F5',

  // Semantic action colors (carried over from the reference app)
  joinAction: '#FF8A3D',       // orange — "I'm in"
  commentsAction: '#2BB673',   // green — "chat" / comments button
  leaveAction: '#E5484D',      // red — "leave" and the create-plan (+) button
  danger: '#E5484D',

  // Borders / dividers
  border: '#E5E5EA',
  divider: '#EFEFF2',

  // Status
  success: '#2BB673',
  warning: '#F5A623',
};
```

## Typography (`theme/typography.ts`)
- **Font:** a rounded geometric sans — Sora, Space Grotesk, or Outfit (pick one, load via `expo-font` or Google Fonts). Use the same family everywhere; weight carries the hierarchy.
- **Headings** (screen titles like "what should we call you?"): bold, **all lowercase** (type it lowercase in code — don't rely on CSS text-transform, since the reference strings are written lowercase), 24–28px.
- **Subtitles**: regular, `textSecondary`, 14–15px, often paired with a single trailing emoji ("let's get your profile started 👋").
- **Body**: regular, `textPrimary`, 15–16px.
- **Labels** (field labels like "YOUR NAME", "BIRTHDAY"): uppercase, `textSecondary`, 11–12px, letter-spacing +0.5.
- **Button text**: semibold, 16px.

```ts
export const typography = {
  heading: { fontFamily: 'Sora-Bold', fontSize: 26, color: colors.textPrimary },
  subtitle: { fontFamily: 'Sora-Regular', fontSize: 14, color: colors.textSecondary },
  body: { fontFamily: 'Sora-Regular', fontSize: 15, color: colors.textPrimary },
  label: { fontFamily: 'Sora-Medium', fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' },
  button: { fontFamily: 'Sora-SemiBold', fontSize: 16 },
};
```

## Shape & spacing
- **Radii:** 16–28px on cards, inputs and sheets; **fully pill-shaped** (radius = height/2) on chips and buttons.
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32 (px) — use multiples of 4 throughout, no arbitrary values.
- **Bottom sheets:** rounded top corners (24px), white (`surfaceElevated`) over the map, drag handle bar centered at top.
- **Primary button:** full-width, pinned to the bottom of the screen with safe-area padding, pill-shaped, `accent` fill, white text, centered.

## Core components (`components/`)

**Button.tsx** — variants: `primary` (accent fill), `success` (commentsAction fill — "chat"/comments), `warning` (joinAction fill — "I'm in"), `danger` (leaveAction fill — "leave"), `disabled` (grey fill, `textSecondary` text, non-interactive — matches the greyed-out arrow button on New Event until the title is filled).

**PillChip.tsx** — two states:
- Unselected: `surface` fill, `textPrimary` text, 1px `border`.
- Selected: `accentMuted` fill, `accent` text, 1px `accentBorder`.
Used for gender select, interest chips, type picker.

**TextInputField.tsx** — `surface` fill, no visible border by default, rounded (16px), label above in `label` style, optional trailing element (green checkmark for valid name, age pill, flag dropdown chevron).

**ProgressBar.tsx** — thin (3–4px) track in `divider`, filled portion in `accent`, rounded ends. Used on every onboarding screen alongside the circular back button and optional "Skip" text (`textSecondary`, top right).

**BottomSheet.tsx** — wraps `@gorhom/bottom-sheet`. Used for: the plan card, New Event, "See list". Drag handle, close (X) button top-left or top-right depending on screen per the screenshots.

**Avatar.tsx** — circular, optional colored ring (progress ring on own profile, per completion %), optional small badge overlay (star badge for host, in the comments/member list).

**EmojiPicker.tsx** — tap-to-change emoji control used on New Event and (implicitly) the plan's displayed emoji on pins/cards.

## Screen-specific patterns observed in the reference screenshots
- **Onboarding top bar:** circular back button (left), thin progress bar (center/right), "Skip" text only on skippable steps (steps 5 and 6), all on one row.
- **Age pill:** small `accentMuted`-background pill showing computed age next to the birthday field — computed client-side for display only; the backend independently validates 18+ server-side.
- **Interests step:** search bar with a trailing illustrative emoji, section header ("TRAVELLING") in `label` style grouping chips by category, a counter (e.g. "10/10") top-right under "Skip" if there's a max-selection limit — confirm with product whether there's a cap, otherwise just show count selected.
- **Map top bar:** logo pill (left, white background, floating over the map), a pair of circular icon buttons (right) — bell (notifications, optional per spec) and a second icon (see note in the architecture file — stub it, not in backend scope), a floating "Zoom in to explore" pill hint (center) that disappears once zoomed in.
- **Map floating controls:** search (bottom-left circular), "See list" (bottom-center pill, white bg), **red** circular **+** (bottom-right, `leaveAction` color — not `accent`, matches the reference screenshot), locate-me (circular, below the +).
- **Plan card sheet:** emoji avatar (top-left, circular), report icon (top-left corner, small, subtle), share + close icons (top-right), headline with bold name/action, "X going 🎉" row with stacked avatar previews, then the action button row at the bottom (I'm in / Too far, or chat + leave).
- **Join confirmation dialog:** centered modal (not a bottom sheet), white card, rounded corners, two text buttons side by side ("Not now" plain text, "Go to chat" in `accent`).
- **Comments/"chat" screen:** header shows the plan emoji+name as a small icon, participant count subtitle, a shield icon (report/safety — top right), an "RSVP" dropdown pill below the header (shows the current user's rsvp_status — going/maybe/cant — editable), message list styled as chat bubbles (not classic "comment cards" — lean into the chat visual even though it's fetch-on-open under the hood), message input bar pinned to the bottom with a "+" attachment affordance (keep as a stub — no attachments in MVP backend) and a send button.
- **Profile screen:** full-width world-map image as a cover (static illustration, not an interactive map — just a visual header), circular photo overlapping the cover with a colored progress ring and a `%` badge pill, name + age + hometown centered below, Edit Profile / Share pill buttons side by side, a "Get verified" promo banner (visual only — selfie verification is out of MVP scope, so this banner can be present but its button goes nowhere / shows "coming soon"), then About Me / Photos / Interests sections as cards, bottom tab bar.

## Bottom tab bar
Three tabs — Map, Trips, Profile (icons: map/compass, paper-plane/luggage, user avatar). Active tab in `accent`, inactive in `textSecondary`. White background, subtle top border/shadow, floats over content on the map screen.
