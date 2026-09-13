## Context

`EventDetails.tsx` (`src/pages/InvitePage/partials/EventDetails.tsx`) currently renders in its final
state on mount, with no Framer Motion involvement at all — `add-event-details-section`'s
`design.md` recorded this under "No entrance animation," reasoning that a second staged entrance so
close to the hero's own would compete with it rather than add value.

The user has reopened that call: `EventDetails` should now reveal itself with motion, both when it
is already inside the viewport at first paint and when a guest has to scroll to it (the common case,
since `EventDetails` sits below the fold on most viewport heights once `InviteHero`'s bunting,
centerpiece, and subtitle are rendered above it). This change is scoped to `EventDetails.tsx` alone.
`InviteHero.tsx` keeps its existing mount-triggered sequence untouched, and no shared animation
hook/utility is introduced for reuse by future sections — both explicitly out of scope per the
caller's instructions.

`InviteHero.tsx` already depends on `framer-motion` (`motion`, `useReducedMotion`, `Variants`) for
its own load-in sequence, so no new dependency is introduced; this change reuses the same library in
its scroll-triggered form (`whileInView`) rather than its mount-triggered form (`animate` fired
unconditionally on mount, as `InviteHero` does today).

## Goals / Non-Goals

**Goals:**

- Specify the animation mechanism precisely enough that `dev` doesn't have to choose it:
  `whileInView` with `viewport={{ once: true }}`, applied to `EventDetails.tsx`'s existing elements.
- Cover both required cases (already-in-viewport-at-load, and scroll-into-view) through that single
  mechanism rather than a manual visibility check plus a mount-triggered branch.
- Preserve the existing reduced-motion contract already established by `InviteHero.tsx` and by
  `invite-hero-section`'s spec: a reduced-motion guest sees the final state immediately, with no
  animated transition.
- Keep the reveal reading as one coordinated sequence across the section's elements, not several
  independently-timed animations that draw attention to themselves individually.

**Non-Goals:**

- Any change to `InviteHero.tsx`'s own mount-triggered sequence.
- A shared, reusable "reveal on scroll" hook, wrapper component, or utility for other sections to
  consume later — this change hard-codes the behavior inside `EventDetails.tsx` only.
- Any layout, content, or copy change to `EventDetails.tsx` — the six elements, their composition,
  and the `{{copy: ...}}` placeholders from `add-event-details-section` are unchanged.
- Deciding `EventDetails`'s internal file decomposition — unchanged from the prior change, still
  left to `dev`.

## Decisions

### Mechanism: `whileInView` with `viewport={{ once: true }}`, not a mount-triggered branch

`InviteHero.tsx` orchestrates its sequence with `initial`/`animate` and `Variants`, firing
unconditionally on mount because the hero is always the first thing painted. `EventDetails` cannot
reuse that approach directly, because whether it is "already visible" depends on viewport height and
scroll position at load — a condition Framer Motion's `whileInView` already resolves internally via
`IntersectionObserver`, without `dev` writing a manual visibility check.

Convert the section's `motion`-wrapped elements from `initial`/`animate` to `initial`/`whileInView`,
adding `viewport={{ once: true }}` so the reveal fires exactly once per element and never re-triggers
on scrolling back up and down past the section. This is the one mechanism the caller specified and
is not open for `dev` to substitute (e.g. no `react-intersection-observer` or scroll-position math).

### What animates: the same panel/CTA/message structure, no new elements

No new wrapper `<section>` or extra DOM node is required to add motion — the existing structural
elements from `add-event-details-section` become the animated targets:

| Element                                 | Current tag                 | Becomes                                                                                                                                                                        |
| --------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Facts panel (`.carved-2` container)     | plain `<div>`               | `motion.div`                                                                                                                                                                   |
| GPS call-to-action (`.carved-3` anchor) | plain `<a>` (via `cn(...)`) | Framer Motion supports animating a custom component via `motion.a`, or the anchor can be wrapped in a `motion.div`; `dev`'s choice, since both satisfy the same visible reveal |
| Closing message (`<p>`)                 | plain `<p>`                 | `motion.p`                                                                                                                                                                     |
| Section heading (`<Title as="h2">`)     | `Title` component           | left un-animated (see below)                                                                                                                                                   |

