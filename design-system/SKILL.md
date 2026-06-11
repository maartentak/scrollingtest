---
name: vorxs-design
description: Use this skill to generate well-branded interfaces and assets for Vorxs, a calm editorial personal-finance app (sun-faded olive surfaces, deep forest structure, mechanical Chakra Petch numerals, mustard + terracotta accents). Use for production UI or throwaway prototypes, mocks, and slides. Contains colors, type, fonts, CSS tokens, and React UI components.
user-invocable: true
---

# Vorxs Design System

Read `readme.md` first — it is the full design guide (content tone, visual
foundations, iconography, brand mark). Then explore the files below.

## What's here
- `styles.css` — link this one file; it `@import`s all design tokens.
- `tokens/` — `colors.css`, `typography.css` (loads Hanken Grotesk + Chakra Petch
  from Google Fonts), `spacing.css`.
- `components/core/` — React primitives (`Button`, `Badge`, `IconTile`, `Avatar`,
  `StatDisplay`, `TransactionRow`). Each has a `.jsx`, a `.d.ts` props contract, and a
  `.prompt.md` usage note.
- `index.html` — a viewable reference page with the palette, type specimens, components,
  and six recreated app screens.
- `guidelines/` & `components/core/*.card.html` — specimen cards.

## How to use it
- **Visual artifacts** (slides, mocks, throwaway prototypes): copy the tokens and any
  assets out, then write static HTML that links `styles.css` and styles everything with
  the `--*` custom properties. Use the recreated screens in `index.html` as layout
  references.
- **Production code:** read the rules in `readme.md`, copy `tokens/` into the project's
  stylesheet pipeline (or translate the `--*` values to the app's token system), and
  port the `components/core/*.jsx` primitives into the codebase's component conventions.

## Non-negotiables (see readme for detail)
- All money uses **Chakra Petch**; the `.0` cents tail is dimmed to `--ink-faint`.
- Screen titles split into a faint pre-line + bold subject ("Add your" / "Budget Category").
- Mustard and terracotta appear **only as full-bleed blocks** — one terracotta CTA per
  screen, never as small text or thin borders.
- Internal blocks are square (0 radius) and butt edge-to-edge; only shells, avatars, and
  buttons round.
- Icons: outline, ~1.6px stroke, monochrome, in a square tile. Closest CDN set = Lucide.

If invoked with no other guidance, ask what the user wants to build, ask a few
clarifying questions, and act as an expert Vorxs designer who outputs HTML artifacts
(prototypes/mocks/slides) or production code as needed.
