## Purpose

Defines the observable content and behavior of the public invite page's third section: the block that
lets a guest confirm attendance. This delta adds a second step inside the same modal — after a valid
submit, the modal swaps from the guest form to a "Calendário" step offering a Google Calendar
reminder — and moves the page-level confirmation side effects from the submit to the modal's close.

Persisting an RSVP remains out of scope: a confirmation is still the two browser-local keys plus the
confetti and feedback success state. No Supabase insert, no `.ics` file, no calendar provider other
than Google, and no memory of whether the guest already added the event are part of this capability.

Every requirement of `rsvp-confirmation-section` not restated below — the four fields and their
validation, the WhatsApp mask, the ruled-line form vocabulary, the stepper, the storage keys' shape
and failure contract, the first-name feedback text, the name-less fallback, and `RsvpForm`'s
composition into `InvitePage` — is unchanged by this change.

Strings written as `{{copy: …}}` below are placeholders rendered verbatim until the copy writer
replaces them. Strings written in quotes are fixed and are written exactly as shown.

## ADDED Requirements

### Requirement: A valid submit advances the modal to a calendar step instead of confirming

When every field is valid, activating "Confirmar" SHALL replace the modal's form content with a
calendar step **inside the same dialog**. It SHALL NOT open a second modal, SHALL NOT render the step
as an additional block below the form, SHALL NOT navigate away from `/`, and SHALL NOT close the
modal. At the moment of the swap the confirmation SHALL NOT yet have taken effect: no confetti SHALL
play, no feedback text SHALL appear on the page, and nothing SHALL be written to browser storage.
When any field is invalid, the modal SHALL stay on the form step exactly as it does today.

#### Scenario: Guest submits a valid form

- **WHEN** a guest fills all four fields validly and activates "Confirmar"
- **THEN** the same modal stays open, its content changes to the calendar step, no second dialog
  appears, and the invite page behind it still shows its confirmation button with no confetti playing

#### Scenario: Nothing is persisted at the moment of the swap

- **WHEN** the modal has just swapped to the calendar step and the guest has not yet answered
- **THEN** neither `digital-invite:rsvp-confirmed` nor `digital-invite:rsvp-name` has been written

#### Scenario: Guest submits an invalid form

- **WHEN** a guest activates "Confirmar" while any field is invalid
- **THEN** the modal stays on the form step with the invalid fields flagged, and the calendar step is
  not shown

### Requirement: The calendar step's content is fixed

The calendar step SHALL display the title "Calendário", the message
"Adicionar lembrete no calendário google?", and exactly two answer controls labelled "SIM" and "NÃO",
in that order. It SHALL display no form field and no other control besides those two and the modal's
existing corner close control. Its content SHALL NOT vary per guest, per link or per query parameter,
and SHALL NOT be substituted from anything the guest submitted.

#### Scenario: Guest reaches the calendar step

- **WHEN** the modal swaps to the calendar step
- **THEN** it shows the title "Calendário", the message "Adicionar lembrete no calendário google?",
  a "SIM" control, a "NÃO" control, and the corner close control, and nothing else

#### Scenario: Two different guests reach the calendar step

- **WHEN** two different guests each submit a valid form
- **THEN** both see identical title, message and controls, with no reference to the name, WhatsApp
  number, e-mail or guest count either of them submitted

### Requirement: The two answers are equal weight and meet the tap-target floor

"SIM" and "NÃO" SHALL be rendered with the same visual weight: the same button treatment, the same
size, and the same carved silhouette, side by side on one row. Neither SHALL be styled as a primary
action and neither SHALL be visually de-emphasised — no reduced opacity, no lighter border, no
smaller size, no off-palette colour. Each SHALL be at least 44×44 CSS pixels. Neither SHALL submit a
form or navigate the current tab.

#### Scenario: Guest compares the two answers

- **WHEN** a guest looks at the calendar step
- **THEN** "SIM" and "NÃO" are the same height, the same style and the same shape, with neither drawn
  as the recommended choice

#### Scenario: Guest views the step on a 320px-wide phone

- **WHEN** the calendar step is shown at a 320px viewport width
- **THEN** both controls fit side by side on one row, neither label wraps, and each control is at
  least 44×44 CSS pixels

