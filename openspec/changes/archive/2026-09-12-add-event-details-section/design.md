## Context

`EventDetails.tsx` (`src/pages/InvitePage/partials/EventDetails.tsx`) is a deliberate stub composed
into `InvitePage` (`src/pages/InvitePage/index.tsx`) right after the already-implemented
`InviteHero`. Per `SYSTEM-DESIGN.md` §4's folder layout (now realized as `partials/` rather than the
document's original `components/invite/` path — `InviteHero` already moved there), `EventDetails` is
the second of the invite page's three sections (`InviteHero`, `EventDetails`, `RsvpForm`); this
design covers only `EventDetails`.

Design constraints already fixed by `GUIDELINES.md` (not decided here): the three-color palette
(`carved-black`, `bone-white`, `sertao-brown`), `font-title` (Xilosa, generic-serif fallback until
delivered) and `font-body` (Caveat), the `.carved-1/2/3` asymmetric-radius utilities and the rule
that neighboring carved shapes must not repeat the same utility (§5.3), and Lucide as the utility
icon library (§5.4). Content facts are fixed by `PROJECT.md` §2: 27/09/2026 at 11h30, Alto da Serra
Recepções (Cuité), RSVP open until 26/09/2026, and the GPS link
`https://maps.app.goo.gl/xxoBYQV8dQhPRaQi8`.

`InviteHero` (`openspec/changes/add-invite-hero-section/design.md`) already used `.carved-1` for its
main panel and `.carved-3` for the adjacent "50" medallion. Since `EventDetails` sits directly below
the hero on the page, its own main panel needs a utility that doesn't repeat that pairing's
silhouette immediately below it.

`Title.tsx` (`src/components/typograph/Title.tsx`) hardcodes an `<h1>`. `InviteHero` already uses it
for the page's one `<h1>` ("Muricarliton"), so `EventDetails` needs a real `<h2>` for its own
heading rather than a second `<h1>` — a page should have exactly one.

## Goals / Non-Goals

**Goals:**

- Give `dev` a composition precise enough to implement without further design decisions: what each
  of the section's 6 elements is, how they're arranged, and which existing token/utility/icon
  applies to each.
- Keep every piece of wording that requires tone or word-choice judgment as a scoped placeholder,
  while writing fixed factual content (dates, times, the venue name, plain labels) directly, since
  `PROJECT.md` §2 already fixes it and no copywriting judgment is needed to render it.
- Extend `Title.tsx` minimally (an `as` prop) so this section's heading is a real `<h2>`, keeping the
  page's heading hierarchy correct without inventing a parallel heading primitive.

**Non-Goals:**

- Any layout for `RsvpForm` — a separate section with its own future change.
- Per-guest personalization of any content (`PROJECT.md` §7 puts this out of scope entirely).
- Requesting, drawing, or modifying any `.svg`/`.png` asset — this section carries no illustration.
- An entrance animation sequence. Unlike the hero, `PROJECT.md` §5.1's "opening interactive moment"
  call-out was answered there; this section is read-and-scan content and gets no motion by default.
- Deciding `EventDetails`'s internal file decomposition (single file vs. local subcomponents, e.g. a
  repeated fact-row subcomponent) — left to `dev`.
- Revalidating the pending color palette (`GUIDELINES.md` §4.2) or delivering the Xilosa font.

## Decisions

### Overall composition: a facts panel plus a separate map CTA, not an inline-linked address

```
┌─────────────────────────────────────────┐
│            {{ section heading }}          │  <- h2, smaller than hero's h1
│                                           │
│   ┌───────────────────────────────────┐  │
│   │  [Calendar]  Data                 │  │
│   │              27 de setembro de    │  │
│   │              2026                 │  │
│   │                                   │  │
│   │  [Clock]     Horário              │  │
│   │              11h30                │  │
│   │                                   │  │
│   │  [MapPin]    Local                │  │
│   │              Alto da Serra        │  │
│   │              Recepções, Cuité     │  │
│   │                                   │  │
│   │      ┌─────────────────────┐     │  │
│   │      │ [ExternalLink] {{gps}} │  │  │ <- separate CTA, .carved-3
│   │      └─────────────────────┘     │  │
│   └───────────────────────────────────┘  │ <- panel, .carved-2
│                                           │
│            {{ closing message }}          │
└─────────────────────────────────────────┘
```

Rationale: the section's job is to be scanned quickly for three facts, then offer one clear action
(open the map). Bundling all three facts plus the CTA inside a single panel keeps them visually
grouped as "the essentials," while the closing message sits outside the panel as the section's
softer, human sign-off — mirroring how the hero's subtitle sits outside its own centerpiece panel.

### Element 1 — section heading

