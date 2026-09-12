## Why

The public invite page at `/` currently renders only a stub (`Title` + "Invite Page — under
construction" inside `PageWrapper`), and `InviteHero.tsx` is an explicit placeholder. Section 1 of
the page — the hero/cover a guest sees first — has no layout or content scope defined yet, so `dev`
has nothing buildable and the copywriter has no slots to fill. PROJECT.md §4.6 and §5.1 already
call for a cordel-cover-style typographic centerpiece and an opening interactive moment; this change
turns that intent into a concrete, buildable layout for the first of the invite page's sections.

## What Changes

- Define the layout structure of `InviteHero.tsx`: a cordel-title line, the "Muricarliton" + "50"
  typographic centerpiece, a one-line event-description subtitle, and an illustrated composition
  built only from assets already in `public/assets/images/`.
- Specify which existing design tokens and carved-outline utilities (`GUIDELINES.md` §5) apply to
  each piece, and where the two neighboring carved shapes must use different `.carved-*` classes per
  §5.3.
- Specify a single load-in animation sequence (Framer Motion) for the hero, in place of scattered
  per-element effects, answering PROJECT.md §5.1's open call for an opening interactive moment.
- Leave every piece of guest-facing wording as a scoped, tone-and-length-bound placeholder for the
  copy writer agent — no final Portuguese copy is authored here.
- Record two open items that are outside this change's boundary: the `cactus_004.svg` reference
  file named in `GUIDELINES.md` §9.1/§11.1 does not exist in `public/assets/images/` (only
  `_001`–`_003` do), and `Title.tsx` currently violates project conventions (default export,
  semicolons, double quotes) and needs a fix pass before or during implementation.

## Capabilities

### New Capabilities

- `invite-hero-section`: layout structure and content scope for the public invite page's opening
  section (title line, honoree typographic centerpiece, event subtitle, illustrated composition).

### Modified Capabilities

_None — no existing spec covers the invite page yet._

## Impact

- **Code**: `src/components/invite/InviteHero.tsx` (implementation target), composed into
  `src/pages/InvitePage/index.tsx` in place of the current placeholder `Title` + "under
  construction" text. May reuse `src/components/typograph/Title.tsx` as the title primitive.
- **Assets**: read-only references to `broom.svg`, `cactus_001.svg`, `cactus_002.svg`,
  `cactus_003.svg`, `flags.png`, `straw_hat.svg`, `straw_hat_002.svg`, `sun.svg` in
  `public/assets/images/`. No new asset is requested by this change.
- **Design tokens**: consumes existing `--color-carved-black`, `--color-bone-white`,
  `--color-sertao-brown`, `font-title`/`font-body`, and `.carved-1/2/3` from `src/styles/globals.css`
  — no new tokens introduced.
- **Content**: introduces copy placeholders for the copy writer agent (cordel title line, event
  subtitle, illustration alt text); no Supabase, routing, or data-model changes.
- **Out of scope for this change**: `EventDetails.tsx`, `RsvpForm.tsx`, and any other section of the
  invite page; per-guest personalization (explicitly out of scope per PROJECT.md §7); drawing or
  requesting new `.svg` assets; fixing `Title.tsx`'s convention violations (flagged for `dev`).
