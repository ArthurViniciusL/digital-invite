## Context

`InviteHero.tsx` (`src/components/invite/InviteHero.tsx`) is a deliberate stub composed into
`InvitePage` (`src/pages/InvitePage/index.tsx`), which today renders a placeholder `Title` plus
"Invite Page — under construction" inside `PageWrapper`. Per `SYSTEM-DESIGN.md` §4, `InviteHero`
is the first of three invite components (`InviteHero`, `EventDetails`, `RsvpForm`) — this design
covers only `InviteHero`.

Design constraints already fixed by `GUIDELINES.md` (not decided here): the three-color palette
(`carved-black`, `bone-white`, `sertao-brown`), `font-title` (Xilosa, currently falling back to a
generic serif per a pending `TODO`) and `font-body` (Caveat), the `.carved-1/2/3` asymmetric-radius
utilities, and the rule that neighboring carved shapes must not repeat the same utility (§5.3). No
gradients, blur, glow, transparency, or soft drop shadow are available for depth (§4.5) — hatching
inside the existing `.svg` assets is the only sanctioned shadow technique, and that lives in the
assets, not in new CSS this change would author.

`Title.tsx` (`src/components/typograph/Title.tsx`) exists as a heading primitive but currently uses
a default export and semicolons/double quotes, which violates `AGENTS.md` conventions. This design
treats it as reusable for the centerpiece's heading role; bringing it into convention is `dev`'s
job, not scoped here.

## Goals / Non-Goals

**Goals:**
- Give `dev` a composition precise enough to implement without further design decisions: what each
  of the 4 elements is, how they're arranged relative to each other, and which existing token/utility
  applies to each.
- Keep every guest-facing string as a scoped placeholder so a copy writer agent can fill it in
  without touching layout.
- Specify one coordinated entrance animation, replacing the open-ended "abrir folheto de cordel"
  idea from `PROJECT.md` §5.1 with a concrete, reduced-motion-safe sequence.

**Non-Goals:**
- Any layout for `EventDetails` or `RsvpForm` — those are separate sections with their own future
  changes.
- Per-guest personalization of any hero content (`PROJECT.md` §7 puts this out of scope entirely).
- Requesting, drawing, or modifying any `.svg`/`.png` asset.
- Fixing `Title.tsx`'s convention violations, or deciding `InviteHero`'s internal file
  decomposition (single file vs. local subcomponents) — left to `dev`, called out in tasks.md.
- Revalidating the pending color palette (`GUIDELINES.md` §4.2) or delivering the Xilosa font.

## Decisions

### Overall composition: a chapbook cover, not a hero-plus-illustration split

Rather than the generic "text block left, illustration right" hero, the section reads as a single
cordel chapbook cover, matching `GUIDELINES.md` §4.6's explicit call-out. Everything is centered on
one vertical axis, in this stacking order (top to bottom):

```
┌─────────────────────────────────────────┐
│   flags.png bunting, strung edge-to-edge │  <- top framing device
│                                           │
│              sun.svg (partial,           │
│         upper corner, behind panel)      │
│                                           │
│        ┌───────────────────────┐         │
│  broom │   {{cordel title}}    │         │
│  .svg  │                       │ cactus_ │
│ leaning│      MURICARLITON     │ 001.svg │
│  left  │                       │ upright,│
│ edge   │  (── "50" medallion ──)│ right   │
│        │      overlapping      │ edge    │
│        │    bottom-right corner│         │
│        └───────────────────────┘         │
│                                           │
│   {{ subtitle line }}                    │
│                                           │
│  straw_hat_002.svg   cactus_003.svg      │
│   resting on ground, anchoring the base  │
└─────────────────────────────────────────┘
```

Rationale: `GUIDELINES.md` §4.6 names "Muricarliton" + "50" as *the* central typographic piece "in
cordel cover style" — cordel booklet covers conventionally carry a short title line above the main
title and an illustrated scene around/below it, so building the whole section as one cover (rather
than a hero banner with a floating illustration) is the literal reading of that requirement, not
just a stylistic choice. It also gives `cactus_002.svg` (the plain icon reference) no reason to
appear here — it is the plain-icon build documented in `GUIDELINES.md` §9.1's icon-vs-illustration
split, and every other asset in scope has a role, so `cactus_002.svg` is left unused in this
section (see Risks).