### Requirement: SIM opens a Google Calendar template in a new tab and then closes the modal

Activating "SIM" SHALL open a Google Calendar event template in a **new** browsing context, opened
without granting it a reference back to the invite page, and SHALL then close the modal. It SHALL NOT
navigate the current tab away from `/`. The modal SHALL close whether or not the new tab actually
opened: a blocked popup SHALL NOT show an error, SHALL NOT leave the modal open, and SHALL NOT prevent
the confirmation from taking effect.

#### Scenario: Guest chooses SIM

- **WHEN** a guest activates "SIM" on the calendar step
- **THEN** a Google Calendar event template opens in a new tab, the invite page remains loaded at `/`
  in the original tab, and the modal closes

#### Scenario: The new tab is blocked

- **WHEN** a guest activates "SIM" in a browser or in-app webview that blocks the new tab
- **THEN** the modal still closes, no error is shown, and the confirmation still takes effect

### Requirement: The calendar template carries the event's real details

The Google Calendar template SHALL carry the event title "Aniversário do Muri", a start of 27/09/2026
at 11:30 and an end of 27/09/2026 at 20:00 expressed in the `America/Sao_Paulo` time zone, the
location "Alto da Serra Recepções, Cuité", and the description "Venha celebrar com a gente". The times
SHALL be interpreted in the event's own time zone, so a guest whose device is set to a different time
zone SHALL still see the event at 11:30 local-to-the-party. Every accented character in the title,
location and description SHALL survive into the created event unmangled.

#### Scenario: Guest lands on the Google Calendar template

- **WHEN** the new tab finishes loading
- **THEN** the event form is pre-filled with the title "Aniversário do Muri", the date 27/09/2026 from
  11:30 to 20:00, the location "Alto da Serra Recepções, Cuité" and the description
  "Venha celebrar com a gente", with every accented character rendered correctly

#### Scenario: Guest's device is in a different time zone

- **WHEN** a guest whose device time zone is not `America/Sao_Paulo` activates "SIM"
- **THEN** the created event still represents 11:30 on 27/09/2026 in `America/Sao_Paulo`, not 11:30 in
  the device's own time zone

### Requirement: Every exit from the calendar step counts as a confirmation

On the calendar step, "NÃO", the corner close control, the Escape key and a click or tap on the
overlay SHALL all behave identically: the modal closes and the RSVP takes effect. Each SHALL cause
exactly one confirmation — the two browser-local records SHALL be written, the confetti SHALL play
once, and the feedback text SHALL replace the confirmation button — and none SHALL discard the data
the guest already submitted or return them to the form. No exit SHALL confirm more than once.

#### Scenario: Guest chooses NÃO

- **WHEN** a guest activates "NÃO" on the calendar step
- **THEN** no new tab opens, the modal closes, and the invite page's third section shows the confetti
  and the feedback text greeting the guest by first name

#### Scenario: Guest closes the calendar step with the corner control

- **WHEN** a guest activates the corner close control while the calendar step is showing
- **THEN** the modal closes, no new tab opens, and the confirmation takes effect exactly as "NÃO"
  would have caused it to

#### Scenario: Guest presses Escape on the calendar step

- **WHEN** a guest presses Escape while the calendar step is showing
- **THEN** the modal closes and the confirmation takes effect

#### Scenario: Guest taps the overlay on the calendar step

- **WHEN** a guest taps the overlay outside the panel while the calendar step is showing
- **THEN** the modal closes and the confirmation takes effect

#### Scenario: Guest chooses SIM

- **WHEN** a guest activates "SIM"
- **THEN** the confirmation takes effect once, in the same way it does for "NÃO", in addition to the
  new tab opening

### Requirement: The confirmation side effects fire when the modal closes, not when the form is submitted

The browser-storage writes, the confetti and the feedback success state SHALL all be triggered by the
modal closing after the calendar step, and SHALL NOT be triggered by the submit that opened that step.
The section SHALL NOT show the success state while the modal is still open. The submitted data used
for those side effects SHALL be the validated payload from the submit that opened the calendar step.

