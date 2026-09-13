## Purpose

Defines the observable content and behavior of the public invite page's third section: the block
that lets a guest confirm attendance. This delta turns the section's placeholder modal into a real
form — four fields, Portuguese validation, a masked WhatsApp number — and makes the success state
greet the guest by name. It also reconciles two requirements with the code that actually shipped
(the modal's title and its corner close control).

Persisting an RSVP remains out of scope: a valid submit still only closes the modal and plays the
existing confetti and feedback success state. No Supabase insert, no `useRsvpSubmit` hook, no admin
dashboard column for the new field, and no RSVP deadline cutoff are part of this capability.

Every requirement of `rsvp-confirmation-section` not restated below — the confirmation button
opening the modal, the confetti playing only on a fresh confirmation, reduced motion, and
`RsvpForm`'s composition into `InvitePage` — is unchanged by this change.

Strings written as `{{copy: …}}` below are placeholders rendered verbatim until the copy writer
replaces them. Strings written in quotes are fixed and are written exactly as shown.

## ADDED Requirements

### Requirement: The modal collects four guest details

`ModalForm` SHALL render exactly four fields, in this order: the guest's name labelled "Seu nome",
the guest's WhatsApp number labelled "Whatsapp" with the placeholder `83 9 xxxx-xxxx`, the guest's
e-mail labelled "E-mail", and the number of people labelled "Quantidade de convite". Every field
SHALL carry a visible label, and every label SHALL be associated with its own control. The guest
count field SHALL be pre-filled with the value `1`; the other three SHALL start empty. The fields,
their labels and their error messages SHALL be left-aligned.

#### Scenario: Guest opens the modal for the first time

- **WHEN** a guest activates `RsvpForm`'s confirmation button on a first visit
- **THEN** the modal shows the four labelled fields in the order name, WhatsApp, e-mail, guest count,
  with the name, WhatsApp and e-mail fields empty, the WhatsApp field showing the placeholder
  `83 9 xxxx-xxxx`, and the guest count field showing `1`

#### Scenario: Guest uses the keyboard to move through the form

- **WHEN** a guest tabs from the first field forward
- **THEN** focus moves through the four fields in the order they are displayed and then reaches the
  "Confirmar" button, and pressing Enter inside any field submits the form rather than doing nothing

### Requirement: Every field is validated in Portuguese before a confirmation is accepted

`ModalForm` SHALL validate the four fields against `rsvpSchema` before calling its `onConfirm`
handler. The name SHALL be required, trimmed, at least 2 and at most 60 characters. The e-mail SHALL
be required and a syntactically valid address. The guest count SHALL be a whole number between 1 and
10 inclusive. The WhatsApp number SHALL be required and match the masked mobile shape. Every
validation message a guest can reach SHALL be in Portuguese — no Zod default English message SHALL
be reachable, including the messages produced by a non-numeric or fractional guest count. Validation
messages SHALL appear when a field is blurred or when the form is submitted, and SHALL NOT appear on
the first keystroke into an untouched field.

#### Scenario: Guest submits an empty form

- **WHEN** a guest activates "Confirmar" without filling any field
- **THEN** the modal stays open, no confetti plays, nothing is written to browser storage, and every
  invalid field shows its own Portuguese message below its control

#### Scenario: Guest types a letter into the guest count field

- **WHEN** a guest types a non-numeric value into "Quantidade de convite" and submits
- **THEN** the message `{{copy: rsvp_error_guest_count_type}}` is shown in Portuguese, and no English
  Zod default text such as "expected number, received NaN" appears anywhere on screen

#### Scenario: Guest fixes a flagged field

- **WHEN** a field has already shown a validation message and the guest edits it into a valid value
- **THEN** that field's message disappears as the guest types, without needing a second submit

#### Scenario: Guest enters only whitespace as a name

- **WHEN** a guest fills "Seu nome" with spaces only and submits
- **THEN** the name is treated as empty, the required-name message "Informe seu nome" is shown, and
  the modal stays open

### Requirement: The WhatsApp number is formatted as the guest types

The WhatsApp field SHALL reformat its own value on every change, from the digits the guest has
entered, into the shape `83 9 8765-4321`. It SHALL discard every non-digit character, SHALL keep at
most 11 digits, and SHALL never display a trailing separator — neither a trailing space nor a
trailing hyphen — at any digit count. Deleting a digit SHALL remove any separator left orphaned by
that deletion in the same keystroke. The field's displayed value and its validated value SHALL
always be the same string. The mask SHALL be applied by the project's own code, with no masking
dependency added.

#### Scenario: Guest types a full number

- **WHEN** a guest types the eleven digits `83987654321` into the WhatsApp field
- **THEN** the field displays `83 9 8765-4321`

#### Scenario: Guest types a partial number

- **WHEN** a guest has typed only the first three digits `839`
- **THEN** the field displays `83 9` with no trailing space and no hyphen

#### Scenario: Guest backspaces across a separator

- **WHEN** a guest with `83 9 8765` in the field presses Backspace once
- **THEN** the field displays `83 9 876` immediately, without requiring a second Backspace to remove
  the now-orphaned space

#### Scenario: Guest pastes a formatted number

- **WHEN** a guest pastes `(83) 98765-4321` into the WhatsApp field
- **THEN** the field displays `83 9 8765-4321`, with the parentheses and the extra space discarded

#### Scenario: Guest keeps typing past eleven digits

- **WHEN** a guest attempts to enter more than eleven digits
- **THEN** the field keeps only the first eleven and the displayed value does not grow past
  `83 9 8765-4321`

### Requirement: The WhatsApp field accepts only a Brazilian mobile number

The WhatsApp field SHALL accept only a complete eleven-digit Brazilian mobile number — a two-digit
area code, the mobile ninth digit `9`, and eight subscriber digits — because the field exists so the
organizer can reach the guest on WhatsApp. A landline number SHALL be rejected. A partially typed
number SHALL be rejected. An empty field SHALL produce a required message
(`{{copy: rsvp_error_whatsapp_required}}`) distinct from the format message
(`{{copy: rsvp_error_whatsapp_format}}`), so a guest who left the field blank is not told their entry
is badly formatted.

#### Scenario: Guest enters a landline number

- **WHEN** a guest enters a ten-digit landline number and submits
- **THEN** the modal stays open and the WhatsApp field shows `{{copy: rsvp_error_whatsapp_format}}`

#### Scenario: Guest submits an incomplete number

- **WHEN** a guest submits with `83 9 8765` in the WhatsApp field
- **THEN** the modal stays open and the WhatsApp field shows `{{copy: rsvp_error_whatsapp_format}}`

#### Scenario: Guest leaves the WhatsApp field blank

- **WHEN** a guest submits with the WhatsApp field empty
- **THEN** the WhatsApp field shows `{{copy: rsvp_error_whatsapp_required}}` and not the format
  message

### Requirement: Guest count is a bounded stepper with no native spinner

"Quantidade de convite" SHALL be rendered as a decrement control, a typeable value, and an increment
control. No browser-native number spinner SHALL be displayed. The two controls SHALL each be at least
44×44 CSS pixels, SHALL carry the Portuguese accessible names "Diminuir quantidade" and "Aumentar
quantidade", and SHALL be excluded from the form's submission as controls. The decrement control
SHALL be disabled at the minimum of 1 and the increment control SHALL be disabled at the maximum of
10, and that maximum SHALL be the same value the schema rejects above. The field SHALL remain
directly typeable and SHALL raise the numeric keypad on a mobile device.

#### Scenario: Guest increments the guest count

- **WHEN** a guest activates the increment control with the value at `1`
- **THEN** the field shows `2`, and no page navigation or form submission occurs

#### Scenario: Guest reaches the ceiling

- **WHEN** the guest count reaches `10`
- **THEN** the increment control is disabled and the value does not go above `10`

#### Scenario: Guest is at the floor

- **WHEN** the guest count is `1`
- **THEN** the decrement control is disabled and the value does not go below `1`

#### Scenario: Guest types a value above the ceiling

- **WHEN** a guest types `50` directly into the field and submits
- **THEN** the modal stays open and the field shows `{{copy: rsvp_error_guest_count_max}}`

#### Scenario: Guest focuses the field on a phone

- **WHEN** a guest taps the guest count field on a mobile device
- **THEN** a numeric keypad is offered and no spinner arrows are rendered inside or beside the field

### Requirement: Fields are ruled lines, and focus and error are signalled without colour or a ring

Every field's input SHALL be drawn as a single thick bottom rule with square corners, an opaque
`bone-white` fill, and no border on its other three sides. No input SHALL render a focus ring, a
glow, a soft shadow, a rounded corner, or any colour outside `carved-black`, `bone-white` and
`sertao-brown`. Focus SHALL be shown by the rule and its label both darkening from `sertao-brown` to
`carved-black`, with the rule's thickness unchanged so no layout shifts. An errored field SHALL be
shown by a doubled rule — two stacked `carved-black` lines — together with an alert icon and its
message in `carved-black`; no error SHALL be signalled by a red or otherwise off-palette colour. The
form SHALL add no entrance, transition or motion of its own to fields, labels or error messages.

#### Scenario: Guest focuses a field

- **WHEN** a guest focuses any of the four fields
- **THEN** that field's rule and its label darken together, no ring or glow appears around the
  control, and no other field or control on the panel moves

#### Scenario: A field shows a validation error

- **WHEN** a field's validation message appears
- **THEN** the field's rule is drawn as two stacked lines, the message is preceded by an alert icon,
  and both the message and the rule use the page's ink colour rather than red

#### Scenario: An errored field is focused

- **WHEN** a guest focuses a field that is currently showing a validation message
- **THEN** the doubled rule stays as it is, the label darkens, and the message and its icon remain
  visible

### Requirement: Filled values survive the modal being closed and reopened

If a guest backs out of the modal without confirming, `ModalForm` SHALL retain every value the guest
had typed for the rest of the page session, so reopening the modal resumes where they left off. The
form SHALL NOT be reset on close. Backing out SHALL still write nothing to browser storage and SHALL
still leave `RsvpForm` in its default state.

#### Scenario: Guest backs out and reopens the modal

- **WHEN** a guest fills the name and WhatsApp fields, closes the modal without confirming, and then
  activates the confirmation button again in the same page session
- **THEN** the modal reopens with the name and WhatsApp values still present, and nothing was written
  to browser storage in between

#### Scenario: Guest reloads the page after backing out

- **WHEN** a guest fills fields, closes the modal without confirming, and reloads `/`
- **THEN** the section shows the confirmation button and the form is empty again, with the guest count
  back at `1`

### Requirement: The guest's name is remembered in the browser alongside the confirmation flag

On a successful confirmation, `RsvpForm` SHALL record the submitted name in the browser's
`localStorage` under the key `digital-invite:rsvp-name`, storing the name as a raw string with no
JSON wrapper, no object and no parse step on read. This key SHALL be written and read independently
of `digital-invite:rsvp-confirmed`: each has its own failure handling, and a failure of one SHALL NOT
prevent or undo the other. A stored value that is absent, empty, or whitespace-only SHALL be treated
as no name at all. The stored name SHALL NOT be re-validated against `rsvpSchema` on read. Like the
confirmation flag, this record is browser-local and device-local: it SHALL NOT be sent to any server
and SHALL NOT create any RSVP record.

#### Scenario: Guest confirms with a valid name

- **WHEN** a guest submits the form successfully with the name "Maria das Graças"
- **THEN** `digital-invite:rsvp-name` holds the raw string `Maria das Graças`, and
  `digital-invite:rsvp-confirmed` holds the exact string `true`

#### Scenario: The name write fails but the flag write succeeds

- **WHEN** writing `digital-invite:rsvp-name` throws while writing `digital-invite:rsvp-confirmed`
  succeeds
- **THEN** the confirmation still succeeds for the current session, the confetti plays, no error is
  shown to the guest, and the next visit still restores the success state

#### Scenario: A stored name is whitespace only

- **WHEN** `/` is loaded with `digital-invite:rsvp-confirmed` set to `true` and
  `digital-invite:rsvp-name` holding only spaces
- **THEN** the section treats the guest as having no stored name and renders the name-less feedback
  message, with no error shown

### Requirement: The feedback text greets the guest by first name

When a guest confirms during the current visit, the success state's feedback text SHALL address them
by the first name they submitted — the portion of the trimmed name before its first space — in the
form "Tá confirmado <primeiro nome>!". A single-word name SHALL be used unchanged. The in-session
message SHALL be built from the submitted data, not from browser storage, so it is correct even when
the storage write failed. On a later visit restored from storage, the same message SHALL be built
from the stored name. No literal `{user_name}` token SHALL appear anywhere on screen or in the
codebase.

#### Scenario: Guest confirms with a multi-part name

- **WHEN** a guest submits the form successfully with the name "Maria das Graças Figueredo"
- **THEN** the section's feedback text reads "Tá confirmado Maria!"

#### Scenario: Guest confirms with a single-word name

- **WHEN** a guest submits the form successfully with the name "Muricarliton"
- **THEN** the section's feedback text reads "Tá confirmado Muricarliton!"

#### Scenario: Returning guest with a stored name

- **WHEN** a guest who confirmed as "João Pedro" reloads `/` in the same browser
- **THEN** the section shows "Tá confirmado João!" from first paint, with no confirmation button
  rendered at any point during the load

#### Scenario: Storage write failed during the confirmation

- **WHEN** a guest confirms in a browser where writing to `localStorage` throws
- **THEN** the feedback text still greets them by their first name for the current session

### Requirement: A confirmed guest with no stored name sees a name-less feedback message

When the section restores the success state from browser storage and no usable name is available —
including every guest who confirmed before this change shipped — it SHALL render
`{{copy: rsvp_feedback_fallback}}`, a complete celebratory sentence containing no name, instead of
the named message. It SHALL NOT render the named message with an empty gap where the name would be,
and SHALL NOT fall back to the confirmation button.

#### Scenario: Guest confirmed under the previously shipped build

- **WHEN** a guest whose browser holds `digital-invite:rsvp-confirmed` as `true` and no
  `digital-invite:rsvp-name` loads `/`
- **THEN** the section shows `{{copy: rsvp_feedback_fallback}}` from first paint, with no confirmation
  button, no empty name gap, and no stray punctuation from a missing name

#### Scenario: Reading the name throws

- **WHEN** reading `digital-invite:rsvp-name` throws while reading the confirmation flag succeeds
- **THEN** the section renders the name-less feedback message and no error reaches the guest

## MODIFIED Requirements

### Requirement: Modal's content is fixed and identical for every guest

`ModalForm` SHALL display a fixed title reading "Convidado", a fixed introductory line
`{{copy: rsvp_modal_intro}}`, the four fields described above, and a "Confirmar" button as the only
control in its footer. It SHALL also display one visible corner close control. None of this content
SHALL vary per guest, per link, or per query parameter: the fields, their labels, their placeholders
and their default values are the same for everyone, and no content is substituted from a URL, a
query parameter or any guest-identifying state.

#### Scenario: Two different guests open the modal

- **WHEN** two different guests each activate the confirmation button
- **THEN** both see the identical title "Convidado", the identical introductory line, the identical
  four labelled fields with the same placeholders and the same guest count default of `1`, the same
  "Confirmar" button, and the same corner close control, with no substitution or per-guest variation

#### Scenario: The modal is opened with a query string present

- **WHEN** a guest opens `/` with any query parameters and activates the confirmation button
- **THEN** the modal's content is unchanged by those parameters and no field is pre-filled from them

### Requirement: Guest can back out of the modal without confirming

A guest SHALL be able to close the modal without confirming, through three affordances: a visible
corner close control inside the modal panel, the Escape key, and a click or tap on the overlay
outside the panel. The corner close control SHALL be at least 44×44 CSS pixels, SHALL carry the
Portuguese accessible name "Fechar", and SHALL use only the project's three palette colours — no
off-palette hover colour. Its icon SHALL be hidden from assistive technology. Backing out by any of
the three affordances SHALL leave `RsvpForm` in its default state showing the confirmation button,
and SHALL write nothing to browser storage.

#### Scenario: Guest activates the corner close control

- **WHEN** a guest activates the modal's corner close control
- **THEN** the modal closes, `RsvpForm` still shows its confirmation button, no confetti or feedback
  text appears, and nothing is written to browser storage

#### Scenario: Screen reader reaches the corner close control

- **WHEN** a screen reader user reaches the modal's corner close control
- **THEN** it is announced as a button named "Fechar", and its icon is not announced separately

#### Scenario: Guest presses Escape with the modal open

- **WHEN** a guest presses the Escape key while `ModalForm` is open
- **THEN** the modal closes, `RsvpForm` still shows its confirmation button, no confetti or feedback
  text appears, and nothing is written to browser storage

#### Scenario: Guest taps outside the modal panel

- **WHEN** a guest clicks or taps the overlay outside `ModalForm`'s panel
- **THEN** the modal closes, `RsvpForm` still shows its confirmation button, no confetti or feedback
  text appears, and nothing is written to browser storage

### Requirement: Confirmar closes the modal and plays a confetti and feedback success state on the page

Activating `ModalForm`'s "Confirmar" button SHALL submit the form. When every field is valid, it
SHALL close the modal and SHALL replace `RsvpForm`'s confirmation button, within that same page
section, with a success state displaying a confetti animation and the feedback text
"Tá confirmado <primeiro nome>!" built from the submitted name. When any field is invalid, it SHALL
NOT close the modal, SHALL NOT play the confetti, SHALL NOT show the feedback text, and SHALL NOT
write anything to browser storage. The success state SHALL NOT be rendered as an overlay covering the
invite page, and activating "Confirmar" SHALL NOT navigate away from `/` or scroll the page.

#### Scenario: Guest activates Confirmar with every field valid

- **WHEN** a guest fills all four fields validly and activates "Confirmar" inside `ModalForm`
- **THEN** the modal closes, and the invite page's third section shows the confetti animation and the
  feedback text greeting the guest by first name, where the confirmation button was

#### Scenario: Guest activates Confirmar with an invalid field

- **WHEN** a guest activates "Confirmar" while any field is invalid
- **THEN** the modal stays open with the invalid fields flagged, the page section behind it still
  shows the confirmation button, no confetti plays, and nothing is written to browser storage

### Requirement: The success state persists and replaces the confirmation button

Once the success state is shown, its feedback text — named or name-less — SHALL remain visible for
the rest of the page session, the confetti animation SHALL play once and SHALL NOT loop or replay,
and `RsvpForm`'s confirmation button SHALL NOT be shown again in that session. The section SHALL
offer no undo and no way to edit a submitted answer: there is no control that returns it to the
confirmation button or reopens the form.

#### Scenario: Guest waits for the confetti to finish

- **WHEN** the confetti animation finishes playing
- **THEN** the feedback text is still visible, the animation does not restart, and no confirmation
  button, no undo control and no "edit my answer" control is offered

### Requirement: Confirmation is remembered in the guest's browser across visits

On a successful confirmation, `RsvpForm` SHALL record the confirmed state in the browser's
`localStorage` under the key `digital-invite:rsvp-confirmed`, storing the exact string `true` and
nothing else, and SHALL record the submitted name under `digital-invite:rsvp-name` as a raw string.
On every later load of `/` in that same browser, the section SHALL render the feedback text instead
of the confirmation button, and SHALL do so from the section's first paint — a guest SHALL NOT see
the confirmation button appear and then be replaced.

Any value under `digital-invite:rsvp-confirmed` other than the exact string `true` — absent, empty,
or unrecognized — SHALL be treated as not confirmed, whatever `digital-invite:rsvp-name` holds. Both
records are browser-local and device-local only: they SHALL NOT be sent to any server and SHALL NOT
create any RSVP record.

#### Scenario: Guest reloads the invite page after confirming

- **WHEN** a guest reloads `/` in the same browser after having confirmed
- **THEN** the third section shows the feedback text immediately, greeting them by first name, with
  no confirmation button rendered at any point during the load

#### Scenario: Guest opens the invite on a different device

- **WHEN** a guest who confirmed on one device opens `/` on a different device or browser
- **THEN** the third section shows the confirmation button again and the form is empty, because
  neither record exists anywhere but that first browser

#### Scenario: Stored flag is unrecognized but a name is present

- **WHEN** `/` is loaded with a value under `digital-invite:rsvp-confirmed` that is not the exact
  string `true`, while `digital-invite:rsvp-name` holds a name
- **THEN** the third section shows the confirmation button, exactly as it does for a first-time guest,
  and the stored name is never rendered

### Requirement: Storage failures never break the section

Reading from or writing to `localStorage` SHALL NOT be able to break the invite page. Each of the two
keys SHALL be read and written through its own guarded helper, so a failure on one is contained and
does not prevent the other. If a read of the flag fails or throws — storage disabled, a
private-browsing or embedded-webview context that denies access — the section SHALL render its
default state with the confirmation button. If a read of the name fails or throws, the section SHALL
render the name-less feedback message. If a write fails or throws, the confirmation SHALL still
succeed for the current session: the modal closes, the confetti plays, and the feedback text appears
greeting the guest by first name, with the only consequence being that the next visit may show the
confirmation button again or the name-less message. No storage failure SHALL surface an error to the
guest or interrupt rendering.

#### Scenario: Storage access is denied when the page loads

- **WHEN** a guest loads `/` in a browser where `localStorage` access throws on read
- **THEN** the third section renders normally with its confirmation button, and no error is shown or
  thrown to the guest

#### Scenario: Storage access is denied when the guest confirms

- **WHEN** a guest submits a valid form in a browser where `localStorage` access throws on write
- **THEN** the modal closes, the confetti plays and the feedback text appears greeting them by first
  name exactly as normal, no error is shown to the guest, and a later reload shows the confirmation
  button again

### Requirement: No real RSVP submission occurs

This capability SHALL collect and validate the guest's name, WhatsApp number, e-mail and guest count,
and SHALL do nothing else with them: it SHALL NOT perform any Supabase insert, SHALL NOT introduce a
submission hook or any network request, SHALL NOT show a pending or network-error state on the submit
button, SHALL NOT add a column to the admin dashboard, and SHALL NOT enforce any RSVP deadline.
"Confirmar" is wired only to validation, to the confetti/feedback success state, and to the two
browser-local records described above; those records are not an RSVP record.

#### Scenario: Confirming does not create a record

- **WHEN** a guest submits the form successfully, any number of times, in any session
- **THEN** no network request is made to Supabase as a result, and no RSVP record is created or
  modified

#### Scenario: The form is submitted close to the event date

- **WHEN** a guest submits a valid form on any date, including after 26/09/2026
- **THEN** the confirmation is accepted exactly as it is on any other date, with no deadline message
  and no disabled control

## REMOVED Requirements

### Requirement: The `{user_name}` token is rendered literally

**Reason**: Superseded by "The feedback text greets the guest by first name" above. The token was a
staged placeholder written when nothing collected a name; this change collects one, persists it under
`digital-invite:rsvp-name`, and interpolates the guest's first name. The clause lived inside
"Confirmar closes the modal and plays a confetti and feedback success state on the page", which is
restated in full under MODIFIED Requirements without it.

**Migration**: None for guests — a returning guest who confirmed under the previous build has no
stored name and is covered by "A confirmed guest with no stored name sees a name-less feedback
message". For the artifacts: `add-rsvp-confirmation-section`'s tasks.md task 4.4, which verifies the
token renders verbatim, is superseded and must not be re-verified as written.

### Requirement: The modal contains no form field

**Reason**: Superseded by "The modal collects four guest details" above. The prohibition was the
defining scope boundary of `add-rsvp-confirmation-section`, which shipped the modal's shell with the
body "Em breve!" while the form was deferred. This change is that form. The clause lived inside
"Modal's content is fixed and identical for every guest", which is restated in full under MODIFIED
Requirements without it.

**Migration**: None. The body string "Em breve!" is replaced by `{{copy: rsvp_modal_intro}}` and the
four fields; nothing depended on the absence of fields.
