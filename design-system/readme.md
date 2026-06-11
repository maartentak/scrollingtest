# Vorxs Design System

A design language for a calm, editorial personal-finance app — **sun-faded olive
surfaces, deep forest structure, mechanical numerals, and accents of mustard &
terracotta used only at full bleed.** Reconstructed from a set of mobile budgeting
wireframes (Budget Category, Transactions, Total Spent, Vorxs Bank, Payment Receipt,
Budget Overrun).

> Scope: this is a *visual style reference*. "Vorxs Bank" and the sample merchants
> (Gamestop, Force Club, Pinnacle, Bonds, Elevate) are placeholder content from the
> source wireframes, not real entities.

---

## Index / manifest

| Path | What |
|---|---|
| `styles.css` | Global entry — `@import`s all tokens. **Link this one file.** |
| `tokens/colors.css` | Palette + semantic aliases |
| `tokens/typography.css` | Font families, scale, weights (loads Google Fonts) |
| `tokens/spacing.css` | Spacing, radii, shadow |
| `index.html` | **Viewable reference** — color, type, components, all 6 screen recreations |
| `components/core/*` | React primitives: Button, Badge, IconTile, Avatar, StatDisplay, TransactionRow |
| `guidelines/*.card.html` | Foundation specimen cards (Design System tab) |
| `SKILL.md` | Agent-skill entry for Claude Code / downloadable use |

---

## Content fundamentals

- **Tone:** terse, financial, confident. Labels are nouns, not sentences.
- **Casing:** UI labels are `UPPERCASE` with wide tracking ("TOTAL SPENT", "INVESTMENTS").
  Titles are Title Case ("Budget Category"). Body merchant names are Title Case.
- **The faint pre-line:** screen titles are split into two lines — a faint setup line
  in regular weight ("Add your", "All Recent", "Available June") above the bold subject
  ("Budget Category", "Transactions"). This is the signature headline move.
- **Money:** always written with a `.0` cents tail, and the tail is dimmed
  (`--ink-faint`). E.g. `$1,894.0`, `−$1,456.0`. Negative = leading minus.
- **No emoji.** No exclamation marks except the literal `!` alert glyph in a badge.
- **Numbers everywhere are Chakra Petch**, never the UI font.

## Visual foundations

- **Surfaces:** warm olive "paper" (`--paper-300`) on a slightly darker sage canvas
  (`--canvas-500`). The whole system is desaturated and matte — a printed, sun-bleached
  feel. No glossy gradients.
- **Structure via green:** dark forest blocks (`--forest-700/600/500`) carve the layout —
  striped transaction lists, icon tiles, the bank-card lower half, screen footers.
- **Accents at full bleed only:** mustard (`--mustard-500`) flags the "Financial"
  category block; terracotta (`--terracotta-500`) is reserved for alerts and the single
  primary CTA per screen. Never use them as small text colors or thin borders.
- **Type:** Hanken Grotesk (display/UI, 500 + 800) and Chakra Petch (all numerals).
  Titles are heavy (800) and tight (-0.01em). Labels are 11px uppercase at 0.14em.
- **Shape:** almost everything is square. Corners appear only on the device shell
  (44px), avatars (pill), and buttons/tiles (4–10px). Internal content blocks have
  hard 0px edges that butt against each other edge-to-edge.
- **Lines:** 1px hairlines at ~18% ink opacity divide rows and fields. A 1.5px solid
  rule under the masthead. Thin vertical "bar-code" stripe clusters are a recurring
  decorative motif (budget meters, the bank card).
- **Layout:** full-bleed color zones stacked vertically; a fixed header (avatar left,
  3×3 dot grid-menu right); a frequently full-bleed colored footer zone carrying a
  CTA or alert.
- **Shadows:** essentially none in-screen. Only the device frame casts a soft drop
  shadow (`--shadow-screen`). Flat by design.
- **Motion:** if animating, keep it quiet — short opacity/transform fades, no bounces.
  Numerals can count up; color zones can wipe. Respect reduced-motion.
- **Imagery:** the only photographic element is the circular profile avatar. Everything
  else is type, color blocks, and generative line art (the radial "spend burst",
  curved hatch on the bank card).

## Iconography

- **Style:** outline icons, ~1.6px stroke, rounded joins, 24px grid, monochrome —
  inheriting the tile's foreground color. Drawn inside a square `IconTile`.
- **Categories seen:** gamepad (Shopping), ticket (Fitness), briefcase (Education),
  pie (Investments), heart (Health), clock, up-right arrow, alert square.
- **No icon font ships with these wireframes.** The reference uses small inline SVGs in
  the house stroke style. For production, **Lucide** (lucide.dev) is the closest CDN
  match — same 24px / ~1.6 stroke / rounded-join language — use it and keep strokes
  monochrome. Flag any swap to the design owner.
- The **grid-menu** affordance (3×3 dots, top-right) and the **bar-code stripe** clusters
  are bespoke — draw them by hand, not from an icon set.

## Brand mark

A small angular glyph: a folded ink leaf/corner with a terracotta lower notch (see
`index.html` masthead and the Vorxs Bank screen). Pair with the heavy lowercase
"vorxs" wordmark (Hanken 800, -0.04em).

---

## Caveats

- Colors are **reconstructed** from low-resolution wireframe exports (slightly
  desaturated in the source) — they're cleaned-up intent values, not pixel-exact rips.
- Fonts are **nearest Google Fonts matches** (Hanken Grotesk, Chakra Petch). If the
  originals were licensed faces (e.g. a different techno-mono), swap the two `--font-*`
  variables in `tokens/typography.css` and update the `@import`.
- No real logo/brand assets were provided — the mark is an interpretation.