An `<h2>`, using `Title.tsx` extended with an `as` prop (`'h1' | 'h2'`, default `'h1'` so
`InviteHero`'s existing `<Title>` usage is unaffected). Rendered noticeably smaller than the hero's
centerpiece text — a secondary heading introducing the facts, not a second display-scale title.

- Typography: `font-title` (via `Title`'s existing default), sized down from the hero (e.g. a scale
  in the `text-2xl`/`text-3xl` range rather than the hero's `text-5xl`/`text-7xl` — exact values left
  to `dev`'s judgment against the hero's proportions), `carved-black`, centered above the panel.
- Content placeholder: `{{copy: event_details_heading — 1-2 words, section label introducing the
event facts, Cordel Arcade tone}}`. "Sobre" is an illustrative example only, not the final string.

### Elements 2-4 — date, time, and venue facts

Three labeled fact rows inside one `.carved-2` panel (a heavy `border-4 border-carved-black
bg-bone-white` panel, matching the hero panel's border treatment but a different asymmetric radius
so it doesn't repeat the hero's `.carved-1` silhouette directly below it). Each row pairs a Lucide
icon with a label and a value — read as a fact, not a sentence:

| Fact  | Icon       | Label (fixed) | Value (fixed)                    |
| ----- | ---------- | ------------- | -------------------------------- |
| Date  | `Calendar` | "Data"        | "27 de setembro de 2026"         |
| Time  | `Clock`    | "Horário"     | "11h30"                          |
| Venue | `MapPin`   | "Local"       | "Alto da Serra Recepções, Cuité" |

All six strings (three labels, three values) are fixed content, not copy placeholders — `PROJECT.md`
§2 already states them verbatim or by direct translation, and none require tone or word-choice
judgment the way the heading, GPS label, and closing message do. Write them as English-named
constants holding the Portuguese literal, e.g. `eventDateLabel = 'Data'`, `eventDateValue = '27 de
setembro de 2026'`, matching how `InviteHero` treats "Muricarliton" and "50" as fixed, non-placeholder
content per `PROJECT.md` §2.

Icons are decorative reinforcement of the label text, not a replacement for it — mark each icon
`aria-hidden="true"` so a screen reader reads only the label and value, never an unlabeled icon.

### Element 5 — GPS link as a separate call-to-action, not an inline link on the venue text

The GPS link (`https://maps.app.goo.gl/xxoBYQV8dQhPRaQi8`) renders as its own small styled control —
a plain `<a>` styled as a button/pill with `.carved-3` (different from the panel's `.carved-2`, so
the two adjacent carved shapes inside this section don't repeat a silhouette either, per §5.3),
paired with the `ExternalLink` icon (deliberately not `MapPin` again, so the venue fact's icon and
the CTA's icon don't repeat inside one section). Required attributes: `target="_blank"` and
`rel="noopener noreferrer"` — this is the first outbound external link in the codebase, and no
existing abstraction wraps it; a plain inline anchor is enough for one link.

- Content placeholder: `{{copy: gps_link_label — 2-4 words, Portuguese, invites tapping to open the
map, e.g. the tone of "Ver no mapa"}}`.
- Href is a fixed constant, not a placeholder: `https://maps.app.goo.gl/xxoBYQV8dQhPRaQi8`.

**Alternative considered**: wrapping the venue fact's own text (element 4) in the anchor instead of
adding a separate control. Rejected for this pass — it would make the venue row behave differently
from the date and time rows for no visible reason (an unlabeled affordance to tap the address), and
it conflates a static fact with an interactive action inside the same line. A distinct, visibly
tappable control is more legible on a page most guests will read on a phone. Flagged in Open
Questions below since it's a legitimate alternative the caller may prefer.

### Element 6 — closing message

One short passage after the panel, `font-body` (Caveat), `carved-black`, sized between the hero's
subtitle and body text — a warm sign-off, not another fact.

- Content placeholder: `{{copy: event_closing_message — 1-2 short sentences, warm, Cordel Arcade
tone, doesn't repeat the date/time/venue facts already stated above, may reference the RSVP
deadline (26/09/2026) since that fact isn't stated elsewhere in this section}}`.

### No entrance animation

Unlike `InviteHero`, this section renders in its final state immediately, with no Framer Motion
sequence. `PROJECT.md` §5.1's call for an "opening interactive moment" was already answered by the
hero's load-in sequence; repeating a staged entrance here would compete with it rather than add
value, and a facts panel a guest needs to read quickly benefits from being immediately legible.

## Risks / Trade-offs

- **[Risk]** Treating the GPS link as a separate CTA rather than an inline link on the venue text is
  a judgment call the caller may want to reverse. → **Mitigation**: documented as an explicit
  alternative above and repeated in Open Questions; changing it later is a small, contained edit
  (move the `href`/`target`/`rel` attributes and the icon from the CTA onto the venue value's `<a>`),
  not a structural rework.
- **[Risk]** `Title.tsx`'s `as` prop extension touches a file `InviteHero` already depends on. →
  **Mitigation**: the prop is additive with a default matching current behavior (`'h1'`), so
  `InviteHero`'s existing `<Title>` usage needs no change; `dev` should still re-run
  `yarn lint && yarn typecheck && yarn build` after the edit to confirm no regression.
- **[Trade-off]** No entrance animation for this section is a deliberate simplicity choice, trading
  some visual consistency with the hero's motion for faster legibility of information a guest is
  actively looking for (when/where). Revisit only if a future design pass wants motion parity across
  every section.

## Open Questions

- Should the GPS link instead be the venue fact's own text turned into a link, dropping the separate
  CTA control? This change's decision is the separate control (see Decisions above); flagging for
  the caller to confirm or override before `dev` starts, since it's the one layout choice in this
  section without a clear precedent from the hero.
- Once Xilosa ships, the heading's relative size (`text-2xl`/`text-3xl` range) may need a visual QA
  pass against the hero's `text-5xl`/`text-7xl`, same caveat as the hero design's font-fallback risk.
  Doesn't block this change.
