# RSVP modal — test cases

Spec file: `cypress/e2e/rsvp-modal.cy.ts`

Labels and placeholders are asserted as the code renders them (`src/pages/InvitePage/partials/RsvpFormFields.tsx`), which differs from `openspec/changes/add-rsvp-guest-form/specs/rsvp-confirmation-section/spec.md` ("Seu nome", "Quantidade de convite", placeholder `83 9 xxxx-xxxx`). The invoker asked for the code to win on copy; the mismatch is listed in the run summary.

## TC-MODAL-01 — Confirmation button opens the guest step

- Source: openspec/changes/add-rsvp-guest-form/specs/rsvp-confirmation-section/spec.md#Guest opens the modal for the first time
- Priority: high
- Preconditions: empty localStorage, 390x844
- Given `/` is loaded on a first visit
- When the guest activates "Bora confirmar presença"
- Then exactly one dialog opens with the title "Convidado"
- Status: automated

## TC-MODAL-02 — Four labelled fields in order with defaults

- Source: src/pages/InvitePage/partials/RsvpFormFields.tsx; spec#Guest opens the modal for the first time
- Priority: high
- Preconditions: empty localStorage
- Given the modal is open
- When the guest looks at the form
- Then the labels read "Seu nome: \*", "Whatsapp: \*", "E-mail: \*", "Quantidade de convites" in that order, each label targets its own input, name/WhatsApp/e-mail are empty with placeholders "Nome e Sobrenome", "(xx) x xxxx-xxxx", "@gmail.com", the count shows `1`, and "Confirmar" and the "Fechar" corner control are visible
- Status: automated

## TC-MODAL-03 — Query parameters do not pre-fill the form

- Source: add-rsvp-calendar-step spec#The modal is opened with a query string present
- Priority: low
- Preconditions: empty localStorage
- Given `/?name=Fulano&email=...&whatsapp=...` is loaded
- When the guest opens the modal
- Then every field is empty and the count is `1`
- Status: automated

## TC-MODAL-04 — Enter inside a field submits

- Source: spec#Guest uses the keyboard to move through the form
- Priority: medium
- Preconditions: modal open, empty form
- Given focus is in "Seu nome"
- When the guest presses Enter
- Then validation runs ("Informe seu nome" appears) and the modal stays on "Convidado"
- Status: automated

## TC-MODAL-05 — "Fechar" backs out without submitting

- Source: add-rsvp-calendar-step spec#Guest activates the corner close control on the form step
- Priority: medium
- Preconditions: modal open, name typed
- Given the form step is showing
- When the guest activates "Fechar"
- Then the dialog closes, the confirmation button is visible, no success region exists, both storage keys are null, and no insert request was made
- Status: automated

## TC-MODAL-06 — Escape backs out without submitting

- Source: add-rsvp-calendar-step spec#Guest presses Escape on the form step
- Priority: medium
- Preconditions: modal open, name typed
- Given the form step is showing
- When the guest presses Escape
- Then the same back-out result as TC-MODAL-05
- Status: automated

## TC-MODAL-07 — Overlay click backs out without submitting

- Source: add-rsvp-calendar-step spec#Guest taps outside the modal panel on the form step
- Priority: medium
- Preconditions: modal open, name typed
- Given the form step is showing
- When the guest clicks the overlay
- Then the same back-out result as TC-MODAL-05
- Status: automated

## TC-MODAL-08 — Values survive close and reopen

- Source: spec#Guest backs out and reopens the modal; src/pages/InvitePage/partials/ModalForm.tsx (no reset on close)
- Priority: medium
- Preconditions: empty localStorage
- Given the guest filled all four fields
- When the guest closes the modal and opens it again
- Then name, masked WhatsApp, e-mail and count are unchanged, and nothing was stored or sent
- Status: automated

## TC-MODAL-09 — Reload empties the form

- Source: spec#Guest reloads the page after backing out
- Priority: low
- Preconditions: empty localStorage
- Given the guest filled the form and closed the modal
- When the page is reloaded and the modal opened
- Then every field is empty and the count is `1`
- Status: automated

## TC-MODAL-10 — 320px viewport

- Source: openspec/changes/add-rsvp-guest-form/design.md (320px arrangement)
- Priority: low
- Preconditions: viewport 320x568
- Given the modal is open
- When the guest submits an empty form
- Then the panel stays within the 320px width, "Confirmar" can be scrolled into view, and the document has no horizontal overflow
- Status: automated

## TC-MODAL-11 — Tab order through the form

- Source: spec#Guest uses the keyboard to move through the form
- Priority: low
- Preconditions: modal open
- Given focus is in "Seu nome"
- When the guest presses Tab repeatedly
- Then focus moves through the fields in display order and reaches "Confirmar"
- Status: not automated — the stepper buttons sit between the count input and its neighbours, and the spec does not say where they fall in the order
