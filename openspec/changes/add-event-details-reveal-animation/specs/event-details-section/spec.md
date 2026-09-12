## Purpose

Defines the observable content and behavior of the public invite page's second section: the block
that tells every guest when the event happens, where it happens, and how to get there, immediately
following the hero.

This delta reverses `add-event-details-section`'s original "no entrance animation" position and adds
a reveal-on-load-and-scroll animation requirement in its place. Every other requirement of this
capability (the heading, the three facts, the GPS link, the closing message, and the no-new-asset
constraint) is unchanged and is not repeated here beyond what MODIFIED/ADDED requires.

## ADDED Requirements

### Requirement: Scroll-triggered reveal animation with reduced-motion bypass
`EventDetails` SHALL play a coordinated reveal animation on its facts panel, GPS call-to-action, and
closing message, triggered by the section entering the viewport — whether that happens at initial
page load (the section already visible) or later via scrolling. The animation SHALL play at most
once per page load and SHALL NOT replay on repeated scrolling past the section. A guest with
`prefers-reduced-motion: reduce` enabled SHALL see the section's final state immediately whenever it
enters the viewport, with no animated transition played.

#### Scenario: Section already in the viewport at first paint
- **WHEN** a guest with no reduced-motion preference loads `/` and `EventDetails` is already within
  the viewport at first paint (for example, on a tall viewport)
- **THEN** the section's reveal animation plays immediately on load, without requiring any further
  scrolling

#### Scenario: Section scrolled into view
- **WHEN** a guest with no reduced-motion preference loads `/` with `EventDetails` outside the
  initial viewport and then scrolls down until the section enters the viewport
- **THEN** the section's reveal animation plays at that point, coordinated across the facts panel,
  GPS call-to-action, and closing message as one sequence rather than independently-timed motion per
  element

#### Scenario: Animation does not replay on repeated scrolling
- **WHEN** a guest scrolls the section into view, then scrolls away, then scrolls back to it again
  within the same page load
- **THEN** the reveal animation plays only once, on the first time the section entered the viewport,
  and the section remains in its settled final state on every subsequent time it re-enters view

#### Scenario: Guest with reduced motion enabled
- **WHEN** a guest with `prefers-reduced-motion: reduce` loads `/` and `EventDetails` enters the
  viewport, whether immediately at load or after scrolling
- **THEN** the section renders directly in its final settled state at the moment it enters the
  viewport, with no entrance animation played

## MODIFIED Requirements

_None. This delta only adds the requirement above; every other `event-details-section` requirement
(static heading, fixed date/time/venue facts, external GPS link, closing message, no new
illustration asset) is unchanged by this change._

## REMOVED Requirements

### Requirement: No entrance animation
**Reason**: Superseded by "Scroll-triggered reveal animation with reduced-motion bypass" above. The
original design deliberately chose no motion for this section to avoid competing with the hero's own
load-in sequence; that decision has been explicitly reversed for `EventDetails` only.
**Migration**: None required — this was a behavioral absence (no requirement previously existed
mandating the lack of animation as an observable, testable contract in the archived spec), not a
piece of content or an API that guests or other code depended on. No follow-up action is needed
beyond implementing the ADDED requirement above.