#### Scenario: Guest lingers on the calendar step

- **WHEN** a guest reaches the calendar step and does not answer for a while
- **THEN** the modal stays open on the calendar step, the page behind it still shows the confirmation
  button, no confetti plays, and nothing is written to browser storage

#### Scenario: Guest answers the calendar step

- **WHEN** the guest then answers with either "SIM" or "NÃO"
- **THEN** the modal closes and, in that same moment, the two records are written, the confetti plays
  once and the feedback text greets the guest by the first name they submitted

#### Scenario: Storage is unavailable when the guest answers

- **WHEN** a guest answers the calendar step in a browser where `localStorage` throws on write
- **THEN** the modal still closes, the confetti still plays, the feedback text still greets them by
  first name, and no error reaches the guest

### Requirement: The dialog's title and focus follow the step

The dialog SHALL expose exactly one title at a time, and that title SHALL read "Convidado" on the form
step and "Calendário" on the calendar step, so the dialog's accessible name always describes what it
is showing. When the content swaps, keyboard focus SHALL move into the new content rather than being
lost — the control that had focus is removed by the swap, and focus SHALL NOT fall back to the page
body. After the swap, the keyboard reading and tab order SHALL be the title, the message, "SIM", "NÃO"
and the corner close control.

#### Scenario: Screen reader user submits the form

- **WHEN** a screen reader user activates "Confirmar" with a valid form
- **THEN** focus lands on the dialog's title, "Calendário" is announced, and tabbing from there reaches
  "SIM", then "NÃO", then the corner close control

#### Scenario: Keyboard user after the swap

- **WHEN** a keyboard user presses Tab immediately after the calendar step appears
- **THEN** focus moves to a control inside the dialog and not to the page behind the overlay

#### Scenario: The dialog is named for its current step

- **WHEN** assistive technology reports the dialog's name on the calendar step
- **THEN** it reports "Calendário" and not "Convidado"

### Requirement: The step swap animates briefly and respects reduced motion

The incoming calendar step SHALL appear with a single short entrance of no more than a quarter of a
second — a fade with a small upward travel, matching the page's existing reveal vocabulary. The
outgoing form step SHALL NOT be animated out, and the two steps SHALL NOT be visible at the same time.
No other motion SHALL be added: no cross-fade, no animated panel height, no per-element stagger. When
the guest's system requests reduced motion, the calendar step SHALL appear at its final position with
no transition at all.

#### Scenario: Guest with default motion settings submits the form

- **WHEN** a guest activates "Confirmar" with a valid form
- **THEN** the calendar step fades in over a fraction of a second, and at no point are the form fields
  and the calendar controls both visible

#### Scenario: Guest prefers reduced motion

- **WHEN** a guest with `prefers-reduced-motion: reduce` activates "Confirmar" with a valid form
- **THEN** the calendar step appears immediately with no fade and no movement, and the existing
  confetti gating on the page is unchanged

## MODIFIED Requirements

### Requirement: Modal's content is fixed and identical for every guest

`ModalForm` SHALL present its content in two steps inside a single dialog. On the form step it SHALL
display the title "Convidado", a fixed introductory line `{{copy: rsvp_modal_intro}}`, the four fields
described in this capability, and a "Confirmar" button as the only control in its footer. On the
calendar step it SHALL display the title "Calendário", the message
"Adicionar lembrete no calendário google?" and the two controls "SIM" and "NÃO". Both steps SHALL also
display one visible corner close control. None of this content SHALL vary per guest, per link, or per
query parameter: the fields, their labels, their placeholders, their default values and both steps'
fixed strings are the same for everyone, and no content is substituted from a URL, a query parameter
or any guest-identifying state.

#### Scenario: Two different guests open the modal

- **WHEN** two different guests each activate the confirmation button
- **THEN** both see the identical title "Convidado", the identical introductory line, the identical
  four labelled fields with the same placeholders and the same guest count default of `1`, the same
  "Confirmar" button, and the same corner close control, with no substitution or per-guest variation

#### Scenario: Two different guests reach the second step

- **WHEN** two different guests each submit a valid form
- **THEN** both see the identical title "Calendário", the identical message and the identical "SIM"
  and "NÃO" controls

