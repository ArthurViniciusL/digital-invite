## Context

What is on disk today:

- `src/pages/AdminDashboardPage.tsx` — `<PageWrapper>Admin Dashboard Page — under construction</PageWrapper>`.
- `src/components/admin/RsvpTable.tsx` — `<table>RSVP table — under construction</table>`.
- `src/components/admin/RsvpSummaryCard.tsx` — `<article>RSVP summary — under construction</article>`.
- `src/components/admin/LoginForm.tsx` — a stub, untouched by this change.
- `src/hooks/useRsvpList.ts` — a stub returning `{ rsvpList: [], isLoading: false, error: null }`.
  **Not used here.** The mock is imported directly by the page.
- `src/components/ui/` — `button`, `dialog`, `form`, `input`, `label`, `sonner`. No `table`.
- `src/lib/schemas/rsvpSchema.ts` — `rsvpSchema`, `RsvpFormData`, `RsvpFormInput`, `MAX_GUEST_COUNT`,
  and the write-side pair `RsvpRow` (`nome`, `email`, `whatsapp`, `numero_pessoas`) + `toRsvpRow`.
- `src/lib/formatters/whatsappNumber.ts` — `formatWhatsappNumber(raw: string): string`, pure,
  segment-based, idempotent.
- `src/components/layout/PageWrapper.tsx` — `px-4 min-h-dvh bg-background text-foreground flex
flex-col gap-8`. No horizontal centring, no vertical padding.
- `src/components/typograph/Title.tsx` — `Title` renders `h1`/`h2` with `font-bold text-4xl`
  (`font-title` comes from the `@layer base` heading rule in `globals.css`).

The Supabase `rsvp` table as it actually exists: `id uuid`, `nome text`, `email text`,
`whatsapp text`, `numero_pessoas integer`, `status text default 'confirmado'`, `created_at timestamptz`.

The visual vocabulary the dashboard should feel related to but not identical to, from the shipped
invite page:

- `EventDetails`: a `.carved-2` panel, `border-4 border-carved-black bg-bone-white`, holding rows of
  `font-title text-sm uppercase tracking-wide text-sertao-brown` labels over
  `font-body text-xl text-carved-black` values, with Lucide icons at `text-sertao-brown`.
- `carvedFieldStyles.ts`: a form input is a **ruled line** — `border-0 border-b-4 border-sertao-brown`,
  square corners — never a carved box. `.carved-*` is reserved for panels and buttons.
- `Button variant="xilo"`: `.carved-3`, `border-4`, `font-title`, inverting to
  `bg-carved-black text-bone-white` on hover.

Fixed by `GUIDELINES.md` and not decided here: the three colours (§4.2/§5.1), `font-title`/`font-body`
(§4.3/§5.2), `.carved-1/2/3` and the rule that two neighbouring carved shapes must not repeat the
same silhouette (§4.4/§5.3), the hatching-only / no-gradient / no-glow / no-soft-shadow /
no-transparency rules (§4.5), and Lucide as the utility icon library (§5.4).

Fixed by the caller and **not open here**: layout only against mocked data; ten fake guests in a
single plain module; the confirmations are shown **as a table**; no Supabase, no `useRsvpList`, no
auth, no login work, no `ProtectedRoute` change.

## Goals / Non-Goals

**Goals:**

- Decide the dashboard's composition, columns, states and narrow-screen behaviour precisely enough
  that `dev` writes it without inventing a treatment.
- Replace every conventional data-table device that `GUIDELINES.md` §4.5 forbids — zebra striping,
  hover tint, shimmer skeleton, fade-out scroll edge — with something drawn from three opaque colours.
- Draw the seam between mock and presentation so exactly that the later Supabase change edits one
  import in one file.
- Keep the table a real `<table>`, with caption and header scopes intact, at every viewport.
- Scope every string that needs tone judgment as a placeholder for the copy writer.

**Non-Goals:**

- Any Supabase import, query, policy or migration; `useRsvpList`; `useSession`; `ProtectedRoute`'s
  missing redirect; `LoginForm`; `AdminLoginPage`.
- Sorting, filtering, search, pagination, column reordering, CSV export, row selection, editing or
  deleting a confirmation, or a detail view for a row.
- An error state for a failed fetch. There is no fetch. See "State precedence" for where it slots in.
- Making the WhatsApp cell a `wa.me` link.
- Any new `.svg`/`.png` asset, any new design token, any new `globals.css` utility, any new
  dependency, any file in `src/components/ui/`.
- Revalidating the pending palette.

## Decisions

### 1. The data seam: an English view model, and one mapper

**Decision: the presentation consumes `RsvpRecord`, an English-named view model.
`src/lib/schemas/rsvpSchema.ts` gains `RsvpRecord`, `RsvpRecordRow` and `toRsvpRecord` — the read-side
mirror of the existing `toRsvpRow`. The mock exports `RsvpRecord[]` directly and never touches
`toRsvpRecord`.**

