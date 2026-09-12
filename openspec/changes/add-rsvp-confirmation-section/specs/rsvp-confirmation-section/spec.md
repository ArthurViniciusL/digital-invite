## Purpose

Defines the observable content and behavior of the public invite page's third section: the block
that lets a guest start confirming attendance. This capability covers only the section's shell — a
confirmation button, a modal, a placeholder confirm action that closes the modal and plays a
confetti and feedback success state on the page, and a browser-local memory of having confirmed so a
returning guest is not asked again. The real RSVP form (name, email, guest count, validation, and the
Supabase insert) is explicitly out of scope and is added by a later capability.

## ADDED Requirements

### Requirement: Confirmation button opens a modal

`RsvpForm` SHALL display one button that, when activated, opens a modal (`ModalForm`). The button
SHALL NOT submit any data or navigate away from `/` — its only effect is opening the modal.

#### Scenario: Guest activates the confirmation button

- **WHEN** a guest activates `RsvpForm`'s confirmation button
- **THEN** `ModalForm` opens, displaying its default content, and the invite page underneath remains
  unchanged

### Requirement: Modal's content is fixed and identical for every guest

`ModalForm` SHALL display a fixed title reading "Cadastro do convidado", fixed body content reading
"Em breve!", and a "Confirmar" button as the only control in its footer. It SHALL NOT display any
visible dismissal control — no footer dismissal button and no corner close control. None of this
content SHALL vary per guest, per link, or per query parameter, and the modal SHALL contain no form
field in this capability.

#### Scenario: Two different guests open the modal

- **WHEN** two different guests each activate the confirmation button
- **THEN** both see the identical title, body and "Confirmar" button, with no dismissal control
  rendered and no substitution or per-guest variation

### Requirement: Guest can back out of the modal without confirming

Although the modal exposes no visible dismissal control, a guest SHALL still be able to close it
without confirming, through the dialog's standard affordances: pressing the Escape key, or
clicking/tapping the overlay outside the modal panel. Backing out by either affordance SHALL leave
`RsvpForm` in its default state and SHALL write nothing to browser storage.

#### Scenario: Guest presses Escape with the modal open

- **WHEN** a guest presses the Escape key while `ModalForm` is open
- **THEN** the modal closes, `RsvpForm` still shows its confirmation button, no confetti or feedback
  text appears, and nothing is written to browser storage

#### Scenario: Guest taps outside the modal panel

- **WHEN** a guest clicks or taps the overlay outside `ModalForm`'s panel
- **THEN** the modal closes, `RsvpForm` still shows its confirmation button, no confetti or feedback
  text appears, and nothing is written to browser storage

### Requirement: Confirmar closes the modal and plays a confetti and feedback success state on the page

Activating `ModalForm`'s "Confirmar" button SHALL close the modal and SHALL replace `RsvpForm`'s
confirmation button, within that same page section, with a success state displaying a confetti
animation and the fixed feedback text "Tá confirmado {user_name}!". That text SHALL be rendered
literally, including the `{user_name}` token, which is a staged placeholder awaiting the real RSVP
form that will collect a guest's name — it is not interpolated in this capability and is not a
defect. The success state SHALL NOT be rendered as an overlay covering the invite page, and
activating "Confirmar" SHALL NOT navigate away from `/` or scroll the page.

#### Scenario: Guest activates Confirmar

- **WHEN** a guest activates "Confirmar" inside `ModalForm`
- **THEN** the modal closes, and the invite page's third section shows the confetti animation and the
  fixed feedback text "Tá confirmado {user_name}!" — with the `{user_name}` token visible verbatim —
  where the confirmation button was

### Requirement: The success state persists and replaces the confirmation button

Once the success state is shown, the feedback text "Tá confirmado {user_name}!" SHALL remain visible
for the rest of the page session, the confetti animation SHALL play once and SHALL NOT loop or
replay, and `RsvpForm`'s confirmation button SHALL NOT be shown again in that session. The section
SHALL offer no undo: there is no control that returns it to the confirmation button.

#### Scenario: Guest waits for the confetti to finish

- **WHEN** the confetti animation finishes playing
- **THEN** the feedback text is still visible, the animation does not restart, and no confirmation
  button and no undo control is offered

### Requirement: Confirmation is remembered in the guest's browser across visits

On a successful confirmation, `RsvpForm` SHALL record the confirmed state in the browser's
`localStorage` under the key `digital-invite:rsvp-confirmed`, storing the exact string `true` and
nothing else. On every later load of `/` in that same browser, the section SHALL render the feedback
text instead of the confirmation button, and SHALL do so from the section's first paint — a guest
SHALL NOT see the confirmation button appear and then be replaced.

