## 1. Motion setup

- [ ] 1.1 In `src/pages/InvitePage/partials/EventDetails.tsx`, import `motion` and
      `useReducedMotion` from `framer-motion` (same imports `InviteHero.tsx` already uses) and call
      `useReducedMotion()` once at the top of `EventDetails`, mirroring `InviteHero.tsx`'s
      `const reduceMotion = useReducedMotion() ?? false` pattern
- [ ] 1.2 Define `Variants` (or equivalent inline animation objects) for the facts panel, the GPS
      call-to-action, and the closing message, expressing a fade plus slight slide (or fade plus
      scale) entrance, with durations in the same order of magnitude as `InviteHero.tsx`'s existing
      `0.4`–`0.6`s values and a small stagger between the three so they read as one coordinated
      group rather than three independent animations

## 2. Apply the reveal to the section's elements

- [ ] 2.1 Convert the facts panel container to a `motion.div`, with `initial={reduceMotion ? false :
      'hidden'}`, `whileInView="visible"`, `viewport={{ once: true }}`, and the panel's variants from
      1.2
- [ ] 2.2 Convert the GPS call-to-action to an animated element (either `motion.a` directly, or the
      existing anchor wrapped in a `motion.div`, `dev`'s choice) with the same
      `initial`/`whileInView`/`viewport` pattern and the CTA's variants from 1.2, offset with a small
      delay after the panel so the two don't animate simultaneously
- [ ] 2.3 Convert the closing message `<p>` to a `motion.p` with the same
      `initial`/`whileInView`/`viewport` pattern and the message's variants from 1.2, offset after the
      panel and CTA
- [ ] 2.4 Decide whether the section heading (`<Title as="h2">`) joins the same reveal group or stays
      static, per design.md's Open Question, and implement whichever reads as more coordinated;
      either choice satisfies the requirements below

## 3. Reduced motion and single-play verification

- [ ] 3.1 Verify with `prefers-reduced-motion: reduce` simulated (e.g. via browser devtools
      emulation) that the section renders fully in its final state the instant it enters the
      viewport, both when already visible at load and after scrolling, with no animated transition
      observable
- [ ] 3.2 Verify with default motion settings that scrolling the section into view plays the reveal
      once, and that scrolling away and back does not replay it (`viewport={{ once: true }}` behaving
      as expected)
- [ ] 3.3 Verify with default motion settings and a tall/zoomed-out viewport (section already within
      the initial viewport at load) that the reveal plays immediately on load without requiring
      scroll

## 4. Regression and scope check

- [ ] 4.1 Confirm `InviteHero.tsx` is unmodified and its existing load-in sequence still behaves as
      before (no shared code was extracted, no import changed)
- [ ] 4.2 Confirm no new file was added under `src/hooks/` or elsewhere for this animation — the
      `whileInView`/`variants` logic lives entirely inside `EventDetails.tsx`
- [ ] 4.3 Run `yarn lint && yarn typecheck && yarn build` and verify all three succeed with no new
      warnings introduced by `EventDetails.tsx`
