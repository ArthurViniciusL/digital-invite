## Purpose

Defines the observable content and behavior of the public invite page's second section: the block
that tells every guest when the event happens, where it happens, and how to get there, immediately
following the hero.

## ADDED Requirements

### Requirement: Static section heading

`EventDetails` SHALL display a short heading, rendered as an `<h2>`, introducing the event facts
below it. The heading is identical for every visitor and carries no per-guest data.

#### Scenario: Guest scrolls past the hero

- **WHEN** any guest scrolls to the second section of `/`
- **THEN** the section displays the same heading, regardless of who the guest is or how they reached
  the link

### Requirement: Fixed date, time, and venue facts

`EventDetails` SHALL display three labeled facts — date, time, and venue — each pairing an icon with
a label and a fixed value. The date SHALL read "27 de setembro de 2026", the time SHALL read
"11h30", and the venue SHALL read "Alto da Serra Recepções, Cuité". These values SHALL be identical
for every guest and SHALL NOT vary per link, query parameter, or any other guest-identifying state.

#### Scenario: Facts are identical across guests

- **WHEN** two different guests open the invite link
- **THEN** both see the identical date, time, and venue facts, with no substitution or per-guest
  variation

#### Scenario: Icons are decorative, not a substitute for text

- **WHEN** a screen reader reads the facts panel
- **THEN** it announces each fact's label and value and does not announce an unlabeled icon, because
  every fact icon is marked `aria-hidden`

### Requirement: External GPS link opens in a new tab

`EventDetails` SHALL render a link to the fixed URL
`https://maps.app.goo.gl/xxoBYQV8dQhPRaQi8` that opens in a new browser tab, with
`rel="noopener noreferrer"` set so the new tab cannot access the opener window.

#### Scenario: Guest taps the map link

- **WHEN** a guest activates the GPS link
- **THEN** the venue location opens in a new browser tab, and the original invite page remains open
  and unaffected in its own tab

### Requirement: Closing message

`EventDetails` SHALL display a short closing message after the facts panel. The message's final
wording is out of scope for this capability and is supplied later by the copy writer; the message
SHALL NOT restate the date, time, or venue values already shown in the facts panel.

#### Scenario: Closing message renders after the facts

- **WHEN** the section renders
- **THEN** the closing message appears after the facts panel and GPS link, as the section's final
  element

### Requirement: No new illustration asset

`EventDetails` SHALL render using only typographic content and icons from the project's existing
utility icon library. It SHALL NOT reference any `.svg` or `.png` illustration asset from
`public/assets/images/`.

#### Scenario: Section renders with no illustration asset request

- **WHEN** the section is rendered
- **THEN** it makes no request for an illustration asset, and every icon it displays comes from the
  installed icon library rather than a custom `.svg` file