**Alternative considered**: a split hero (typography left, illustration right, side-by-side at
desktop width). Rejected — it reads as the generic "SaaS hero" pattern regardless of subject, and
it fights the cordel-cover framing that both `GUIDELINES.md` and `PROJECT.md` call for by name.

### Element 1 — cordel title line

A short line above the centerpiece, functioning as a cordel booklet's own title convention (the
line a cover carries above its main illustration/author name), not a decorative eyebrow label.
Distinct in role from Element 3 (the event subtitle): this line is festive/invitational, the
subtitle is informational.

- Typography: `font-body` (Caveat), smaller size, `sertao-brown` color — a secondary, quieter voice
  under the black-ink centerpiece.
- Alignment: centered, directly above the centerpiece panel.
- Content placeholder: `{{copy: hero_title — cordel-style invitation phrase, ≤5 words, festive tone,
  does not repeat the honoree's name or the word "convite" since the page context already makes
  that clear}}`.

### Element 2 — "Muricarliton" + "50" centerpiece

The centerpiece lives inside one carved-outline panel (`.carved-1`), applying the asymmetric-radius
"woodcut carve" treatment from `GUIDELINES.md` §4.4 to the panel itself, with a heavy `border`
in `carved-black` (no box-shadow blur — see Context).

- "Muricarliton": `font-title` (Xilosa, generic-serif fallback in effect until the font ships),
  the largest text on the page, `carved-black` on `bone-white`, centered inside the panel.
- "50": rendered as a corner medallion — a smaller nested shape using `.carved-3` (a different
  utility than the panel's `.carved-1`, per `GUIDELINES.md` §5.3's rule against repeating a
  silhouette between neighbors), overlapping the panel's bottom-right corner like a stamped seal.
  Same `font-title` family, `sertao-brown` fill to visually separate it from the name text while
  staying inside the palette.
- Both are static content, not content placeholders — "Muricarliton" and "50" are fixed facts from
  `PROJECT.md` §2, not copy to be drafted, and carry no per-guest logic.