Any value under that key other than the exact string `true` — absent, empty, or unrecognized — SHALL
be treated as not confirmed. This record is browser-local and device-local only: it SHALL NOT be sent
to any server and SHALL NOT create any RSVP record.

#### Scenario: Guest reloads the invite page after confirming

- **WHEN** a guest reloads `/` in the same browser after having confirmed
- **THEN** the third section shows the feedback text "Tá confirmado {user_name}!" immediately, with
  no confirmation button rendered at any point during the load

#### Scenario: Guest opens the invite on a different device

- **WHEN** a guest who confirmed on one device opens `/` on a different device or browser
- **THEN** the third section shows the confirmation button again, because the confirmation was never
  recorded anywhere but that first browser

#### Scenario: Stored value is unrecognized

- **WHEN** `/` is loaded with a value under `digital-invite:rsvp-confirmed` that is not the exact
  string `true`
- **THEN** the third section shows the confirmation button, exactly as it does for a first-time guest

### Requirement: Storage failures never break the section

Reading from or writing to `localStorage` SHALL NOT be able to break the invite page. If a read fails
or throws — storage disabled, a private-browsing or embedded-webview context that denies access —
the section SHALL render its default state with the confirmation button. If a write fails or throws,
the confirmation SHALL still succeed for the current session: the modal closes, the confetti plays,
and the feedback text appears, with the only consequence being that the next visit shows the
confirmation button again. No storage failure SHALL surface an error to the guest or interrupt
rendering.

#### Scenario: Storage access is denied when the page loads

- **WHEN** a guest loads `/` in a browser where `localStorage` access throws on read
- **THEN** the third section renders normally with its confirmation button, and no error is shown or
  thrown to the guest

#### Scenario: Storage access is denied when the guest confirms

- **WHEN** a guest activates "Confirmar" in a browser where `localStorage` access throws on write
- **THEN** the modal closes, the confetti plays and the feedback text appears exactly as normal, no
  error is shown to the guest, and a later reload shows the confirmation button again

### Requirement: Confetti plays only on a fresh confirmation

The confetti animation celebrates the act of confirming, so it SHALL be played only when the guest
activates "Confirmar" during the current visit. When the success state is restored from the browser's
stored confirmation, the section SHALL render the feedback text only, and the confetti animation
SHALL NOT be mounted, loaded, or played at all.

#### Scenario: Guest confirms during this visit

- **WHEN** a guest activates "Confirmar" on `/`
- **THEN** the confetti animation plays once alongside the feedback text

#### Scenario: Returning guest sees the restored success state

- **WHEN** a guest who already confirmed loads `/` again in the same browser
- **THEN** only the feedback text is rendered, with no confetti animation playing and no confetti
  animation present in the section at all

### Requirement: Confetti animation respects reduced motion

`RsvpForm` SHALL NOT autoplay the confetti animation for a guest with `prefers-reduced-motion:
reduce` enabled. The fixed feedback text SHALL still appear for that guest, unaffected by the motion
preference, and the section SHALL NOT shift the page's layout when the success state replaces the
confirmation button — in either motion mode, and whether the success state is reached by confirming
or restored from storage on load.

#### Scenario: Guest with reduced motion confirms

- **WHEN** a guest with `prefers-reduced-motion: reduce` enabled activates "Confirmar"
- **THEN** the modal closes, the feedback text "Tá confirmado {user_name}!" appears in the section
  with no animated transition and no confetti, and the surrounding page content does not move

#### Scenario: Guest with default motion settings confirms

- **WHEN** a guest with no reduced-motion preference activates "Confirmar"
- **THEN** the confetti animation plays once (not looping) in the section behind the feedback text,
  and the surrounding page content does not move

### Requirement: No real RSVP submission occurs

This capability SHALL NOT perform any Supabase insert, SHALL NOT read or write `rsvpSchema`, and
SHALL NOT collect a guest's name, email, or guest count. "Confirmar" is a placeholder action wired
only to the confetti/feedback success state and to the browser-local confirmation flag described
above; that flag is not an RSVP record.

#### Scenario: Confirming does not create a record

- **WHEN** a guest activates "Confirmar" any number of times, in any session
- **THEN** no network request is made to Supabase as a result, and no RSVP record is created or
  modified

### Requirement: `RsvpForm` composes into the invite page

`InvitePage` SHALL render `RsvpForm` as its third section, after `InviteHero` and `EventDetails`.

#### Scenario: Guest scrolls past the event details section

- **WHEN** a guest scrolls past `EventDetails` on `/`
- **THEN** `RsvpForm`'s section is the next section they reach, showing either the confirmation
  button or the restored feedback text