```ts
// shape only — dev writes the real declarations
export interface RsvpRecordRow extends RsvpRow {
  id: string;
  status: string;
  created_at: string;
}

export interface RsvpRecord {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  guestCount: number;
  status: string;
  createdAt: string;
}

export function toRsvpRecord(row: RsvpRecordRow): RsvpRecord;
```

Why not just pass the Supabase row shape straight through, which would need no mapper at all: the
project's hardest rule is that **code is English and only guest-facing strings are Portuguese**.
Threading `numero_pessoas` and `created_at` through a page, a table, a row and a summary card would
put Portuguese identifiers in five presentation files. `rsvpSchema.ts` is already documented as the
one place the column mapping lives, and it already holds exactly this mapping in the write
direction. One more function there costs a dozen lines and keeps the rule intact.

`status` stays `string`, not a union. The column is free text with a default and no check
constraint, so a union would be a claim the database does not enforce and would need an `as` cast or
a narrowing guard to satisfy — both discouraged by `.agents/rules/`. `createdAt` stays a `string`
(the ISO 8601 text Supabase returns), not a `Date`: nothing in the presentation does date
arithmetic, and parsing at the boundary would mean a second failure mode for the mock to model.

**`toRsvpRecord` is written in this change but is not called by it.** It exists so the later change's
hook is a one-liner (`data.map(toRsvpRecord)`) and so the mapping is reviewed here, next to
`toRsvpRow`, rather than invented under deadline later. `dev` must not delete it as unused — it is
exported, so `no-unused-vars` does not fire.

### 2. The mock module

**Path: `src/lib/mocks/rsvpListMock.ts`. One export: `const rsvpListMock: RsvpRecord[]`.**

- **A new `src/lib/mocks/` directory**, not `__mocks__`, not a `.mock.ts` suffix next to the
  component. The point is that it is trivially findable and deletable: the later change removes one
  directory and one import. Burying a fixture beside the component it feeds makes it easy to ship by
  accident.
- **A plain array, not a function and not a hook.** The caller fixed this. `isLoading` is a literal
  `false` at the call site in the page — see decision 7 for why the loading state still gets built.
- **Stable, hand-written UUID-shaped `id` strings.** Not `crypto.randomUUID()`: a fresh id per render
  breaks React key stability across HMR and makes the module's diff meaningless.
- **`createdAt` values carry an explicit offset** (`'2026-09-10T14:32:00-03:00'`), so the formatter's
  timezone handling is actually exercised rather than accidentally passing because everything is
  already local.
