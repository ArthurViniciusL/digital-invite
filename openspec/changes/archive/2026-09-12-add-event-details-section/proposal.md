## Why

The public invite page at `/` has a working section 1 (`InviteHero.tsx`, composed into
`InvitePage`), but section 2 — the block that actually tells a guest when and where to show up —
is still the stub `EventDetails.tsx` ("Event details — under construction"). Without a defined
layout and content scope, `dev` has nothing buildable and the copy writer has no slots to fill for
the section carrying the invite's most load-bearing information: date, time, venue, and how to get
there. `PROJECT.md` §2 already fixes these facts; this change turns them into a concrete, buildable
layout for the second of the invite page's sections.

## What Changes

- Define the layout structure of `EventDetails.tsx`: a secondary section heading, a facts panel
  with three labeled facts (date, time, venue), a GPS call-to-action linking out to Google Maps,
  and a closing message.
- Specify which existing design tokens and carved-outline utilities (`GUIDELINES.md` §5) apply to
  each piece, choosing `.carved-2` for the facts panel and `.carved-3` for the GPS CTA so neither
  repeats the hero's adjacent `.carved-1`/`.carved-3` pairing nor its own internal silhouette, per
  §5.3.
- Introduce Lucide as the icon source for this section's four icons (`Calendar`, `Clock`, `MapPin`,
  `ExternalLink`) — the first use of `lucide-react` anywhere in the codebase.
- Extend `Title.tsx` with an optional `as` prop (`'h1' | 'h2'`, default `'h1'`) so this section can
  render a real `<h2>` instead of a second page-level `<h1>`, without breaking `InviteHero`'s
  existing usage.
- Leave every piece of guest-facing wording that requires tone or word-choice judgment as a scoped,
  length-bound placeholder for the copy writer agent — fixed factual strings (the date, the time,
  the venue name, and the labels "Data"/"Horário"/"Local") are written directly, since they carry no
  creative content and are already fixed by `PROJECT.md` §2.
- Record one open item for the caller to weigh in on: whether the GPS link should be a separate
  call-to-action control (this change's decision) or the venue fact's own text turned into a link.

## Capabilities

### New Capabilities

- `event-details-section`: layout structure and content scope for the public invite page's second
  section (event facts, GPS link, closing message).

### Modified Capabilities

_None — `invite-hero-section` (the only existing capability for this page) is untouched by this
change; the two sections compose independently inside `InvitePage`._

## Impact

- **Code**: `src/pages/InvitePage/partials/EventDetails.tsx` (implementation target, replacing the
  existing stub), composed into `src/pages/InvitePage/index.tsx` immediately after `<InviteHero />`.
  `src/components/typograph/Title.tsx` gains an `as` prop (additive, backward compatible).
- **Dependencies**: `lucide-react` is already an installed dependency; this change is its first
  consumer (`Calendar`, `Clock`, `MapPin`, `ExternalLink`). No new package is added.
- **Assets**: none. This section is informational/typographic plus Lucide icons — no new or
  existing `.svg`/`.png` illustration asset is referenced.
- **Design tokens**: consumes existing `--color-carved-black`, `--color-bone-white`,
  `--color-sertao-brown`, `font-title`/`font-body`, and `.carved-2`/`.carved-3` from
  `src/styles/globals.css` — no new tokens introduced.
- **Content**: introduces copy placeholders for the copy writer agent (section heading, GPS link
  label, closing message); no Supabase, routing, or data-model changes.
- **Out of scope for this change**: `RsvpForm.tsx` and any other section of the invite page;
  per-guest personalization (out of scope per `PROJECT.md` §7); any entrance animation for this
  section; drawing or requesting new `.svg` assets; the internal file decomposition of
  `EventDetails.tsx` (left to `dev`).
