# RSVP guest count — test cases

Spec file: `cypress/e2e/rsvp-guest-count.cy.ts`

## TC-COUNT-01 — Default value and control state

- Source: spec#Guest is at the floor; src/components/form/CarvedStepperField.tsx
- Priority: medium
- Preconditions: modal open
- Given the form is untouched
- When the guest looks at "Quantidade de convites"
- Then the value is `1`, the input is `type="text"` with `inputmode="numeric"`, "Diminuir quantidade" is disabled and "Aumentar quantidade" is enabled
- Status: automated

## TC-COUNT-02 — Increment does not submit

- Source: spec#Guest increments the guest count
- Priority: medium
- Preconditions: modal open
- Given the value is `1`
- When the guest activates "Aumentar quantidade"
- Then the value is `2`, "Diminuir quantidade" is enabled, the modal stays on "Convidado" with no messages, and no insert request is made
- Status: automated

## TC-COUNT-03 — Ceiling of 10

- Source: spec#Guest reaches the ceiling; src/lib/schemas/rsvpSchema.ts (`MAX_GUEST_COUNT`)
- Priority: medium
- Preconditions: modal open
- Given the value is `1`
- When the guest activates "Aumentar quantidade" nine times
- Then the value is `10` and "Aumentar quantidade" is disabled
- Status: automated

## TC-COUNT-04 — Floor of 1

- Source: spec#Guest is at the floor
- Priority: medium
- Preconditions: modal open
- Given the guest typed `3`
- When the guest activates "Diminuir quantidade" twice
- Then the value is `1` and "Diminuir quantidade" is disabled
- Status: automated

## TC-COUNT-05 — Typed value above the ceiling

- Source: spec#Guest types a value above the ceiling
- Priority: medium
- Preconditions: modal open
- Given the guest typed `50`
- When the guest submits
- Then "Aumentar quantidade" is disabled, the field shows "{{copy: rsvp_error_guest_count_max}}", and the modal stays open
- Status: automated

## TC-COUNT-06 — Non-numeric input answered in Portuguese

- Source: spec#Guest types a letter into the guest count field
- Priority: medium
- Preconditions: modal open
- Given the guest typed `ab`
- When the guest submits
- Then the field shows "{{copy: rsvp_error_guest_count_type}}" and no "expected number" / "Invalid input" text appears
- Status: automated

## TC-COUNT-07 — Fractional value

- Source: src/lib/schemas/rsvpSchema.ts (`.int()`); the input's `maxLength={2}` makes `.5` the reachable fraction
- Priority: medium
- Preconditions: modal open
- Given the guest typed `.5`
- When the guest submits
- Then the field shows "{{copy: rsvp_error_guest_count_int}}"
- Status: automated

## TC-COUNT-08 — Zero

- Source: src/lib/schemas/rsvpSchema.ts (`min(1)`)
- Priority: medium
- Preconditions: modal open
- Given the guest typed `0`
- When the guest submits
- Then the field shows "Mínimo de 1 pessoa"
- Status: automated

## TC-COUNT-09 — Emptied field

- Source: src/lib/schemas/rsvpSchema.ts (`z.coerce.number` turns `""` into `0`)
- Priority: medium
- Preconditions: modal open
- Given the guest cleared the field
- When the guest submits
- Then the field shows "Mínimo de 1 pessoa"
- Status: automated

## TC-COUNT-10 — Stepping a flagged value back into range clears the message

- Source: spec#Guest fixes a flagged field
- Priority: medium
- Preconditions: modal open
- Given the field is flagged after submitting `50`
- When the guest activates "Diminuir quantidade"
- Then the value is `10` and the message disappears
- Status: automated