The section heading is deliberately excluded from the motion treatment: animating a heading that
sits at the very top of `EventDetails`, immediately after `InviteHero`'s own already-settled
content, adds a second flash of motion right where a guest's eye lands first after finishing the
hero — the "one coordinated reveal" goal reads better as the panel, CTA, and closing message
entering together while the heading (already a static element per `add-event-details-section`)
anchors the section. `dev` may include the heading in the same `whileInView` group instead if, in
implementation, that reads as more coordinated than leaving it static — this is the one open
placement question below, not a hard requirement either way.

### Timing: one coordinated group, not independently-timed elements

Mirror `invite-hero-section`'s existing "one orchestrated sequence" requirement, translated to a
scroll trigger: the panel, CTA, and closing message should read as one reveal, not three
independently-timed animations competing for attention. In practice this means a shared or
near-identical duration (order of a few hundred milliseconds, similar magnitude to `InviteHero`'s
existing `0.4`–`0.6`s durations) with a small stagger between them (comparable to `InviteHero`'s own
staggering via `delay`, e.g. panel first, CTA and message shortly after) rather than one duration for
the panel and a visually distinct one for the rest. Exact duration/easing/delay values are left to
`dev`'s implementation judgment, consistent with how `add-event-details-section`'s design left
exact heading font sizes to `dev`.

Suggested motion style, consistent with "fade/slide/scale" per the caller's guidance and the
project's existing `panelVariants`/`subtitleVariants` patterns in `InviteHero.tsx`: the panel enters
with a slight upward slide plus fade (e.g. `y: 24, opacity: 0` → `y: 0, opacity: 1`), the CTA and
closing message follow with a smaller slide plus fade, shortly after the panel. This is illustrative,
not prescriptive — `dev` may reuse `InviteHero.tsx`'s exact easing curve or choose a comparable one,
as long as no gradient, glow, or non-opacity-driven fade is introduced and the section's _settled_
state carries no non-1 opacity, consistent with `GUIDELINES.md` §4.5's ban on transparency as a
static effect (a mid-transition opacity value is motion, not a static translucent surface, and is
not what that rule forbids).

### Reduced motion: same contract as `InviteHero.tsx`, expressed for a scroll trigger

Use the same `useReducedMotion()` call `InviteHero.tsx` already uses. When it returns `true`, every
animated element in `EventDetails` must render its final settled state immediately, with `initial`
set to `false` (matching `InviteHero.tsx`'s existing `initial={reduceMotion ? false : 'hidden'}`
pattern) so no transition plays regardless of scroll position — a reduced-motion guest who scrolls to
the section must see it fully rendered the instant it's in view, not merely "instant once
triggered." This is a direct carry-over of `invite-hero-section`'s existing reduced-motion
requirement shape, adapted from a mount trigger to a scroll trigger.

### Scope enforcement: `EventDetails.tsx` only

No shared hook, no new file under `src/hooks/` or `src/components/`, and no edit to
`InviteHero.tsx`. The `whileInView`/`viewport`/`Variants` usage is written directly inside
`EventDetails.tsx`, duplicating a small amount of the pattern already present in `InviteHero.tsx`
rather than extracting it — consistent with the caller's explicit instruction that generalizing this
into a reusable pattern is out of scope for now.

## Risks / Trade-offs

- **[Risk]** Excluding the section heading from the motion group is a judgment call the caller or
  `dev` may want to reverse. → **Mitigation**: documented above and repeated in Open Questions;
  reversing it is a small, contained edit (wrap `<Title as="h2">` in the same `motion` treatment),
  not a structural rework.
- **[Trade-off]** Not extracting a shared "reveal on scroll" hook now means a near-identical
  `whileInView`/reduced-motion pattern will likely be re-written by hand if a future change adds the
  same behavior to another section. Accepted per explicit scope instruction; revisit only if a
  second section requests the same behavior, at which point extracting a shared hook becomes a
  reasonable follow-up change.
- **[Risk]** `viewport={{ once: true }}`'s default trigger point (an element's center entering the
  viewport, unless `amount` is tuned) could fire earlier or later than expected on very short
  viewports. → **Mitigation**: not a correctness risk for the requirements below (the animation
  still plays exactly once, in both required cases); at most a timing/feel adjustment `dev` can tune
  via `viewport={{ once: true, amount: ... }}` without changing this design's mechanism choice.

## Open Questions

- Should the section heading (`<Title as="h2">`) join the same `whileInView` reveal group as the
  panel/CTA/message, or stay static as this design proposes? Flagging for the caller or `dev` to
  confirm; either choice satisfies the requirements below, since they're written at the
  panel/CTA/message level and don't mandate or forbid heading motion.
