# RSVP submission — test cases

Spec file: `cypress/e2e/rsvp-submission.cy.ts`

No OpenSpec change describes the Supabase insert (the two RSVP changes still say "No Supabase insert"); insert cases come from the code: `src/lib/api/rsvp.ts`, `src/hooks/useCreateRsvp.ts`, `src/pages/InvitePage/partials/ModalForm.tsx`. Rows are read back through the local REST API as the seeded admin `e2e-admin`.

## TC-SUBMIT-01 — One row with the Portuguese column mapping

- Source: src/lib/api/rsvp.ts (`createRsvp`); src/lib/schemas/rsvpSchema.ts (`toRsvpRow`)
- Priority: high
- Preconditions: local Supabase running with the `rsvp` table; unique e-mail per run; empty localStorage
- Given the guest fills name "Maria das Graças Figueredo", WhatsApp `83987654321`, e-mail `Maria.Convidada.<timestamp>@Example.com`, count `3`
- When the guest activates "Confirmar"
- Then exactly one POST to `/rest/v1/rsvp` is sent with body `{ nome, email (lower-cased), whatsapp: "83 9 8765-4321", numero_pessoas: 3 }` and answered 201, and the database holds exactly that one row for the e-mail
- Status: automated

## TC-SUBMIT-02 — Trimmed single-word name

- Source: src/lib/schemas/rsvpSchema.ts (`trim`); spec#Guest confirms with a single-word name
- Priority: high
- Preconditions: as TC-SUBMIT-01
- Given the guest typed the name `  Muricarliton  `
- When the guest submits and answers "NÃO"
- Then the insert body has `nome: "Muricarliton"`, the page reads "Tá confirmado, Muricarliton!", and `digital-invite:rsvp-name` is `Muricarliton`
- Status: automated

## TC-SUBMIT-03 — Calendar step before the page confirms

- Source: add-rsvp-calendar-step spec#Guest submits a valid form; src/pages/InvitePage/partials/ModalForm.tsx (storage is written right after the insert succeeds)
- Priority: high
- Preconditions: as TC-SUBMIT-01
- Given a valid form
- When the insert succeeds
- Then the dialog title is "Calendário", the form is gone, "SIM" and "NÃO" are shown, the confirmation button still exists behind the modal, and both storage keys are already written (`true` and the trimmed name)
- Status: automated

## TC-SUBMIT-04 — Invalid submit sends nothing

- Source: add-rsvp-calendar-step spec#Guest submits an invalid form
- Priority: medium
- Preconditions: modal open
- Given every field is valid except e-mail `maria@`
- When the guest activates "Confirmar"
- Then "E-mail inválido" is shown and no insert request is made
- Status: automated

## TC-SUBMIT-05 — Pending state

- Source: src/pages/InvitePage/partials/GuestStep.tsx; ModalForm.tsx (`handleOpenChange` ignores close while submitting)
- Priority: medium
- Preconditions: insert stubbed with a 201 answered after 1.5 s
- Given a valid form
- When the guest activates "Confirmar" and presses Escape while the request is pending
- Then the button reads "Enviando..." with `disabled` and `aria-busy="true"`, the dialog stays open, and the calendar step appears once the response arrives
- Status: automated

## TC-SUBMIT-06 — "NÃO" confirms

- Source: add-rsvp-calendar-step spec#Guest chooses NÃO
- Priority: high
- Preconditions: as TC-SUBMIT-01
- Given the calendar step is showing
- When the guest activates "NÃO"
- Then the dialog closes, the success region reads "Tá confirmado, Maria!", the confetti layer is present, the confirmation button is gone, `digital-invite:rsvp-confirmed` is `true` and `digital-invite:rsvp-name` is the full submitted name
- Status: automated

## TC-SUBMIT-07 — "Fechar" on the calendar step confirms

- Source: add-rsvp-calendar-step spec#Guest closes the calendar step with the corner control
- Priority: medium
- Preconditions: as TC-SUBMIT-01
- Given the calendar step is showing
- When the guest activates "Fechar"
- Then the same result as TC-SUBMIT-06
- Status: automated

## TC-SUBMIT-08 — Escape on the calendar step confirms

- Source: add-rsvp-calendar-step spec#Guest presses Escape on the calendar step
- Priority: medium
- Preconditions: as TC-SUBMIT-01
- Given the calendar step is showing
- When the guest presses Escape
- Then the same result as TC-SUBMIT-06
- Status: automated

## TC-SUBMIT-09 — Overlay click on the calendar step confirms

- Source: add-rsvp-calendar-step spec#Guest taps the overlay on the calendar step
- Priority: medium
- Preconditions: as TC-SUBMIT-01
- Given the calendar step is showing
- When the guest clicks the overlay
- Then the same result as TC-SUBMIT-06
- Status: automated

## TC-SUBMIT-10 — "SIM" targets Google Calendar and confirms

- Source: add-rsvp-calendar-step spec#Guest chooses SIM; src/pages/InvitePage/partials/CalendarStep.tsx
- Priority: medium
- Preconditions: as TC-SUBMIT-01; the link's default navigation is blocked in the test so the runner keeps its tab
- Given the calendar step is showing
- When the guest activates "SIM"
- Then the link points to `https://calendar.google.com/calendar/render?…` with `target="_blank"` and `rel` containing `noopener`, and the same result as TC-SUBMIT-06 follows
- Status: automated
