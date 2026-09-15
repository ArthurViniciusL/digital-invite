# RSVP WhatsApp field — test cases

Spec file: `cypress/e2e/rsvp-whatsapp-field.cy.ts`

## TC-WHATS-01 — Eleven typed digits are formatted

- Source: spec#Guest types a full number; src/lib/formatters/whatsappNumber.ts
- Priority: medium
- Preconditions: modal open
- Given the WhatsApp field is empty
- When the guest types `83987654321`
- Then the field shows `83 9 8765-4321`
- Status: automated

## TC-WHATS-02 — No trailing separator on a partial number

- Source: spec#Guest types a partial number
- Priority: medium
- Preconditions: modal open
- Given the WhatsApp field is empty
- When the guest types `83`, then `9`, then `8765`, then `4`
- Then the field shows `83`, `83 9`, `83 9 8765`, `83 9 8765-4` in turn
- Status: automated

## TC-WHATS-03 — Backspace across a separator

- Source: spec#Guest backspaces across a separator
- Priority: medium
- Preconditions: modal open
- Given the field shows `83 9 8765`
- When the guest presses Backspace once
- Then the field shows `83 9 876`
- Status: automated

## TC-WHATS-04 — Typed non-digits are discarded

- Source: spec#The WhatsApp number is formatted as the guest types
- Priority: medium
- Preconditions: modal open
- Given the WhatsApp field is empty
- When the guest types `(83) 98765-4321` character by character
- Then the field shows `83 9 8765-4321`
- Status: automated

## TC-WHATS-05 — Pasted formatted number

- Source: spec#Guest pastes a formatted number
- Priority: medium
- Preconditions: modal open
- Given the WhatsApp field is empty
- When the guest pastes `(83) 98765-4321` (15 characters; the paste is truncated to the input's `maxLength`, as a browser does)
- Then the field shows `83 9 8765-4321`
- Status: automated — expected to fail: `RsvpFormFields.tsx` sets `maxLength={14}`, so a real paste keeps `(83) 98765-432` and the field shows `83 9 8765-432`

## TC-WHATS-06 — Digits past eleven are dropped

- Source: spec#Guest keeps typing past eleven digits
- Priority: medium
- Preconditions: modal open
- Given the WhatsApp field is empty
- When the guest types `839876543219999`
- Then the field shows `83 9 8765-4321`
- Status: automated

## TC-WHATS-07 — Empty field shows the required message

- Source: spec#Guest leaves the WhatsApp field blank
- Priority: medium
- Preconditions: modal open
- Given the WhatsApp field is empty
- When the guest submits
- Then the field shows "{{copy: rsvp_error_whatsapp_required}}" only
- Status: automated

## TC-WHATS-08 — Landline is rejected

- Source: spec#Guest enters a landline number
- Priority: medium
- Preconditions: modal open
- Given the guest typed the ten digits `8333334444`
- When the guest submits
- Then the field shows "{{copy: rsvp_error_whatsapp_format}}" and the modal stays on "Convidado"
- Status: automated

## TC-WHATS-09 — Incomplete number is rejected

- Source: spec#Guest submits an incomplete number
- Priority: medium
- Preconditions: modal open
- Given the field shows `83 9 8765`
- When the guest submits
- Then the field shows "{{copy: rsvp_error_whatsapp_format}}"
- Status: automated

## TC-WHATS-10 — Eleven digits without the ninth digit are rejected

- Source: src/lib/schemas/rsvpSchema.ts (regex `/^\d{2} 9 \d{4}-\d{4}$/`)
- Priority: medium
- Preconditions: modal open
- Given the guest typed `83887654321`
- When the guest submits
- Then the field shows "{{copy: rsvp_error_whatsapp_format}}"
- Status: automated

## TC-WHATS-11 — Eleven-digit mobile is accepted

- Source: spec#The WhatsApp field accepts only a Brazilian mobile number
- Priority: medium
- Preconditions: modal open
- Given the guest typed `83987654321` and left the name empty
- When the guest submits
- Then the WhatsApp field has no message while the name is flagged, and no insert request is made
- Status: automated

## TC-WHATS-12 — Completing a flagged number clears the message

- Source: spec#Guest fixes a flagged field
- Priority: medium
- Preconditions: modal open
- Given the field is flagged after submitting `83 9 8765`
- When the guest types `4321`
- Then the message disappears without a second submit
- Status: automated
