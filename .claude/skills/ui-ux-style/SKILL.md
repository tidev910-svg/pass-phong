---
name: bang-tin-ky-tuc-style
description: >
  Apply the "Dorm Bulletin Board" (bảng tin ký túc / corkboard) visual style when
  creating or editing web UI (HTML, React, components, landing pages, listing pages).
  ALWAYS use this skill when the user mentions "bulletin board", "bảng tin", "dorm
  board", "corkboard", "washi tape", "sticky note", "handwritten note style", "dorm
  student style", or describes a warm, handcrafted interface that looks like cards
  pinned to a notice board — even if they don't use these exact words. This is a style
  layer, meant to be applied AFTER reading frontend-design (for the environment's
  technical constraints), not a replacement for it.
---

# "Dorm Bulletin Board" Style

This is the token system and visual principles for the "dorm bulletin board" style — the
feel of a real paper notice board: slightly tilted pinned cards, washi tape strips,
dashed cardboard-like borders, and a touch of handwriting. Warm and handcrafted, best
suited to products aimed at students or young communities (classifieds, room-swap /
sublet listings, roommate finders, campus marketplaces).

Read `/mnt/skills/public/frontend-design/SKILL.md` (or the environment's equivalent)
FIRST to learn the technical constraints (available fonts, how images are inserted, file
structure), then layer the tokens below on top.

## Color tokens

Use exactly this palette — do not substitute a different "cliché" palette (do not use
warm cream `#F4F1EA` background + terracotta accent `#D97757` — that combination is a
generic AI default, not this style):

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F8F3E7` | Page background, faux ivory paper |
| `--paper-card` | `#FFFDF6` | Card background, slightly brighter than the page |
| `--ink` | `#2B2A24` | Primary text — do NOT use pure black `#000` |
| `--ink-soft` | `#5B584C` | Secondary text, descriptions, metadata |
| `--forest` | `#2F5233` | Primary accent — buttons, active states |
| `--forest-dark` | `#22401F` | Darker forest — used for the hard drop-shadow (see below) |
| `--mustard` | `#E3A234` | Secondary accent — washi tape, highlighted price |
| `--mustard-dark` | `#B77E1F` | Darker mustard — for handwritten emphasis text |
| `--border` | `#DCD2B4` | Dashed borders, board outline |

Do not introduce a third accent color beyond forest/mustard — keep exactly these two
accents to avoid diluting the palette.

## Typography

- **Display / heading:** `Baloo 2`, weight 700–800 — a rounded, chunky, friendly font.
- **Body:** `Be Vietnam Pro`, weight 400–600 — has strong Vietnamese diacritic support.
- **Handwritten accent (use VERY sparingly, at most 1–2 spots per screen):** `Caveat`,
  weight 600–700 — for a label on a washi-tape strip or a single small annotation. Do
  NOT use it for body copy or headings.
- Do not use all-caps for labels. Do not add an unnecessary eyebrow label above a
  heading unless the content genuinely needs it.

## Signature layout devices

These are what actually make the style read as "bulletin board" — without them you just
get an ordinary rounded-card webpage:

1. **Subtle dotted background** to fake a corkboard texture, via a repeating
   `radial-gradient` — do NOT use a heavy texture image:
   ```css
   background:
     radial-gradient(circle at 1px 1px, rgba(43,42,36,0.06) 1px, transparent 0) 0 0/22px 22px,
     var(--paper);
   ```
2. **Dashed border** on the main filter/board panel, with a moderate border-radius
   (16–20px) — avoid the overly rounded SaaS-card look.
3. **Pin/tape label:** a small floating label above a panel, set in `Caveat`, mustard
   background, rotated slightly (`rotate(-4deg)`), with a thin drop-shadow — mimicking a
   pinned scrap of paper.
4. **Slightly tilted cards:** each card in a listing rotates a different tiny amount
   (`-1.2deg` to `+0.8deg`, never more than ~2deg) so it looks hand-placed rather than
   machine-aligned. Cards use a solid 2px `--ink` border (not a thin gray hairline), a
   small border-radius (4–8px, NOT large rounded corners), and a hard block shadow
   instead of a soft blurred one:
   ```css
   border: 2px solid var(--ink);
   border-radius: 6px;
   box-shadow: 5px 5px 0 rgba(43,42,36,0.9); /* hard offset shadow, no blur */
   ```
5. **Washi tape strip:** a small rectangle (~90×26px), light mustard, rotated slightly,
   placed overlapping the top edge of each card — mimicking a piece of tape holding the
   paper down.
6. **Fully pill-shaped chips** for area/category filters — this is the ONLY place that
   gets a 999px border-radius, deliberately contrasting with the otherwise squared-off
   blocks (board, cards).
7. **Primary CTA button:** forest background, white text, moderate border-radius
   (10px), with a hard offset shadow `box-shadow: 3px 3px 0 var(--forest-dark)` — no
   soft blur shadow, no gradient.

## What NOT to do (avoid breaking the style)

- Do not use the default SaaS-card soft shadow `rgba(0,0,0,.1)`.
- Do not apply the same large border-radius uniformly to everything (cards, buttons,
  inputs) — each block type should have a deliberately different corner treatment (see
  layout devices above).
- Do not add decorative gradients or complex background imagery.
- Do not overuse `Caveat` — using it for all headings will hurt readability and break
  the balance; reserve it for one small line or accent only.
- Do not add automatic load-in animation (staggered fade-in / slide-up on page load) —
  the "handcrafted" feel of this style comes from static layout choices (tilt, taped
  labels), not from motion.

## Pre-delivery checklist

- [ ] Using exactly the forest + mustard palette on an ivory paper background, no other
      hues mixed in?
- [ ] Headings in Baloo 2, body in Be Vietnam Pro, Caveat appearing in at most 1–2
      spots?
- [ ] Does every card have a slight tilt and a washi tape strip?
- [ ] Are shadows hard offset shadows (no blur), not the default soft SaaS shadow?
- [ ] Are filter chips fully pill-shaped, while the board/cards/inputs use a small,
      moderate border-radius instead?
- [ ] No automatic load-in animation?

If the user wants to combine this style with another request (e.g. minimalism), ask
which one should take priority — the two directions conflict on decorative density (this
style is deliberately detail-rich and handcrafted; minimalism deliberately strips detail
away).