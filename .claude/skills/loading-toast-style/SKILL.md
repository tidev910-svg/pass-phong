---
name: loading-toast-feedback-style
description: >
  Apply this style when building loading states (skeleton screens, spinners,
  progress indicators) and feedback notifications (toasts, snackbars, inline
  success/error messages) for a project using the "bang-tin-ky-tuc-style" /
  "Dorm Bulletin Board" design system. ALWAYS use this skill when the user asks
  for "loading", "skeleton", "toast", "notification", "thông báo", "hiệu ứng
  loading", "trạng thái đang tải", or when building any async UI (data fetching,
  form submission, page transitions) within that design system. This is a
  companion style layer — read bang-tin-ky-tuc-style first for the base color
  tokens and typography, since this skill reuses those tokens rather than
  redefining them. If the project uses Ant Design (it does, by default, in this
  design system), prefer restyling Ant Design's own components over building
  custom ones from scratch — see "Implementation preference" below.
---

# Loading & Feedback Style (companion to "Dorm Bulletin Board")

This skill covers the two states the base bulletin-board skill doesn't: things
that are *temporary* (loading) and things that are *reactive* (toasts). Both
should feel like part of the same paper-and-pin world, not like a generic
component library was bolted on.

Reuse these tokens from `bang-tin-ky-tuc-style` (do not redefine new hex values
here — read them from wherever the project's theme constants already live):
`--paper`, `--paper-card`, `--ink`, `--ink-soft`, `--sky` (may be named
`--forest`/`COLOR_FOREST` in the project — same value), `--sky-dark`,
`--mustard`, `--mustard-dark`, `--border`.

Two additional semantic tokens this skill needs, if the project doesn't already
have them:
- `--danger` (~`#C0433A`) / `--danger-bg` (~`#FBEAE8`) — for error toasts.
- `--success` (reuse `--sky` for success, since this brand only has two accent
  colors — do not invent a third green just for success states).

## Implementation preference: Ant Design first

This design system is built on top of Ant Design. For every piece covered
below, prefer restyling Ant Design's built-in component over hand-building an
equivalent from scratch:

- Skeleton loading → Ant Design's `Skeleton` component (or `Skeleton.Button`,
  `Skeleton.Image`, `Skeleton.Input` for specific shapes), restyled via
  `ConfigProvider` theme tokens or a scoped CSS override for the shimmer
  gradient and colors described below — not a fully custom skeleton
  component, unless a specific shape genuinely can't be composed from Ant
  Design's skeleton primitives.
- Button loading spinner → the `loading` prop on Ant Design's `Button`
  (`<Button loading={...}>`), restyled so the spinner color matches the
  button's text color — not a hand-rolled spinner element.
- Toast / notification → Ant Design's `message` (for lightweight,
  auto-dismissing confirmations) and `notification` (for errors or anything
  with a title + description), with their default icons/colors/shadow
  overridden via `ConfigProvider` or a global style override to match the
  spec below — not a custom toast component built from a `<div>` and a
  portal, unless Ant Design's API can't support a required interaction (e.g.
  a persistent, manually-dismissed error — `notification` supports
  `duration: 0` for exactly this, so this should rarely be needed).
- Inline field-level errors (e.g. form validation) → Ant Design `Form` item
  validation styling, restyled to use `--danger` instead of its default red,
  rather than a custom error message element.

Only build a fully custom component when the Ant Design equivalent has no
reasonable prop/override path to the required visual or behavior — and note
that decision inline in the code (a short comment saying which Ant Design
component was considered and why it didn't fit) so it's clear this wasn't
skipped by default.

## 1. Skeleton loading

Principle: a skeleton should be a **flat, static silhouette** of the real
content's shape — no tilt, no washi tape, no hard offset shadow. Those
handcrafted details are earned by real content; applying them to a skeleton
reads as broken/glitchy rather than intentional. Once the real content loads,
it can animate in *once* (see "one loading moment" below) and pick up its
normal tilt/tape treatment.

- Skeleton blocks use a flat rounded rectangle, `border-radius` matching the
  real component it stands in for (e.g. same radius as a listing card), solid
  fill in a muted paper-tinted gray-blue, NOT `--paper-card` (too close to
  real content) and NOT pure gray (breaks the palette).
- Shimmer animation: a soft left-to-right sweep, subtle, slow (~1.6–2s per
  loop), using the same hue family as the base color, low contrast. Apply
  this as a scoped override on top of Ant Design's `Skeleton` (its default
  animated background), e.g.:
  ```css
  .ant-skeleton-content .ant-skeleton-paragraph > li,
  .ant-skeleton-content .ant-skeleton-title,
  .ant-skeleton-avatar,
  .ant-skeleton-button,
  .ant-skeleton-image {
    background: linear-gradient(
      100deg,
      rgba(30,42,51,0.06) 30%,
      rgba(30,42,51,0.12) 50%,
      rgba(30,42,51,0.06) 70%
    ) !important;
    background-size: 200% 100% !important;
    animation: skeleton-sweep 1.8s ease-in-out infinite !important;
  }
  @keyframes skeleton-sweep {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  ```
