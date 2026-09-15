# RSVP persisted state — test cases

Spec file: `cypress/e2e/rsvp-persisted-state.cy.ts`

The feedback text is asserted as the code builds it, `Tá confirmado, <first name>!` (with a comma, `RsvpForm.tsx`); the spec writes "Tá confirmado <primeiro nome>!" without one.

## TC-STATE-01 — Reload restores the greeting without confetti or a new insert

- Source: spec#Guest reloads the invite page after confirming; src/pages/InvitePage/partials/RsvpForm.tsx
- Priority: high
- Preconditions: local Supabase running; empty localStorage
- Given the guest confirmed with "NÃO" and the confetti layer appeared
- When the page is reloaded
- Then "Tá confirmado, Maria!" is visible, the confetti layer is absent, no confirmation button is rendered, no new insert request is made, and the database still holds one row for the e-mail
- Status: automated

## TC-STATE-02 — 320px success state has no horizontal overflow

- Source: openspec/changes/add-rsvp-guest-form/design.md (risk: long first name at 320px)
- Priority: low
- Preconditions: viewport 320x568; local Supabase running
- Given the guest confirmed
- When the success state is shown and its reveal animation has finished (opacity 1)
- Then the greeting is visible and the document is no wider than 320px
- Status: automated

## TC-STATE-03 — Returning guest with a stored name

- Source: spec#Returning guest with a stored name
- Priority: medium
- Preconditions: storage seeded with `digital-invite:rsvp-confirmed=true`, `digital-invite:rsvp-name=João Pedro`
- Given `/` is loaded
- When the section renders
- Then it reads "Tá confirmado, João!", with no confetti and no confirmation button
- Status: automated

## TC-STATE-04 — Flag without a name shows the fallback

- Source: spec#Guest confirmed under the previously shipped build
- Priority: medium
- Preconditions: storage seeded with the flag only
- Given `/` is loaded
- When the section renders
- Then it reads "{{copy: rsvp_feedback_fallback}}", with no "Tá confirmado" text and no confirmation button
- Status: automated

## TC-STATE-05 — Whitespace-only stored name shows the fallback

- Source: spec#A stored name is whitespace only
- Priority: medium
- Preconditions: storage seeded with the flag and a name of spaces
- Given `/` is loaded
- When the section renders
- Then it reads "{{copy: rsvp_feedback_fallback}}"
- Status: automated

## TC-STATE-06 — Flag other than "true" is ignored

- Source: spec#Stored flag is unrecognized but a name is present
- Priority: medium
- Preconditions: storage seeded with `digital-invite:rsvp-confirmed=yes` and a name
- Given `/` is loaded
- When the section is scrolled into view (the button reveals on scroll)
- Then the confirmation button is shown, no success region exists, and the stored name is not rendered
- Status: automated

## TC-STATE-07 — Storage reads throw on load

- Source: spec#Storage access is denied when the page loads
- Priority: medium
- Preconditions: `Storage.prototype.getItem` throws for every key, as in a browser that denies storage
- Given `/` is loaded
- When the section is scrolled into view
- Then the confirmation button is visible and no uncaught error is raised
- Status: automated

## TC-STATE-08 — Storage writes throw on confirmation

- Source: spec#Storage access is denied when the guest confirms
- Priority: medium
- Preconditions: `Storage.prototype.setItem` throws; local Supabase running
- Given the guest submits a valid form
- When the guest answers "NÃO"
- Then the greeting uses the first name, no toast (`[data-sonner-toast]`) is shown, and after a reload and scrolling the section into view the confirmation button is back
- Status: automated