**Alternative considered**: "50" as a full-bleed giant background numeral behind "Muricarliton"
(arcade "high score" motif, leaning harder into the "Arcade" half of "Cordel Arcade"). Rejected for
this pass — at small viewport widths a bleeding numeral behind foreground text risks illegibility
and forces a font-loading dependency (Xilosa isn't delivered yet) to carry more weight than the
fallback serif can bear; the medallion treatment degrades more gracefully on the fallback font and
is flagged as a design refinement to reconsider once Xilosa ships (see Open Questions).

### Element 3 — event-description subtitle

One line beneath the centerpiece panel, `font-body` (Caveat), `carved-black`, sized to sit clearly
below the centerpiece in the type scale without competing with it.

- Content placeholder: `{{copy: hero_subtitle — one line, cordel-verse tone, may reference
  27/09/2026, 11h30, Alto da Serra Recepções, Cuité per PROJECT.md §2, but does not need to state
  every fact since EventDetails covers them in full; final verse text is still pending per
  PROJECT.md §2}}`.
- Constrained to one line by content length (≤ ~60 characters is a safe target for the type scale
  described above), not by CSS truncation — the copy writer should write to that budget rather than
  the layout clipping an overflow.

### Element 4 — illustrated composition from existing assets

Every image in the composition already exists in `public/assets/images/`; none is requested new.

| Asset | Role | Placement |
| --- | --- | --- |
| `flags.png` | Festival bunting, framing device | Strung along the very top edge of the section, spanning its width |
| `sun.svg` | Sertão sun, partial | Upper corner, largely behind/above the centerpiece panel, evoking a sun rising behind the cover |
| `broom.svg` | Portrait accent | Leaning against the panel's left edge, grounding the composition |
| `cactus_001.svg` | Slender upright accent | Standing at the panel's right edge, balancing `broom.svg` |
| `straw_hat_002.svg` | Small ground prop | Resting near the base, beside `cactus_003.svg` |
| `cactus_003.svg` | Ground anchor | Bottom center, behind/below the subtitle — already includes its own cracked-earth ground per its `<title>` ("Mandacaru florido no chão rachado do sertão"), so no separate ground texture is needed |
| `cactus_002.svg` | Not used in this section | Reserved — see Decisions above |
| `straw_hat.svg` | Not used in this section | Redundant with `straw_hat_002.svg` for this composition; leaving one unused avoids visual clutter inside one section |

Each `.svg` keeps its own intrinsic `viewBox` scaling (per `GUIDELINES.md` §6, none of them declare
a fixed `width`/`height`); sizing is controlled by the consuming CSS, not the asset. `flags.png` is
the only raster asset and needs guest-facing Portuguese alt text — scoped as a placeholder, not
authored here: `{{copy: hero_illustration_alt — short Portuguese alt text describing the paper-flag
bunting for flags.png}}`. The `.svg` assets already carry their own Portuguese `<title>` elements
per `GUIDELINES.md` §12 and need no separate alt text when inlined or used with `role="img"`.

**Responsive behavior**: at narrow (mobile) widths, `broom.svg` and `cactus_001.svg` scale down and
move to flank the centerpiece panel more tightly rather than disappearing — removing an element at
small widths would break the "same content for every guest" simplicity the spec requires and this
composition doesn't have a piece that reads as purely decorative filler. `flags.png` and `sun.svg`
scale down proportionally with the section. No element is hidden at any supported breakpoint.

### Animation: one coordinated load-in sequence

A single Framer Motion sequence, staged (not simultaneous), on first mount only:

1. `flags.png` settles into place first (a brief drop/rotate-to-rest, evoking bunting being hung).
2. The centerpiece panel presses in next (scale from a value just above 1 down to 1, evoking a
   printing-block stamp rather than a generic fade/slide).
3. The subtitle fades up last, after the panel has settled.
4. The illustrated ground elements (`broom.svg`, `cactus_001.svg`, `cactus_003.svg`,
   `straw_hat_002.svg`) and `sun.svg` are present from first paint with no motion of their own —
   only the three staged steps above animate, which is what keeps this "one coordinated sequence"
   rather than "fade-and-slide-up on every element."

This directly answers `PROJECT.md` §5.1's open call for an opening interactive moment ("abrir
folheto de cordel") without inventing a page-flip mechanic image assets can't support. A guest with
`prefers-reduced-motion: reduce` sees step 4's final layout immediately, with steps 1–3 skipped
rather than instant-completed (per the spec's reduced-motion scenario).

## Risks / Trade-offs

- **[Risk]** Leaving `cactus_002.svg` and `straw_hat.svg` unused in this section could read as an
  oversight rather than a decision. → **Mitigation**: documented explicitly above; both remain
  available to `EventDetails` or a future section, so nothing is wasted, just not double-used here.
- **[Risk]** The centerpiece's largest text (`font-title`) currently renders in a generic serif
  fallback, not Xilosa. A layout tuned for Xilosa's proportions may look loose or tight once the
  real font ships. → **Mitigation**: `GUIDELINES.md` already forbids substituting a lookalike font;
  this design keeps the centerpiece panel's sizing in relative units so a later font swap needs a
  visual QA pass, not a re-layout.
- **[Risk]** `Title.tsx`'s current default export/semicolon style means reusing it as-is would
  propagate a convention violation into `InviteHero.tsx`. → **Mitigation**: flagged as a `dev`
  prerequisite in tasks.md rather than silently worked around here.
- **[Trade-off]** The "50" medallion (not a full-bleed background numeral) is the more
  conservative of the two centerpiece treatments considered, trading some of the "Arcade" half's
  visual punch for legibility safety against the undelivered Xilosa font.

## Open Questions

- Once Xilosa ships, should "50" be revisited as a full-bleed background numeral (the rejected
  alternative above) now that font metrics are known? Doesn't change this change's specs or task
  breakdown — safe to answer later, at font-delivery time.
- `GUIDELINES.md` §9.1/§11.1 name `public/assets/images/cactus_004.svg` as the canonical gouge-mark
  reference file, but only `cactus_001.svg`–`cactus_003.svg` exist in the directory today. This
  change does not depend on `cactus_004.svg` (it isn't used in this composition), so it doesn't
  block `InviteHero` — flagging it here as a documentation/asset-delivery gap for the user or the
  `assets-designer` agent to resolve separately.