- Skeleton listing cards should roughly block out the real card's regions
  (cover image area, zone tag, price line, description lines) as separate
  `Skeleton.Image` / `Skeleton.Button` / `Skeleton` paragraph rows — compose
  Ant Design's primitives to match the real layout, don't collapse a whole
  card into one gray rectangle; the silhouette should still read as "a
  listing card is coming," not "something is loading, unclear what."
- Do NOT add a spinning/pulsing icon inside a skeleton card — the shimmer
  alone is the loading signal. Layering a `Spin` on top of a `Skeleton` is
  redundant motion.

## 2. Inline / button loading spinner

For buttons and small inline actions (e.g. "Lưu thay đổi" while saving):
- Use Ant Design `Button`'s `loading` prop — it already swaps the label
  region for a spinner. Override the spinner's color via CSS so it matches
  the button's text color (white on `--sky` buttons).
- Keep the button's existing hard offset shadow and size fixed during
  loading — Ant Design's `loading` state shouldn't shrink/grow the button;
  verify this holds with the project's current button sizing and fix via
  `min-width` if the label swap causes reflow.
- Ant Design's `loading` prop already disables the button and prevents
  double-clicks — rely on that rather than adding separate disabled-state
  logic.

## 3. Toast / notification

Toasts are the one place in this design system where a **triggered** entrance
animation is appropriate — the "no automatic animation" rule in the base
skill applies to page load, not to a user-triggered event like a save or an
error.

Visual structure (apply via Ant Design's `ConfigProvider` token overrides
and/or a scoped global style block targeting `.ant-message` /
`.ant-notification-notice`):
- Card: `--paper-card` background, 2px solid `--ink` border, `border-radius`
  ~10px, hard offset shadow `4px 4px 0 rgba(30,42,51,0.9)` (same shadow
  language as the rest of the system — override Ant Design's default soft
  shadow, don't keep it just because it's the library default).
- A small color bar or icon on the left edge signals type, using only these
  three states (do not invent more):
  - Success: `--sky` icon (checkmark), left border accent in `--sky`.
  - Error: `--danger` icon (exclamation), left border accent in `--danger`.
  - Info/neutral: `--mustard` icon (a small "pin" glyph, tying back to the
    bulletin-board motif), left border accent in `--mustard`.
- Text: title in Be Vietnam Pro semibold (~13.5px), optional description line
  below in `--ink-soft` (~12px) — override Ant Design's default notification
  typography to these, rather than leaving its default font stack. Do not
  use Baloo 2 or Caveat here — toasts are a functional UI element, not a
  branding moment, and decorative type would slow down reading a message
  that's meant to be glanced at quickly.
- No washi tape, no tilt, no corkboard texture inside the toast itself — it
  floats above the page, it isn't "pinned to the board."

Motion:
- Ant Design's `message`/`notification` already animate in/out — restyle the
  easing/duration only if the default doesn't match: enter over ~200–250ms
  ease-out (slide + slight fade), exit ~150–200ms reverse.
- Auto-dismiss after ~4s for success/info (Ant Design's default `duration`
  prop), but error toasts use `duration: 0` (stay until the user dismisses
  them manually) — don't auto-hide errors, the person may need time to read
  and act on them.
- Stacking behavior (~8px gap, newest on top or bottom) is handled by Ant
  Design's `notification`/`message` container by default — don't rebuild it,
  just confirm the gap matches via theme tokens if it's configurable.

## Pre-delivery checklist

- [ ] Used Ant Design's `Skeleton`, `Button loading`, and `message`/
      `notification` as the base, restyled via theme/CSS overrides — with a
      code comment explaining any place a fully custom component was built
      instead?
- [ ] Skeletons are flat and untilted — no tape, no tilt, no hard shadow on
      skeleton blocks themselves?
- [ ] Skeleton shape roughly matches the real component's regions, not one
      flat block?
- [ ] Button loading state swaps label→spinner without resizing the button?
- [ ] Toast uses the hard offset shadow (not soft blur) and only Be Vietnam
      Pro type (no Baloo 2 / Caveat)?
- [ ] Only three toast variants exist (success=sky, error=danger,
      info=mustard) — no extra ad-hoc colors introduced?
- [ ] Error toasts use `duration: 0` and do not auto-dismiss; success/info
      use the ~4s default?