- **`whatsapp` values are in the masked shape `83 9 8765-4321`**, because that is what the shipped
  form validates and inserts (`rsvpSchema`'s regex has no `.transform()`), so the fixture matches
  production.
- **The ten rows exist to exercise the layout**, not just to fill it. Between them they must include:
  one name long enough to be the widest cell on the page (a full four-part Brazilian name), one
  e-mail of ~35 characters, one `guestCount` of `10` (two digits, the schema's ceiling) and at least
  one of `1`, and timestamps spread over several days **and across a month boundary** so the date
  column visibly varies. Names are plausibly Brazilian and clearly fictitious.
- **All ten carry `status: 'confirmado'`.** Nothing writes any other value today, and a fixture that
  invents `'cancelado'` would make the Status column look more informative than it is. That the
  column shows ten identical values is the honest current state, and it is the argument for keeping
  the column small and last rather than for deleting it.
- A docblock states: fixture data, imported only by `AdminDashboardPage`, deleted by the change that
  adds the Supabase read.

### 3. Composition

```
AdminDashboardPage                         PageWrapper > header + main, max-w-5xl
 ├─ header
 │   ├─ Title as="h1"   {{copy: admin_page_title}}
 │   └─ p               {{copy: admin_page_subtitle}}
 ├─ RsvpSummaryCard     .carved-2 panel — three figures        props: summary
 └─ RsvpTable           .carved-1 panel — heading + states     props: records, isLoading
     ├─ h2              {{copy: admin_table_heading}}          outside the scroll container
     ├─ div role=region  overflow-x-auto, tabIndex=0
     │   └─ table
     │       ├─ caption sr-only  {{copy: admin_table_caption}}
     │       ├─ thead > tr > th scope="col" × 6
     │       └─ tbody
     │           ├─ RsvpTableRow × n        (records present)
     │           └─ RsvpTableLoadingRows    (isLoading)
     ├─ RsvpTableEmpty                      (records empty, not loading — replaces the table)
     └─ p sm:hidden     {{copy: admin_table_scroll_hint}}
```

| Path                                             | Responsibility                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------- |
| `src/pages/AdminDashboardPage.tsx`               | Page shell, header, **the data source**, composition order. The only file the later change edits |
| `src/components/admin/RsvpSummaryCard.tsx`       | Three figures from a summary object. No derivation, no data access          |
| `src/components/admin/RsvpTable.tsx`             | The panel, the heading, the scroll region, the table shell, state precedence |
| `src/components/admin/RsvpTableRow.tsx`          | One `<tr>`: six cells and their formatting                                  |
| `src/components/admin/RsvpTableEmpty.tsx`        | The zero-rows block that replaces the table                                 |
| `src/components/admin/RsvpTableLoadingRows.tsx`  | Three placeholder `<tr>`s                                                   |
| `src/lib/mocks/rsvpListMock.ts`                  | Ten fixture records                                                         |
| `src/lib/rsvp/summarizeRsvpList.ts`              | `RsvpSummary` + `summarizeRsvpList(records)`, pure                           |
| `src/lib/formatters/rsvpDateTime.ts`             | `formatRsvpDateTime(iso)`, pure, `Intl`-based                                |
| `src/lib/schemas/rsvpSchema.ts`                  | `RsvpRecord`, `RsvpRecordRow`, `toRsvpRecord`                                |

Two structural decisions inside that table:

**`RsvpTable` owns its carved panel, the page does not.** The empty state replaces the table *inside*
the same frame, which only works if the frame belongs to the table. It also means the page never
styles a surface it does not own.

**The derivation lives outside the summary card.** `RsvpSummaryCard` takes an `RsvpSummary`, not
`RsvpRecord[]`. A later change may get the totals from a Postgres `count` or an RPC rather than by
summing an array client-side; if the card did its own summing, that change would have to rewrite the
card. The page calls `summarizeRsvpList(records)` and passes the result down.

The four-way split of the table is also what keeps each component inside ESLint's
`max-lines-per-function` of 60 and `complexity` of 8. A single `RsvpTable` holding a panel, a scroll
region, six header cells, three states and a six-cell row body would fail lint outright.

`src/lib/rsvp/` is a new directory: a sibling of `api/`, `calendar/`, `formatters/` and `schemas/`,
for RSVP logic that is neither a network call nor a string transform. `SYSTEM-DESIGN.md` §4 calls its
tree "sugerida" and the repo has already extended it three times.

### 4. Columns

**Six columns, in this order: Nome · Pessoas · WhatsApp · E-mail · Confirmado em · Status.**
`id` is never displayed.

| # | Header          | Source                              | Element              | Alignment | Min width |
| - | --------------- | ----------------------------------- | -------------------- | --------- | --------- |
| 1 | `Nome`          | `record.name`                       | `<th scope="row">`   | left      | `12rem`   |
| 2 | `Pessoas`       | `record.guestCount`                 | `<td>`               | right     | `5rem`    |
| 3 | `WhatsApp`      | `formatWhatsappNumber(whatsapp)`    | `<td>`               | left      | `9rem`    |
| 4 | `E-mail`        | `record.email`                      | `<td>`               | left      | `14rem`   |
| 5 | `Confirmado em` | `formatRsvpDateTime(createdAt)`     | `<td>`               | left      | `9rem`    |
| 6 | `Status`        | `record.status`                     | `<td>`               | left      | `7rem`    |

Order is descending usefulness to the organizer: *who* is coming, *how many* they bring, then the two
ways to reach them (WhatsApp before e-mail, because the form itself treats WhatsApp as the primary
channel), then metadata.

This departs from `SYSTEM-DESIGN.md` §5.3's "Nome, E-mail, Número de pessoas, Status" in three ways,
all deliberate:

- **WhatsApp is added**, because the column now exists and it is how the organizer will actually chase
  a guest. Omitting it would be the single most annoying gap on a phone.
- **`Confirmado em` is added.** With no sorting and no filtering, the timestamp is the only thing that
  tells the organizer *when* a confirmation arrived, which is what makes a re-visit to the page
  useful — "what's new since yesterday".
- **Status is demoted to last** rather than dropped. It carries no information today (every row reads
  `confirmado`), but dropping the column would silently hide a `cancelado` the day one exists, and
  re-adding a column later is a bigger change than narrowing one now.

**Nome is the row header** — `<th scope="row">`, not a `<td>`. It is what identifies the row to a
screen reader reading any other cell, and it justifies giving it more visual weight than its
neighbours without inventing a style.

**Every cell is `whitespace-nowrap`.** That is what makes decision 5 coherent: no wrapping means a
predictable row height and a predictable minimum table width, so horizontal scrolling is the *only*
thing that changes with viewport width. A wrapping e-mail column would produce two-line rows on a
phone and one-line rows on a desktop, and the rule between rows would stop reading as a rhythm.

### 5. At 375px: the table scrolls sideways inside a panel that does not

**Decision: the six columns are always all present. The `<table>` sits in an `overflow-x-auto`
container inside the carved panel's padding. No column is hidden at any width, and no row is
restacked as a card.**

The three options, and why the other two lose:

- **Stacked cards below `sm`.** The prettiest on a phone, and the standard answer. It is rejected on
  accessibility: turning a table into cards in CSS means `display: block` on `tr`/`th`/`td`, which
  strips the implicit table roles in several engines, so the screen reader stops announcing "column
  header: Pessoas" with the value — exactly the affordance that makes a table worth using. Restoring
  it means hand-writing `role="table" / "row" / "cell" / "columnheader"` over the whole thing, and
  duplicating every header string into a `::before` or a `data-` attribute. That is a large amount of
  fragile markup, in a component whose entire job is to be a table, for a screen the organizer opens
  a few dozen times.
- **Hiding columns below `sm`.** Cheap, and rejected on purpose: the columns that would be hidden
  (E-mail, Status, Confirmado em) include the ones the organizer most wants *on a phone*, where they
  are away from their desk and want to message someone. A dashboard that shows less on the device it
  is most used on is the wrong trade. **`dev` must not implement a hidden-column rule.**
- **Horizontal scroll.** Keeps one markup, full native table semantics, every value reachable, and no
  breakpoint-conditional rendering at all. The cost is a gesture, which is a gesture phone users
  already have.

Mechanics:

- The scroll container is **inside** the panel's padding (`px-5 py-6 sm:px-10 sm:py-8`), so the
  carved silhouette stays whole and the content never scrolls under a 255px radius corner. Same
  reasoning as the RSVP modal's `max-h-[90dvh]` on the panel rather than an inner scroll area.
- The container is `overflow-x-auto rounded-none` and carries no border of its own.
- The table is `w-full min-w-max` with `border-collapse`; the per-column `min-width`s in decision 4
  sum to roughly `56rem`, so it overflows below ~900px and sits flush at `max-w-5xl`.
- **The scroll cue cannot be the usual fade-out edge.** A mask or a `linear-gradient` to transparent
  is forbidden twice over by §4.5 (gradient *and* transparency). The replacements, both of which are
  honest woodcut answers:
  1. the header row is **cut off mid-column** at the right edge rather than ending neatly, which is
     itself the strongest cue that there is more;
  2. a written cue — `{{copy: admin_table_scroll_hint}}` — rendered below the container with
     `sm:hidden`, in `font-body text-base text-sertao-brown`, preceded by a Lucide `MoveHorizontal`
     at `size-4` with `aria-hidden`.
- **Keyboard and AT**: a scrollable region must be reachable without a pointer, so the container gets
  `role="region"`, `aria-label={{copy: admin_table_region_label}}` and `tabIndex={0}`. Its focus style
  is `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-carved-black` — an
  outline is a solid stroke, not a ring or a glow, so §4.5 is satisfied. It must **not** reuse the
  generated components' `ring-3 ring-ring/50`, which is an alpha ring.

### 6. What replaces the data-table treatment

`GUIDELINES.md` §4.5 removes the whole conventional toolkit. Element by element:

| Element         | The convention                        | Why it is out           | What this change does instead                                                                             |
| --------------- | ------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Panel           | `rounded-lg shadow-sm border`         | soft shadow             | `.carved-1 border-4 border-carved-black bg-bone-white`, `px-5 py-6 sm:px-10 sm:py-8`                          |
| Header row      | `bg-muted text-muted-foreground`      | alpha-derived fill      | no fill; `font-title text-sm uppercase tracking-wide text-sertao-brown`, cut off by `border-b-4 border-carved-black` |
| Row separators  | `border-b` hairline                   | too thin for §4.5       | `border-b-2 border-sertao-brown` on every `<tr>` but the last (`last:border-b-0`)                              |
| Zebra striping  | `odd:bg-muted/50`                     | transparency, and there is no third opaque surface colour | **none.** The rule between rows plus `py-3` row breathing carries the rhythm             |
| Row hover       | `hover:bg-muted/50`                   | transparency            | **none.** Nothing in the table is clickable; a hover tint promises an interaction that does not exist          |
| Skeleton        | `animate-pulse bg-muted`              | animates opacity        | static solid `bg-sertao-brown` bars — decision 7                                                              |
| Scroll edge     | gradient mask                         | gradient + transparency | a cut-off header and a written hint — decision 5                                                              |
| Status badge    | coloured pill                         | off-palette colour      | plain `font-title text-sm uppercase tracking-wide text-sertao-brown` text, no box, no colour map              |

Cells: `font-body text-lg text-carved-black px-4 py-3 align-middle`. `text-lg` is a floor, not a
preference — Caveat runs small and this table is mostly e-mails and digits. The `Nome` `<th>` is
`text-xl` and keeps the same colour, so the row's identity reads first without introducing a weight
the font may not have.

`Pessoas` is right-aligned (header included) with `tabular-nums`, so ten values can be compared down
the column. It renders the bare numeral — the column header supplies the noun, and a screen reader
pairs them automatically.

**Panel silhouette, and the §5.3 anti-repeat rule.** The summary card is `.carved-2` and the table
panel is `.carved-1`; they are vertically adjacent and must not share a silhouette. Neither is
`.carved-3`, which stays reserved for the `xilo` button so a panel is never mistaken for something
pressable.

**One thing for QA to actually look at**: `.carved-1`'s `255px`/`225px` radii were authored for the
invite's `max-w-md`/`max-w-xl` panels. On a `max-w-5xl` panel the same corner is a much larger belly
and may crowd the first header cell and the last row. If it does, the fallback is `.carved-3` on the
table panel (`125px 20px 140px 25px`, materially shallower) and `.carved-1` on the summary card, so
the pair still differs. That is a one-class change and it is explicitly allowed without a new spec.

### 7. State precedence: loading, empty, rows

`RsvpTable` takes `{ records: RsvpRecord[]; isLoading?: boolean }` and resolves in this order:

1. `isLoading` → the panel, the heading and the **full header row**, plus three placeholder rows.
2. `records.length === 0` → the panel and the heading, and `RsvpTableEmpty` **instead of** the table.
3. otherwise → the table with one `RsvpTableRow` per record.

A future error state slots in front of all three, as a fourth branch in the same place. It is not
built here because there is nothing that can fail.

**Loading keeps the header row and shows solid bars.** The conventional skeleton — `animate-pulse`,
which animates `opacity` between 1 and 0.5 — is forbidden by §4.5's ban on transparency, and there is
no "light grey" in a three-colour palette to make a resting skeleton out of. So the placeholder is
what a woodcut would actually print: a **solid `bg-sertao-brown` bar**, `h-4`, `rounded-none`, at a
different width per column (`w-32`, `w-8`, `w-28`, `w-40`, `w-24`, `w-20`), with **no animation at
all**. Three rows, because three is enough to read as "a list is coming" without pretending to know
how long it is. Keeping the real header row means nothing jumps when the data lands.

The loading block carries `aria-busy="true"` on the scroll region and an `sr-only` line
`{{copy: admin_table_loading}}`, so a screen reader is told rather than left reading empty bars.

**Empty replaces the table entirely.** A header row over nothing is the classic "is this broken?"
state, and with zero rows there is no data for the column headers to describe. `RsvpTableEmpty`
renders, centred inside the panel with `py-12`: a Lucide `Users` icon at `size-8 text-sertao-brown`
and `aria-hidden`, then `{{copy: admin_empty_title}}` in `font-title text-2xl text-carved-black`,
then `{{copy: admin_empty_hint}}` in `font-body text-lg text-sertao-brown`.

`isLoading` is optional and defaults to `false`. `AdminDashboardPage` passes it explicitly anyway —
a literal `false` beside the mock import is a visible seam, and the later change replaces both lines
together.

### 8. The summary card

**Above the table, full width, `.carved-2`.** Above, because the organizer's first question is "how
many are coming" and the table answers "who"; and because on a phone the summary is the cheapest
thing to read, so burying it under ten scrollable rows would waste it.

Three figures, left to right (stacked at `<sm`, a three-column grid from `sm` up, separated by
`border-b-2 border-sertao-brown` when stacked and `sm:border-b-0 sm:border-r-2` when in a row, with
the last one carrying neither):

| Figure                 | Value                                      | Empty value |
| ---------------------- | ------------------------------------------ | ----------- |
| `{{copy: admin_summary_confirmations_label}}` | `summary.confirmationCount` — the number of records | `0`  |
| `{{copy: admin_summary_guests_label}}`        | `summary.guestTotal` — the sum of every `guestCount` | `0`  |
| `{{copy: admin_summary_last_label}}`          | `formatRsvpDateTime(summary.lastConfirmationAt)`     | `—`  |

- The two counts render in `font-title text-4xl sm:text-5xl text-carved-black`; their labels in
  `font-title text-sm uppercase tracking-wide text-sertao-brown`, matching `EventDetails`'s `FactRow`
  exactly so the two pages read as one system.
- The third figure is a 16-character date string, not a numeral, so it renders at `text-2xl` in
  `font-body`. The asymmetry is deliberate: two headline numbers and one supporting fact is the
  correct hierarchy, and forcing a date to `text-5xl` would wrap at 375px.
- The card renders with zeros when there are no records — it does not hide itself, so nothing on the
  page moves between the empty and populated states.
- No icons. `EventDetails` uses them to distinguish three unlike facts; here the three figures are
  already distinguished by their labels, and three more Lucide glyphs would be decoration.

`summarizeRsvpList(records: RsvpRecord[]): RsvpSummary` is pure and lives in
`src/lib/rsvp/summarizeRsvpList.ts`:

```ts
export interface RsvpSummary {
  confirmationCount: number;
  guestTotal: number;
  lastConfirmationAt: string | null;
}
```

`lastConfirmationAt` is the **maximum** `createdAt`, computed by comparison rather than by trusting
the array's order — the source order is a rendering decision (decision 9) and the summary must not
break if it changes. It is `null` for an empty list, and the card renders `—`. `guestTotal` sums
`guestCount`, which is what §5.3 of `SYSTEM-DESIGN.md` means by "soma de `numero_pessoas`".

### 9. Formatting, for a Brazilian reader

**`guestCount`** renders as a bare numeral: `1`, `4`, `10`. No "pessoas" suffix — the column header
already says it, and repeating the noun ten times down a column is noise. `tabular-nums` on the cell.

**`createdAt`** renders as `27/09/2026 11h30` — `dd/MM/yyyy` then the time in the house style the
invite already uses (`EventDetails` writes `11h30`, not `11:30`). New pure module
`src/lib/formatters/rsvpDateTime.ts`:

```ts
export function formatRsvpDateTime(isoDate: string): string;
```

- Built on `Intl.DateTimeFormat('pt-BR', …)` with **explicit** `day: '2-digit'`, `month: '2-digit'`,
  `year: 'numeric'` — not `dateStyle: 'short'`, which yields a two-digit year (`27/09/26`) in
  `pt-BR` and is genuinely ambiguous next to a two-digit day.
- `timeZone: 'America/Sao_Paulo'` is passed explicitly. "When they confirmed" means Brazil time
  regardless of where the organizer's laptop thinks it is.
- Time is formatted `hour: '2-digit', minute: '2-digit', hour12: false` and joined as `11h30`.
- **It never throws.** An unparseable or empty value returns `'—'`, checked with
  `Number.isNaN(parsed.getTime())`. The organizer seeing a dash beats a blank dashboard.
- No date library. `Intl` is in every browser this app targets, and adding `date-fns` for one format
  string would be a dependency the project does not otherwise need.

**`whatsapp`** renders as `formatWhatsappNumber(record.whatsapp)` — **yes, it reuses the existing
formatter**, and the reason is not cosmetic. The value stored today is already masked (the form
validates the masked string and inserts it unchanged), so the call is a no-op on current data. But
the guest-form design flagged digit normalisation for the database as an open follow-up; the day rows
arrive as `83987654321`, the table renders them correctly with no change. `formatWhatsappNumber`
strips non-digits before reformatting, so it is idempotent and safe on both shapes. Calling it costs
nothing and removes a future defect.

**`status`** renders verbatim from the record. It is already Portuguese (`confirmado`), it comes from
the database, and there is deliberately **no** status-to-label map and no per-status styling: with
one possible value, a map would be speculative structure.

**`email`** renders verbatim, `whitespace-nowrap`, no truncation and no `title` tooltip. An
address the organizer cannot read in full is useless, and the column scrolls.

### 10. Sorting and filtering: out of scope, stated so `dev` does not build it

**No sortable headers, no search input, no status filter, no date range, no pagination, no "showing
10 of N".** `PROJECT.md` expects roughly 30 records for the whole event. Every row fits on one screen
after one scroll; a filter would be chrome over a list short enough to read.

The one ordering decision that **is** in scope: `RsvpTable` renders rows in the order the array gives
them, with no client-side sort, and the mock is authored **newest first**. That matches
`.order('created_at', { ascending: false })`, which is what the later hook should use. Note that
`SYSTEM-DESIGN.md` §5.2 currently specifies `.order('created_at')` — ascending — which would put the
oldest confirmation at the top of a growing list. Flagged, owned by the Supabase read change; nothing
here depends on it, because the table does not sort.

### 11. Accessibility

- A real `<table>`: `<caption>`, `<thead>`, `<tbody>`, `<th scope="col">` on all six headers,
  `<th scope="row">` on every row's Nome cell. No ARIA grid roles — the native ones are better.
- **The caption is `sr-only`, and the visible title is an `<h2>` outside the scroll container.** The
  caption belongs to the table, so a visible one would slide out of view as the table scrolls
  sideways. An `sr-only` caption gives assistive technology the proper association while the visible
  heading stays put.
- The scroll container: `role="region"`, `aria-label`, `tabIndex={0}`, and a visible
  `focus-visible:outline` (decision 5). Without `tabIndex` a keyboard-only user cannot scroll it at
  all.
- What a screen reader announces, and what `dev` and QA check against: entering the region announces
  its label; entering the table announces the caption sentence and "6 columns"; arrowing across a row
  announces each cell prefixed by its column header, and the row's name as the row header — so cell 4
  of row 3 reads roughly "E-mail, maria@exemplo.com, Maria das Graças".
- Every icon is `aria-hidden` (`Users` in the empty state, `MoveHorizontal` in the scroll hint) and
  never the sole carrier of meaning; each sits beside text.
- Loading: `aria-busy="true"` on the region plus an `sr-only` `{{copy: admin_table_loading}}`. No
  `aria-live` in this change — nothing changes asynchronously yet, and a live region with no updates
  is dead code for the later change to wire.
- The page has exactly one `<h1>` (the page title) and one `<h2>` (the table heading). The summary
  card's three labels are `<p>`, not headings — they label values, they do not open sections.
- Colour is never the only cue anywhere on the page, which is free here: there are three colours and
  none of them encodes a state.

### 12. Not adding the shadcn `table` component

**Decision: hand-roll the markup. `yarn shadcn add table` is NOT run and `src/components/ui/` gains
no file.**

`AGENTS.md`'s pitfall says *"add shadcn components with the CLI so they land in
`src/components/ui/`"* — that governs **how** to bring one in, not that one must be used. Three
reasons not to here:

1. **It carries no behaviour and no accessibility wiring.** `form.tsx` was worth adding because
   `FormField`/`FormControl`/`FormMessage` wire `aria-describedby` and `aria-invalid` automatically —
   real logic. shadcn's `table.tsx` is a set of thin styled wrappers over `<table>`, `<tr>`, `<td>`;
   it is not a Radix primitive and there is nothing to inherit. Everything this spec needs for
   accessibility (`sr-only` caption, `scope="row"`, a labelled focusable region) is hand-written
   either way.
2. **Almost every default it ships is forbidden here.** `TableRow` has `hover:bg-muted/50` and
   `data-[state=selected]:bg-muted`; `TableHead` has `text-muted-foreground`; `TableCaption` and
   `TableFooter` have `bg-muted/50`. Those are alpha fills, banned by §4.5. Neutralising them means a
   call-site override on *every* element of *every* row — more code than the elements themselves.
3. **Its wrapper `div` fights decision 5.** `Table` renders its own `overflow-x-auto` container with
   no `role`, no `aria-label` and no `tabIndex`, and it is not the element this spec needs the region
   attributes on.

So the cost/benefit inverts relative to `input`/`label`/`form`: there, the CLI bought real wiring at
the price of some overrides; here it would buy nothing and cost overrides on every cell. This is a
reasoned exception, recorded so a later reader does not "fix" it by running the CLI.

### 13. Not in scope, restated so `dev` does not drift into it

No `supabase` import in any touched file. No call to `useRsvpList` — the stub stays exactly as it is.
No change to `ProtectedRoute`, `useSession`, `LoginForm` or `AdminLoginPage`. No sign-out button. No
Framer Motion anywhere on this page. No `wa.me` link. No row click, no detail view, no row selection.
No `.svg`, no new token, no new `globals.css` utility, no new dependency, no edit inside
`src/components/ui/`.

## Risks / Trade-offs

- **[Risk] `/admin` is not actually protected.** `ProtectedRoute` deliberately does not redirect yet
  (`AGENTS.md` pitfall), so this layout is publicly reachable. → **Mitigation**: it renders fixture
  data only; the exposure becomes real the moment the Supabase read lands, which is why the auth
  change should land before or with it. Called out in proposal.md with an owner.
- **[Risk] Caveat is a handwriting face rendering e-mails, phone numbers and timestamps.** This is
  the single biggest legibility risk on the page and no amount of layout fixes it. → **Mitigation**:
  a `text-lg` floor on every cell, `tabular-nums` on the numeric column, generous `py-3`, and an
  explicit QA task to read the table on a phone. If it fails, the fix is a new type role in the
  design system — the designer's call, not this change's.
- **[Trade-off] Horizontal scroll over stacked cards.** Cards read better on a phone; the table keeps
  native semantics and hides nothing. → Accepted, with the reasoning in decision 5. If review
  disagrees, the change is contained to `RsvpTable` + `RsvpTableRow`, but it also drags in the ARIA
  role duplication described there.
- **[Risk] The scroll affordance is weaker than the gradient everyone expects.** A cut-off header and
  a written hint are honest but quieter. → **Mitigation**: the hint is visible below `sm`, where the
  overflow always happens; QA checks that someone who has not seen the desktop view finds the other
  columns. The forbidden alternative is not available at any price.
- **[Risk] `.carved-1` on a `max-w-5xl` panel may crowd the header row and the last row.** The radii
  were authored for much narrower panels. → **Mitigation**: generous padding, a QA check at desktop
  width, and a pre-authorised one-class fallback to `.carved-3` (with the summary card taking
  `.carved-1`) so the adjacent pair still differs.
- **[Trade-off] No zebra striping and no hover row.** Tracking a value across six columns is harder
  without them, especially in a handwriting face. → Accepted: both conventions are alpha fills and
  the palette has no third surface colour. The `border-b-2 border-sertao-brown` rule plus row padding
  is the replacement, and it reuses the ruled-line language the forms already established. QA checks
  at 375px that a row still reads as one row after scrolling sideways.
- **[Trade-off] The Status column shows ten identical values.** It looks like wasted width today. →
  Accepted: it is last, it is the narrowest real column, and dropping it would hide the first
  `cancelado` that ever appears.
- **[Risk] `toRsvpRecord` is written but never called in this change.** Dead-ish code can be deleted
  by a later cleanup that does not know why it exists. → **Mitigation**: a docblock saying which
  change consumes it, and it sits directly beside `toRsvpRow`, whose symmetry makes the intent
  obvious.
- **[Risk] The fixture could ship.** A mock array that renders real-looking guests is exactly the
  thing that survives into production. → **Mitigation**: it lives in an obviously named
  `src/lib/mocks/` directory, is imported by exactly one file, and its removal is a named task in the
  Supabase change. Names are clearly fictitious.
- **[Trade-off] `formatRsvpDateTime` returns `'—'` instead of throwing on bad input.** A malformed
  timestamp becomes invisible rather than loud. → Accepted: this is a read-only dashboard the
  organizer glances at; one unreadable cell must not take down the page. The value is never used for
  logic, only display.
- **[Risk] Pinning `timeZone: 'America/Sao_Paulo'` is wrong if the organizer is abroad and reasons in
  local time.** → Accepted: "confirmed at 23h" should mean 23h where the party is. Stated here so the
  choice is visible rather than incidental.

## Open Questions

- **Should the WhatsApp cell be a `wa.me` link?** Decided as "plain text, this change", because it is
  an interaction the caller did not ask for and it forces a link-styling decision the design system
  has no answer for yet. The organizer will almost certainly want it; raised so the caller can pull
  it forward.
- **Should Status be a column at all while it has one value?** Decided as "keep it, last". The
  alternative — drop it and add it back when a second status exists — is defensible and would buy
  `7rem` of the scroll budget.
- **Is `.carved-1` right for a panel this wide?** Decided as "yes, with `.carved-3` pre-authorised as
  the fallback after QA looks at it on a desktop". A designer's eye beats this document here.
- **Are the six column headers copy or structure?** Treated as **fixed structural labels written in
  this spec** (`Nome`, `Pessoas`, `WhatsApp`, `E-mail`, `Confirmado em`, `Status`), the same category
  as `EventDetails`'s shipped `Data` / `Horário` / `Local`. They have a hard width budget and carry no
  voice. If the caller would rather the copy writer own them, each becomes a slot with a
  ≤ 14-character cap.

## Content slots for the copy writer

Every slot is pt-BR, and `dev` renders the `{{copy: …}}` marker **verbatim** so the copy writer can
find it. Strings **not** listed here are fixed structure and are written exactly as shown: the six
column headers `Nome`, `Pessoas`, `WhatsApp`, `E-mail`, `Confirmado em`, `Status`, and the em-dash
`—` used for an absent value.

| Slot                                          | Must communicate                                                                                     | Length              | Tone                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| `{{copy: admin_page_title}}`                  | That this page is the organizer's list of who has confirmed                                          | ≤ 4 words           | Cordel Arcade, but plainer than the invite — this is a tool, not a celebration            |
| `{{copy: admin_page_subtitle}}`               | Whose party and when, so the organizer knows at a glance which event this is                         | ≤ 12 words          | Factual, warm, one line                                                                  |
| `{{copy: admin_summary_confirmations_label}}` | That the figure is how many confirmation records exist                                               | ≤ 2 words           | A column-label register: short, uppercase-ready, no verb                                 |
| `{{copy: admin_summary_guests_label}}`        | That the figure is how many people are coming in total, not how many forms were filled               | ≤ 3 words           | Same register; the distinction from the previous label must survive being read fast      |
| `{{copy: admin_summary_last_label}}`          | That the value is when the most recent confirmation arrived                                          | ≤ 3 words           | Same register                                                                            |
| `{{copy: admin_table_heading}}`               | The visible `<h2>` over the table: that what follows is every confirmation, one per line             | ≤ 4 words           | Same register as the page title, one step quieter                                        |
| `{{copy: admin_table_caption}}`               | The `sr-only` caption: a full sentence naming what the table lists and what its columns describe     | ≤ 20 words          | A complete spoken sentence — it is heard, never seen. Not a fragment                      |
| `{{copy: admin_table_region_label}}`          | The scrollable region's accessible name, distinct from the caption so the two are not heard as a stutter | ≤ 6 words       | Plain, functional                                                                        |
| `{{copy: admin_table_scroll_hint}}`           | That there are more columns to the right and the table can be dragged sideways — shown only on phones | ≤ 8 words          | Helpful, not apologetic. It is an instruction, not a warning                              |
| `{{copy: admin_table_loading}}`               | The `sr-only` line announcing that confirmations are being loaded                                    | ≤ 6 words           | Neutral status text                                                                      |
| `{{copy: admin_empty_title}}`                 | That nobody has confirmed yet — a state, not an error, and not the organizer's fault                 | ≤ 6 words           | Calm and light; a 50th birthday with no RSVPs yet is normal, not alarming                |
| `{{copy: admin_empty_hint}}`                  | What will happen: confirmations appear here as guests fill the invite                                | ≤ 14 words          | Reassuring, forward-looking, one sentence                                                |