#### Scenario: The modal is opened with a query string present

- **WHEN** a guest opens `/` with any query parameters and activates the confirmation button
- **THEN** the modal's content is unchanged by those parameters and no field is pre-filled from them

### Requirement: Guest can back out of the modal without confirming

A guest SHALL be able to close the modal without confirming **while the form step is showing**,
through three affordances: a visible corner close control inside the modal panel, the Escape key, and
a click or tap on the overlay outside the panel. The corner close control SHALL be at least 44×44 CSS
pixels, SHALL carry the Portuguese accessible name "Fechar", and SHALL use only the project's three
palette colours — no off-palette hover colour. Its icon SHALL be hidden from assistive technology.
Backing out from the form step by any of the three affordances SHALL leave `RsvpForm` in its default
state showing the confirmation button, and SHALL write nothing to browser storage. Once the guest has
submitted a valid form and the calendar step is showing, these same three affordances SHALL instead
confirm and close, as described in "Every exit from the calendar step counts as a confirmation" — the
RSVP the guest already submitted SHALL NOT be discardable by dismissing the modal.

#### Scenario: Guest activates the corner close control on the form step

- **WHEN** a guest activates the modal's corner close control while the form step is showing
- **THEN** the modal closes, `RsvpForm` still shows its confirmation button, no confetti or feedback
  text appears, and nothing is written to browser storage

#### Scenario: Screen reader reaches the corner close control

- **WHEN** a screen reader user reaches the modal's corner close control
- **THEN** it is announced as a button named "Fechar", and its icon is not announced separately

#### Scenario: Guest presses Escape on the form step

- **WHEN** a guest presses the Escape key while `ModalForm` is showing the form step
- **THEN** the modal closes, `RsvpForm` still shows its confirmation button, no confetti or feedback
  text appears, and nothing is written to browser storage

#### Scenario: Guest taps outside the modal panel on the form step

- **WHEN** a guest clicks or taps the overlay outside `ModalForm`'s panel while the form step is
  showing
- **THEN** the modal closes, `RsvpForm` still shows its confirmation button, no confetti or feedback
  text appears, and nothing is written to browser storage

#### Scenario: Guest dismisses the modal on the calendar step

- **WHEN** a guest dismisses the modal by any of the three affordances while the calendar step is
  showing
- **THEN** the modal closes and the RSVP is confirmed, rather than being discarded

### Requirement: Confirmar closes the modal and plays a confetti and feedback success state on the page

Activating `ModalForm`'s "Confirmar" button SHALL submit the form. When every field is valid, it SHALL
advance the modal to the calendar step and SHALL NOT close the modal. The modal SHALL close, and
`RsvpForm`'s confirmation button SHALL be replaced within that same page section by a success state
displaying a confetti animation and the feedback text "Tá confirmado <primeiro nome>!" built from the
submitted name, when the guest answers the calendar step by any of its exits. When any field is
invalid, activating "Confirmar" SHALL NOT advance to the calendar step, SHALL NOT close the modal,
SHALL NOT play the confetti, SHALL NOT show the feedback text, and SHALL NOT write anything to browser
storage. The success state SHALL NOT be rendered as an overlay covering the invite page, and neither
"Confirmar" nor either calendar answer SHALL navigate the current tab away from `/` or scroll the
page.

#### Scenario: Guest activates Confirmar with every field valid

- **WHEN** a guest fills all four fields validly and activates "Confirmar" inside `ModalForm`
- **THEN** the modal stays open and shows the calendar step, and the invite page's third section still
  shows its confirmation button with no confetti and no feedback text

#### Scenario: Guest completes the calendar step

- **WHEN** the guest then answers the calendar step by any of its exits
- **THEN** the modal closes and the invite page's third section shows the confetti animation and the
  feedback text greeting the guest by first name, where the confirmation button was

#### Scenario: Guest activates Confirmar with an invalid field

- **WHEN** a guest activates "Confirmar" while any field is invalid
- **THEN** the modal stays on the form step with the invalid fields flagged, the page section behind it
  still shows the confirmation button, no confetti plays, and nothing is written to browser storage
