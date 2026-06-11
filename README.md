# Rotion — scroll-driven "how it works" section

A 4-step scrolling experience for [rotion.eu](https://www.rotion.eu), inspired by the
pinned process section on vectrfl.com. Built with **Three.js** (procedural isometric
3D world) and **GSAP ScrollTrigger** (pinned, scrubbed timeline), set in **Geist**.

## What happens on scroll

The section pins for ~5 viewport heights while the camera flies across one
continuous low-poly world:

| Step | Scene | Story |
| --- | --- | --- |
| Hero | Depot from above, dotted orbit paths | Headline + "scroll to follow the loop" |
| 01 — Every asset, identified | Depot, crate stacks; green route lines draw in with traveling pulses | Digital identity via QR / barcode / RFID, GS1-aligned |
| 02 — One shared truth | Network of buildings; pulsing dot grid, expanding scan rings, a light beam sweeps through | Every scan, every partner, one operational truth |
| 03 — Returns that run themselves | Wash/return hub; a closed circulation loop draws in and crates start circulating on it | Circulation rules, automatic deposit clearing |
| 04 — A loop that compounds | Scattered blocks fly together into the Rotion mark, a final beam crosses it | Every rotation makes the system smarter |

Scrolling up reverses everything (the timeline is fully scrubbed). The mouse adds a
soft parallax to the camera, the step list highlights the active step (collapsed
steps expand on activation), and clicking a step scrolls to it.

## Run it

No build step. Serve the folder with any static server:

```bash
npx serve .          # or
python3 -m http.server 8080
```

Dependencies (Three.js 0.165, GSAP 3.12, Geist via Fontsource) load from the
jsDelivr CDN — see `index.html`. For production, install them with npm and bundle.

## Files

```
index.html        markup: nav, pinned #experience section, outro, footer
css/style.css     design tokens (colors/fonts) in :root, all UI styling
js/main.js        Three.js world + GSAP master timeline
assets/rotion-mark.svg
```

## Adapting it

- **Logo:** `assets/rotion-mark.svg` is a *recreation* of the Rotion mark for
  prototyping — drop the official SVG in its place. The 3D finale uses the
  `MARK_ROWS` voxel bitmap in `js/main.js`; tweak it if the official mark differs.
- **Colors:** edit `:root` in `css/style.css` and the `COLORS` object at the top of
  `js/main.js`. The accent green is a placeholder for a brand accent.
- **Copy:** step copy lives in `index.html` (`.steps`); it paraphrases the messaging
  on rotion.eu (digital identity, shared operational truth, deposits & clearing).
- **Pacing:** the timeline uses absolute positions on a 0–100 scale in `js/main.js`;
  `end: '+=520%'` on the ScrollTrigger controls total scroll length, and
  `STEP_RANGES` maps scroll progress to the active step in the list.

`prefers-reduced-motion` disables the smoothed scrub (steps still work, jumps are
instant).
