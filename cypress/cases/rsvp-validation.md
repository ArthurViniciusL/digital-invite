# RSVP validation — test cases

Spec file: `cypress/e2e/rsvp-validation.cy.ts`

Messages are the exact strings in `src/lib/schemas/rsvpSchema.ts`; `{{copy: …}}` placeholders are rendered verbatim by design.

## TC-VALID-01 — Empty submit flags every required field

- Source: spec#Guest submits an empty form; src/lib/schemas/rsvpSchema.ts
- Priority: medium
- Preconditions: modal open, empty form
- Given no field was filled
- When the guest activates "Confirmar"
- Then "Seu nome" shows "Informe seu nome", "Whatsapp" shows "{{copy: rsvp_error_whatsapp_required}}" (not the format message), "E-mail" shows "E-mail inválido", the count shows no message, no English Zod text appears, the modal stays on "Convidado", storage is untouched, and no insert request is made
- Status: automated

## TC-VALID-02 — No message on the first keystroke

- Source: spec#Every field is validated in Portuguese (messages do not appear on the first keystroke)
- Priority: medium
- Preconditions: modal open
- Given "Seu nome" is untouched
- When the guest types one character
- Then no message is shown
- Status: automated

## TC-VALID-03 — Message appears on blur

- Source: spec#Every field is validated in Portuguese ("SHALL appear when a field is blurred")
- Priority: medium
- Preconditions: modal open
- Given the guest typed one character into "Seu nome"
- When the field loses focus
- Then "Informe seu nome" is shown
- Status: automated — expected to fail: `useForm` in `ModalForm.tsx` uses the default `mode: 'onSubmit'`, which does not validate on blur

## TC-VALID-04 — Whitespace-only name is empty

- Source: spec#Guest enters only whitespace as a name
- Priority: medium
- Preconditions: modal open
- Given "Seu nome" holds only spaces
- When the guest submits
- Then "Informe seu nome" is shown, the modal stays open, nothing is stored or sent
- Status: automated

## TC-VALID-05 — One-character name is rejected

- Source: src/lib/schemas/rsvpSchema.ts (`min(2)`)
- Priority: medium
- Preconditions: modal open
- Given "Seu nome" is "M"
- When the guest submits
- Then "Informe seu nome" is shown
- Status: automated

## TC-VALID-06 — Two-character name is accepted

- Source: src/lib/schemas/rsvpSchema.ts (`min(2)`)
- Priority: medium
- Preconditions: modal open
- Given "Seu nome" is "Mu" and other fields are empty
- When the guest submits
- Then the name shows no message while the other fields are flagged
- Status: automated

## TC-VALID-07 — Name over 60 characters

- Source: src/lib/schemas/rsvpSchema.ts (`max(60)`)
- Priority: medium
- Preconditions: modal open
- Given "Seu nome" holds 61 characters
- When the guest submits, then deletes one character
- Then "{{copy: rsvp_error_name_max}}" is shown, and disappears at 60 characters without a second submit
- Status: automated

## TC-VALID-08 — Malformed e-mail

- Source: src/lib/schemas/rsvpSchema.ts (`z.email`)
- Priority: medium
- Preconditions: modal open
- Given "E-mail" is "maria@"
- When the guest submits
- Then "E-mail inválido" is shown, the modal stays open, nothing is stored or sent
- Status: automated

## TC-VALID-09 — Fixing a flagged field clears its message

- Source: spec#Guest fixes a flagged field
- Priority: medium
- Preconditions: modal open
- Given "E-mail" is flagged after submitting "maria@"
- When the guest types "example.com"
- Then the message disappears without a second submit
- Status: automated
