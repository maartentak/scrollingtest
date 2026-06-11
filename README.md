# Steady

A quiet self-regulation tool for AuDHD brains. Built for the moments when
executive function is gone: every flow works with taps only, opens in under
two seconds, and ends in exactly one small action.

Working title — see the build and design briefs for the full rationale.

## What's in this version

The full deterministic core (MVP steps 1–3, plus Flow 4):

- **Home** — four cards, nothing else. No badges, no streaks, no guilt.
- **Flow 1: State Check** — body-scan chips → "would more input feel better
  or worse?" → optional emotion naming → plain verdict (overloaded /
  understimulated / unclear) → one matched action → optional 25-min check-back.
- **Flow 2: Unstick** — brain dump → forced pick (pairwise for 2–4 tasks,
  one-tap for more) → shrink to a smallest step (keyword-matched suggestions)
  → implementation intention → optional 25/50-min timer → done / progress /
  didn't-start, where "didn't start" just routes to an even smaller step.
  Everything not picked is parked and shown next session.
- **Flow 3: Go or Cancel** — capacity gate first (depleted = cancel
  guilt-free, flow ends), then avoidance gate, personal history line once
  enough plans are logged, predicted dread/enjoyment sliders, and the
  go-for-30-minutes deal. A waiting-mode helper appears for same-day plans.
  The next-day follow-up surfaces as a quiet row on the home screen.
- **Flow 4: Just Checking In** — energy slider, mood chips, optional note.
- **History** — parked tasks (tap to mark done) and a flat log.
- **Settings** — extra-calm mode (accents removed), light/dark/auto theme,
  JSON export, full data wipe, crisis note.

No AI yet: action phrasing uses the static template pool that will later
become the fallback for the Claude-powered phrasing layer (MVP step 4).

## Running it

No build step. Serve the repo root with any static server:

```bash
python3 -m http.server 8080
# or: npx serve .
```

Open on a phone (or a ~400px viewport) — it's mobile-first. Installable as a
PWA when served over HTTPS; the service worker makes it work offline.

## Implementation notes / deviations from the brief

- **Storage** is a single versioned `localStorage` key rather than IndexedDB.
  The data is a few kilobytes of taps; the `store.js` API is the seam where
  IndexedDB/SQLite slots in if it ever matters. Export-to-JSON is in settings.
- **Notifications** are best-effort: a PWA without a push server can only
  fire reminders while the app (or its tab) is alive. Pending reminders are
  re-armed on every app start, and the next-day plan follow-up triggers on
  app open instead of via push. A native wrapper would fix this properly.
- **Contrast**: the reference `ink-muted` (#7E8273) fails WCAG AA on the
  light surfaces, so real text uses a darkened muted (#565B4B, 4.4:1) and
  #7E8273 is kept only for the decorative ghost digits ("7.**0**").
- **Fonts**: Space Grotesk variable (latin subset) is self-hosted — no
  external requests at runtime, matching the privacy stance.
