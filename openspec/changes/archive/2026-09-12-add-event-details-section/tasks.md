## 1. Prerequisites

- [x] 1.1 Extend `src/components/typograph/Title.tsx` with an optional `as` prop
      (`'h1' | 'h2'`, default `'h1'`) so it can render either heading level, and verify
      `InviteHero.tsx`'s existing `<Title>` usage still renders an `<h1>` with no change to its
      current styling or markup
- [x] 1.2 Confirm `lucide-react`'s `Calendar`, `Clock`, `MapPin`, and `ExternalLink` icons import
      and render cleanly (this is the first use of `lucide-react` anywhere in the codebase) and
      verify `yarn typecheck` and `yarn lint` pass on a minimal import of all four

## 2. Section heading

- [x] 2.1 Implement the section heading (Element 1) using `<Title as="h2">`, wired to the
      `{{copy: event_details_heading}}` placeholder from design.md, sized visibly smaller than
      `InviteHero`'s centerpiece text, and verify the page has exactly one `<h1>` (the hero's) and
      this section's heading renders as an `<h2>`

## 3. Facts panel

- [x] 3.1 Implement the `.carved-2` facts panel container (heavy `border-4 border-carved-black
      bg-bone-white`, matching the hero panel's border treatment) and verify it does not share a
      `.carved-*` class with `InviteHero`'s `.carved-1` panel immediately above it
- [x] 3.2 Implement the date fact row: `Calendar` icon (`aria-hidden="true"`) plus the fixed label
      "Data" and fixed value "27 de setembro de 2026"
- [x] 3.3 Implement the time fact row: `Clock` icon (`aria-hidden="true"`) plus the fixed label
      "Horário" and fixed value "11h30"
- [x] 3.4 Implement the venue fact row: `MapPin` icon (`aria-hidden="true"`) plus the fixed label
      "Local" and fixed value "Alto da Serra Recepções, Cuité"
- [x] 3.5 Verify all three fact rows render identically regardless of route params, query string, or
      any guest-identifying state (no per-guest branch exists in the component), and verify a
      screen reader announces each row's label and value with no unlabeled icon announced

## 4. GPS call-to-action

- [x] 4.1 Implement the GPS link as a separate `.carved-3` styled control (distinct from the panel's
      `.carved-2`) inside or immediately below the facts panel, paired with the `ExternalLink` icon
      (`aria-hidden="true"`) and wired to the `{{copy: gps_link_label}}` placeholder
- [x] 4.2 Set the link's `href` to the fixed constant `https://maps.app.goo.gl/xxoBYQV8dQhPRaQi8`
      with `target="_blank"` and `rel="noopener noreferrer"`, and verify activating it opens a new
      tab while the invite page's own tab remains open and unaffected

## 5. Closing message

- [x] 5.1 Implement the closing message (Element 6) after the facts panel and GPS link, wired to the
      `{{copy: event_closing_message}}` placeholder, styled `font-body`/`carved-black`, and verify it
      renders after the panel as the section's final element

## 6. Integration and verification

- [x] 6.1 Compose the completed `EventDetails` into `src/pages/InvitePage/index.tsx` immediately
      after `<InviteHero />`, resolving the `EventDetails` half of the existing
      `TODO: compose EventDetails and RsvpForm once they exist` comment
- [x] 6.2 Run `yarn lint && yarn typecheck && yarn build` and verify all three succeed with no new
      warnings introduced by `EventDetails.tsx`, `Title.tsx`, or `InvitePage/index.tsx`
