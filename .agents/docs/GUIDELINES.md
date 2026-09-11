# Design Guidelines — Digital Invite (Muricarliton's 50th Birthday)

The project's design source of truth. It applies to every surface: React components, CSS and `.svg`
assets.

Three layers, from the most stable to the most operational:

- **Section 4 — Design system.** What the designer defined. Kept at the original section numbering
  of the design document so it can be checked against the source. The Portuguese colour names are
  the designer's own and are treated as proper nouns.
- **Section 5 — Applying it in code.** How the design system shows up in CSS and in components.
- **Sections 6 to 13 — `.svg` assets.** How the same style becomes vector geometry. Read by the
  `assets-designer` agent before every asset.

---

## 4. Design system

### 4.1 Visual concept

"**Cordel Arcade**": traditional Northeastern Brazilian woodcut (carved stroke, grainy texture,
hatching for shadow) fused with the retro aesthetic of early video games (Atari as the reference) —
more geometric, blocky silhouettes, without adopting vibrant video-game colours. Tone: warm and
festive, yet sober, never childish.

### 4.2 Colour palette

| Colour | Use |
| --- | --- |
| **Preto Entalhe** (#1C1410) | Primary — stroke, illustrations, display text |
| **Branco Osso** (#F4EEDD) | Primary — background, breathing room, text on dark surfaces |
| **Marrom Sertão** (#6B4226) | Complementary — subtle detail, assets, secondary type, button hover |

> Pending revalidation: the HEX values above come from an earlier craft/beige style guide and still
> need to be revalidated and adjusted by the designer for the new direction, "Branco Osso + Preto
> Entalhe as the base, Marrom Sertão as support", with no additional vibrant accent colour.

### 4.3 Typography

- **Headings**: Xilosa
- **Body copy**: Caveat

### 4.4 Outlines and shapes

Multi-value `border-radius` with individually asymmetric corners, imitating a woodcut carve — shapes
with bellies and slightly crooked corners. Reference:

```css
border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
```

Apply this treatment to cards, buttons and image frames, varying it subtly between elements to
reinforce the hand-carved feel. Avoid a uniform, perfectly symmetrical radius.

### 4.5 Stroke and texture rules (inherited from traditional woodcut)

- Thick, slightly irregular lines. Avoid perfectly smooth vectors.
- Shadow is always hatching (parallel or cross-hatched lines). Never a gradient, never a soft drop
  shadow.
- A subtle grainy paper/print texture may be used as a background.
- Avoid: gradients, glow, shine, transparency, and saturated colours outside the defined palette.

### 4.6 Iconography and available themes (visual repertoire)

- Sertão: mandacaru, cacti, stylised sun, cracked earth
- Stylised flora
- Popular religious elements (ex-votos), used sparingly
- Musical instruments: guitar, accordion, pandeiro, triangle, zabumba
- The name "Muricarliton" and the numeral "50" as a central typographic piece, in cordel cover style

> No assets or illustrations exist yet. They will be created from scratch in the "Cordel Arcade"
> style described above.

---

## 5. Applying it in code

### 5.1 Colour tokens

The code identifiers are the English equivalents of the 4.2 palette, already declared in
`src/styles/globals.css` and exposed to Tailwind through `tailwind.config.ts`:

| CSS variable | Design system | Value |
| --- | --- | --- |
| `--color-carved-black` | Preto Entalhe | `#1C1410` |
| `--color-bone-white` | Branco Osso | `#F4EEDD` |
| `--color-sertao-brown` | Marrom Sertão | `#6B4226` |

The three values live in exactly one place. No component and no asset repeats a literal HEX, so the
pending palette revalidation is a single edit rather than a sweep.

### 5.2 Typography in code

The 4.3 families are available as `font-title` (Xilosa) and `font-body` (Caveat). Caveat is already
self-hosted through Fontsource. **The Xilosa files have not been delivered yet**: the heading stack
falls back to a generic serif, and `globals.css` carries a `TODO` with the `@font-face` ready to go.
Do not substitute a lookalike font in the meantime.

Consequence for assets: an asset carrying lettering must not depend on the font being installed.
Text in SVG is a `<path>`, never a `<text>` element.

### 5.3 Carved outlines in CSS

The 4.4 treatment already exists as utility classes in `src/styles/globals.css`: `.carved-1`,
`.carved-2` and `.carved-3`. Alternate between them so two neighbouring elements never repeat the
same silhouette.

### 5.4 Utility iconography

The project's icon library is **Lucide**. It covers the utility set: calendar, clock, map, user,
envelope, arrow, check, alert.

The 4.6 thematic repertoire and the illustrations do not exist in Lucide and are drawn by hand,
following sections 6 onwards. Before drawing a utility icon, check whether Lucide already has it. A
second calendar icon in this project is visual debt, not identity.

---

## 6. `.svg` assets — grid and viewBox

Every file declares a `viewBox` on the root element and **never** a fixed `width`/`height`. The
consumer decides the size, through CSS.

| Type | viewBox | When to use |
| --- | --- | --- |
| Icon | `0 0 24 24` | A symbol read from 16px up, beside text or inside a button |
| Illustration | `0 0 256 256` | A standalone piece: hero, divider, sertão scene |
| Texture | free, square | A repeating paper/print pattern |

The reference unit in this document is **`u` = 1/24 of the viewBox side**. In an icon `1u` = 1; in an
illustration `1u` ≈ 10.67. Every measurement below is in `u`, so it holds at both sizes.

Icons: keep `1u` of dead margin on each side, meaning you draw inside a 22×22 box. That stops the
stroke from touching the edge once the icon is scaled down.

## 7. Stroke weight

Three named weights, all relative to the viewBox:

| Name | Value | Use |
| --- | --- | --- |
| Heavy | `1u` | Outer silhouette outline |
| Medium | `0.6u` | Internal divisions, structure |
| Light | `0.3u` | Hatching, detail |

The rule that comes from woodcut: **no stroke is uniform along its own length**. A gouge bites deeper
in the middle of a cut than at the ends. In practice, prefer a filled `<path>` over a `<line>` with a
`stroke`, because a filled outline lets you thicken the middle and taper the ends, whereas a
`stroke-width` is constant by definition.

When you do use `stroke`, always set `stroke-linecap="round"` and `stroke-linejoin="round"`. A
perfectly square cap gives the vector away.

## 8. Controlled irregularity

The goal is hand-carved wood, not noise. This is 4.4 and 4.5 translated into vector geometry. The
irregularity is systematic and restrained:

- **Point offset**: move each control point up to `0.15u` off its ideal geometric position. Past
  that, the shape stops being recognisable at 16px.
- **Corners that overshoot**: where two edges meet, let one run past the junction by up to `0.2u`,
  imitating a cut that went too far. Use it on two or three corners per piece, never on all of them.
- **Bellies**: long straight lines get a very slight curvature, with the apex off centre. It is the
  SVG equivalent of the asymmetric radii in 4.4.
- **Asymmetry**: mirrorable shapes (a sun, a pandeiro) must not be mirrored with `transform`. Draw
  both sides, differing only enough to notice up close.

A piece where every point was offset looks shaky. Choose the places.

## 9. Shadow and hatching

Shadow is **always** hatching, per 4.5. Parallel lines for midtone, cross-hatching for deep shadow.

- **Angle**: 45° as the default across the whole piece. Cross-hatching uses 45° and 135°. Holding the
  same angle across every asset is what makes the set read as one system.
- **Weight**: light, `0.3u`.
- **Spacing**: `0.8u` between axes for midtone, `0.5u` for dense shadow. Below `0.4u` the hatching
  clogs when scaled down and turns into a grey smudge, which is precisely the gradient the style
  forbids.
- **Icons at 24u**: use hatching sparingly, or not at all. A 16px icon has no room for lines `0.8u`
  apart. Prefer a solid silhouette and an outline.
- **`<pattern>` or a repeated `<path>`**: use `<pattern>` when the hatched area is large and regular,
  such as an illustration background. Use a repeated `<path>` when the lines have to follow the form,
  vary in length or stop short of the edge, which is the case for most icons. `<pattern>` needs a
  unique `id`; see section 12.

**Forbidden in every file**, no exceptions:

- `<linearGradient>` and `<radialGradient>`
- `<filter>`, especially `feGaussianBlur` and `feDropShadow`
- `fill-opacity`, `stroke-opacity` or `opacity` below 1
- Any colour outside the three palette tokens

## 10. Colour inside the `.svg` file

Every file carries an internal `<style>` block with the three variables from 5.1 and their
fallbacks. No bare HEX in a `fill` or `stroke` attribute.

The file is served from `public/` through `<img>`, in an isolated document that cannot see
`globals.css`, so the fallback is what actually paints today. The `var()` is there for the day the
SVG is inlined into JSX, when it starts inheriting the theme with no re-editing.

The block, right after the opening `<svg>`:

```svg
<style>
  .ink    { fill: var(--color-carved-black, #1C1410); }
  .paper  { fill: var(--color-bone-white, #F4EEDD); }
  .sertao { fill: var(--color-sertao-brown, #6B4226); }
  .ink-stroke { stroke: var(--color-carved-black, #1C1410); fill: none; }
</style>
```

Shapes reference the classes: `<path class="ink" d="..."/>`. When the designer revalidates the
palette, each file changes in one spot.

Background: an icon has a **transparent** background, with no `.paper` rectangle underneath. An
illustration may carry the `.paper` rectangle when it needs guaranteed contrast over any surface.

## 11. Where assets live, and how they are named

Every asset goes in **`public/assets/images/`**, and is consumed by absolute path:
`/assets/images/cactus.svg`. Nothing is written to the root of `public/`, which holds only the Vite
scaffold files.

File names are **English**, lowercase `snake_case`, named after the subject with no type prefix.
Same rule as `AGENTS.md`: code, file names and comments in English; interface text and guest-facing
strings in Portuguese.

| Convention | Example |
| --- | --- |
| Subject only | `broom.svg`, `sun.svg` |
| Numbered variant of the same subject | `cactus_001.svg`, `cactus_002.svg` |

Add the `_001` suffix only when a second take on the same subject actually exists. A single version
keeps the bare name. Note that "cactus" is the English file name for the mandacaru and the cacti of
4.6; the Portuguese subject name belongs in the `<title>`, not in the file name.

## 11.1 Assets the designer delivered

`public/assets/images/` already holds work exported from Inkscape and Illustrator: `broom.svg`,
`cactus_001.svg`, `sun.svg` and `flags.png`. Read those before drawing anything new. They are the
reference for what "the same hand" means in checklist item 8, and they confirm the style holds in
practice: not one of them contains a gradient or a filter.

Two things about them to keep in mind:

- **Do not rewrite or reformat them.** They are the designer's source of record, roughly 15 to 20 KB
  each, carrying editor metadata and fixed `width`/`height`. Sections 6, 10 and 12 govern files
  authored from scratch here, not these imports. Re-exporting them to fit those rules would discard
  the designer's editable data.
- **Their colour drifts from the palette.** They use `#1c1c1a` and `#000000` where the token says
  `#1C1410`. Do not copy those values into a new asset, and do not "fix" the existing files. It is
  one more input for the palette revalidation still pending in 4.2.

## 12. Accessibility and file hygiene

Every file opens like this, with `role` and a `<title>` **in Portuguese**, because a screen reader
reads that title aloud to the guest:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-labelledby="cactus-title">
  <title id="cactus-title">Mandacaru</title>
  ...
</svg>
```

File hygiene:

- No editor metadata: no `<metadata>`, no `sodipodi:`, no `inkscape:`, no `<!-- Generator: ... -->`.
- No `<script>`, no `<foreignObject>`, no base64 `<image>`.
- Every `id` is prefixed with the asset name (`cactus-title`, `cactus-hatch`). Two inline SVGs
  on the same page both using `id="hatch"` collide, and one of them renders wrong.
- No `<text>` depending on an installed font. Lettering is a `<path>`, per 5.2.
- Two-space indentation, one element per line, so the diff stays readable.

## 13. Asset review checklist

Before calling an asset done:

1. It opens in the browser and renders with no console error.
2. Scaled to 16px, the silhouette is still recognisable.
3. The hatching, if any, still has distinguishable lines at the final display size.
4. Searching the file for `gradient`, `filter` and `opacity` returns zero hits.
5. No HEX outside the `<style>` block.
6. `viewBox` present, `width`/`height` absent on the root element.
7. The Portuguese `<title>` is filled in and every `id` is prefixed.
8. Placed beside the designer's assets from 11.1, they look like they came from the same hand.
9. The file sits in `public/assets/images/`, named per section 11.
