## Purpose

Defines the observable content and behavior of the public invite page's opening section: the first
thing every guest sees when they open the invite link, establishing the event's identity before any
detail or RSVP form.

## ADDED Requirements

### Requirement: Static cordel title line

The hero SHALL display a short title line, in the visual convention of a cordel chapbook cover,
above the honoree centerpiece. The line is identical for every visitor — it carries no per-guest
data.

#### Scenario: Guest opens the invite link

- **WHEN** any guest loads `/`
- **THEN** the hero displays the same title line, regardless of who the guest is or how they
  reached the link

### Requirement: Honoree typographic centerpiece

The hero SHALL display "Muricarliton" and the numeral "50" as the section's central typographic
element, styled as a cordel-cover title piece. This content is static and SHALL NOT vary per guest,
per link, or per query parameter.

#### Scenario: Centerpiece is identical across guests

- **WHEN** two different guests open the invite link
- **THEN** both see the identical "Muricarliton" + "50" centerpiece, with no name substitution or
  per-guest variation

### Requirement: One-line event-description subtitle

The hero SHALL display a single-line subtitle beneath the centerpiece that communicates the event
is happening, without necessarily spelling out every fact (date, time, and venue are covered in
full by a later section of the page, per `SYSTEM-DESIGN.md`'s `EventDetails` component). The
subtitle's final wording is out of scope for this capability and is supplied later by the copy
writer.

#### Scenario: Subtitle renders as a single line

- **WHEN** the hero renders at any supported viewport width
- **THEN** the subtitle occupies one line of text and does not wrap into a paragraph block

### Requirement: Illustrated composition from existing assets only

The hero SHALL render an illustrated composition around the typographic content, built exclusively
from image assets already present in `public/assets/images/` at the time of this change. The hero
SHALL NOT depend on any asset that does not yet exist in that directory.

#### Scenario: Hero renders with no missing asset

- **WHEN** the hero is rendered
- **THEN** every image request it makes resolves to a file already committed under
  `public/assets/images/`, with no 404 for a hero-referenced asset

### Requirement: Single load-in animation sequence

The hero SHALL play one orchestrated entrance sequence on first render, and SHALL NOT play
independent, uncoordinated motion on more than one element at a time. A guest with reduced-motion
preference enabled SHALL see the hero's final state immediately, with no entrance animation.

#### Scenario: Guest with default motion settings

- **WHEN** a guest with no reduced-motion preference loads `/`
- **THEN** the hero's elements animate into place as one coordinated sequence, ending in the same
  final layout a reduced-motion guest sees immediately

#### Scenario: Guest with reduced motion enabled

- **WHEN** a guest with `prefers-reduced-motion: reduce` loads `/`
- **THEN** the hero renders directly in its final state, with no entrance animation played
