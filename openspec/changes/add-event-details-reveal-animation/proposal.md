## Why

`add-event-details-section` deliberately shipped `EventDetails.tsx` with no entrance animation, to
avoid competing with `InviteHero`'s own load-in sequence. The user has now explicitly reversed that
call: `EventDetails` should reveal itself with motion too, both for a guest who lands with the
section already in view and for the more common case of a guest who has to scroll to it. This
change only reopens that one decision — it does not touch `InviteHero`'s existing sequence and does
not introduce a shared, reusable animation pattern for sections beyond `EventDetails`.

## What Changes

- Reverse the "no entrance animation" decision recorded in `add-event-details-section`'s
  `design.md` and reflected by the absence of any animation requirement in
  `openspec/changes/add-event-details-section/specs/event-details-section/spec.md`.
- Add a reveal animation to `EventDetails.tsx` driven by Framer Motion's `whileInView` (with
  `viewport={{ once: true }}`), the same dependency `InviteHero.tsx` already uses for its own
  sequence, applied here in scroll-triggered form rather than mount-triggered form.
- The single `whileInView` mechanism covers both required cases without a branch: an element
  already intersecting the viewport at first paint fires its enter state immediately, and an
  element below the fold fires it once scrolled into view.
- Respect `prefers-reduced-motion` exactly like `InviteHero.tsx` already does via
  `useReducedMotion()`: a guest with reduced motion enabled sees the section's final state
  immediately, with no animated transition.
- Keep the reveal reading as one coordinated sequence, not independent uncoordinated motion per
  element, mirroring `invite-hero-section`'s existing "one orchestrated sequence" requirement.
- No new copy placeholders — this is a purely behavioral change layered on the content slots
  `add-event-details-section` already scoped.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `event-details-section`: adds a scroll-triggered (and already-in-viewport-at-load) reveal
  animation requirement, replacing the prior "no entrance animation" position.

## Impact

- **Code**: `src/pages/InvitePage/partials/EventDetails.tsx` only. No change to `InviteHero.tsx`,
  `Title.tsx`, `InvitePage/index.tsx`, or any other section's file.
- **Dependencies**: none added — `framer-motion` is already installed and already used by
  `InviteHero.tsx`.
- **Assets**: none.
- **Design tokens**: none new; the reveal must stay within the existing palette (no opacity below 1
  in the section's settled/final state, no gradient or glow introduced as part of the transition).
- **Content**: none — no new `{{copy: ...}}` placeholders.
- **Out of scope for this change**: `InviteHero.tsx`'s own animation, any shared/reusable animation
  hook or component for future sections, `RsvpForm.tsx` or any other section, and any layout or
  content change to `EventDetails.tsx` beyond the animation itself.
