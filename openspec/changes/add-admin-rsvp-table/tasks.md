## 1. Prerequisites and scope check

- [ ] 1.1 Read `design.md` decisions 5, 6 and 12 before writing any markup — the narrow-screen
      behaviour, the list of forbidden data-table devices and their replacements, and the reason the
      shadcn `table` component is **not** added
- [ ] 1.2 Confirm **no new dependency is needed**: the two icons (`Users`, `MoveHorizontal`) come from
      the installed `lucide-react`, and date formatting uses the platform's `Intl` — no date library
- [ ] 1.3 Do **not** run `yarn shadcn add table`. `src/components/ui/` gains no file in this change;
      the table markup is hand-rolled (design.md decision 12). Record the reason in the PR description
      so a later reader does not "fix" it
- [ ] 1.4 Confirm `src/hooks/useRsvpList.ts`, `useSession.ts`, `ProtectedRoute.tsx`, `LoginForm.tsx`
      and `AdminLoginPage.tsx` are **not** touched by any task below

## 2. Types and the data seam (`src/lib/schemas/rsvpSchema.ts`)

- [ ] 2.1 Add `RsvpRecordRow`, extending the existing `RsvpRow` with `id: string`, `status: string`
      and `created_at: string` — the Supabase row exactly as the table is defined (`id uuid`,
      `status text default 'confirmado'`, `created_at timestamptz`)
- [ ] 2.2 Add `RsvpRecord`, the English view model the presentation consumes:
      `id`, `name`, `email`, `whatsapp`, `guestCount`, `status`, `createdAt`. Keep `status` as
      `string` (the column is free text with no check constraint — a union would need an `as` cast)
      and `createdAt` as `string` (the ISO text Supabase returns, not a `Date`)
- [ ] 2.3 Add `toRsvpRecord(row: RsvpRecordRow): RsvpRecord`, directly beside the existing
      `toRsvpRow`, so the read-side and write-side mappings sit together as the one documented place
      the Portuguese column names appear
- [ ] 2.4 Give `toRsvpRecord` a docblock saying it is written here for the change that adds the
      Supabase read (`data.map(toRsvpRecord)`) and is deliberately not called yet — it is exported, so
      `no-unused-vars` does not fire, and it must not be deleted as dead code

## 3. Fixture (`src/lib/mocks/rsvpListMock.ts`)

- [ ] 3.1 Create `src/lib/mocks/` — a new sibling of `src/lib/api/`, `calendar/`, `formatters/` and
      `schemas/`, named so the later change can find and delete it in one step
- [ ] 3.2 Export exactly one binding: `const rsvpListMock: RsvpRecord[]`. A plain array — not a
      function, not a hook, no `useState`, no `setTimeout`
- [ ] 3.3 Write ten records with **hand-written, stable UUID-shaped `id` strings**. Do not call
      `crypto.randomUUID()` — a new id per render breaks React key stability and makes the module's
      diff meaningless
- [ ] 3.4 Make the ten exercise the layout, not just fill it: one four-part Brazilian name long enough
      to be the widest cell on the page, one e-mail of roughly 35 characters, one `guestCount` of `10`
      (the schema ceiling, two digits) and at least one of `1`, and `createdAt` values spread over
      several days **including a month boundary** so the date column visibly varies
- [ ] 3.5 Write every `createdAt` as ISO 8601 **with an explicit offset**
      (`'2026-09-10T14:32:00-03:00'`), so the formatter's timezone handling is actually exercised
- [ ] 3.6 Write every `whatsapp` in the masked shape `83 9 8765-4321`, matching what the shipped form
      validates and inserts
- [ ] 3.7 Give all ten `status: 'confirmado'` — nothing writes any other value today. You may flip one
      temporarily to eyeball the column, but commit all ten as `confirmado`
- [ ] 3.8 Order the array **newest confirmation first**, matching the
      `.order('created_at', { ascending: false })` the later hook should use
- [ ] 3.9 Use plausibly Brazilian but clearly fictitious names, and add a docblock: fixture data,
      imported only by `AdminDashboardPage`, deleted by the change that adds the Supabase read

## 4. Pure helpers

- [ ] 4.1 Create `src/lib/formatters/rsvpDateTime.ts` exporting one pure function,
      `formatRsvpDateTime(isoDate: string): string` — no React import, no side effect
- [ ] 4.2 Build it on `Intl.DateTimeFormat('pt-BR', …)` with **explicit** `day: '2-digit'`,
      `month: '2-digit'`, `year: 'numeric'` — **not** `dateStyle: 'short'`, which yields a two-digit
      year (`27/09/26`) in `pt-BR` and is ambiguous next to a two-digit day
- [ ] 4.3 Pass `timeZone: 'America/Sao_Paulo'` explicitly, and format the time with
      `hour: '2-digit', minute: '2-digit', hour12: false`, joined as `11h30` — the house style
      `EventDetails` already uses, not `11:30`. Output shape: `27/09/2026 11h30`
- [ ] 4.4 Return `'—'` for an empty or unparseable value (check with
      `Number.isNaN(parsed.getTime())`). The function **never throws**: one bad timestamp must not
      take down the dashboard
- [ ] 4.5 Create `src/lib/rsvp/summarizeRsvpList.ts` exporting `RsvpSummary`
      (`confirmationCount: number`, `guestTotal: number`, `lastConfirmationAt: string | null`) and a
      pure `summarizeRsvpList(records: RsvpRecord[]): RsvpSummary`
- [ ] 4.6 Compute `lastConfirmationAt` as the **maximum** `createdAt` by comparison, not by reading
      `records[0]` — the source order is a rendering decision and the summary must survive it
      changing. Return `null` for an empty list
- [ ] 4.7 Compute `guestTotal` as the sum of `guestCount` and `confirmationCount` as the number of
      records; keep both inside ESLint's `complexity` max of 8 with identifiers of 3+ characters

## 5. `RsvpSummaryCard` (`src/components/admin/RsvpSummaryCard.tsx`)

- [ ] 5.1 Replace the stub. Props are a local `interface RsvpSummaryCardProps { summary: RsvpSummary }`
      — the card is **presentational**: it does no summing, no data access and takes no
      `RsvpRecord[]`, so a later change that gets totals from a Postgres `count` does not rewrite it
- [ ] 5.2 Frame it as `carved-2 border-4 border-carved-black bg-bone-white`, full width, with padding
      in the `px-5 py-6 sm:px-8 sm:py-8` range. `.carved-2` is chosen so it does not repeat the table
      panel's `.carved-1` (GUIDELINES §5.3) and is not `.carved-3`, reserved for buttons
- [ ] 5.3 Lay the three figures out stacked below `sm` and as a three-column grid from `sm` up.
      Separate them with `border-b-2 border-sertao-brown` when stacked and
      `sm:border-b-0 sm:border-r-2 sm:border-sertao-brown` when in a row, with the last carrying
      neither
- [ ] 5.4 Render the two counts in `font-title text-4xl sm:text-5xl text-carved-black`, over labels in
      `font-title text-sm uppercase tracking-wide text-sertao-brown` — the exact treatment
      `EventDetails`'s `FactRow` already ships, so the two pages read as one system
- [ ] 5.5 Render the third figure (`formatRsvpDateTime(summary.lastConfirmationAt)`) at `text-2xl` in
      `font-body`, not at the headline size — it is a 16-character date string and would wrap at 375px
- [ ] 5.6 Show `0`, `0` and `—` when the list is empty; the card renders in that case rather than
      hiding itself, so nothing on the page moves between the empty and populated states
- [ ] 5.7 Use the three labels `{{copy: admin_summary_confirmations_label}}`,
      `{{copy: admin_summary_guests_label}}` and `{{copy: admin_summary_last_label}}` verbatim as
      `<p>` elements — **not** headings; they label values, they do not open sections
- [ ] 5.8 Add no icons. `EventDetails` uses them to tell three unlike facts apart; here the labels
      already do that and three more glyphs would be decoration

## 6. `RsvpTableRow` (`src/components/admin/RsvpTableRow.tsx`)

- [ ] 6.1 Create it with a local `interface RsvpTableRowProps { record: RsvpRecord }`, rendering one
      `<tr>` with six cells in the order Nome · Pessoas · WhatsApp · E-mail · Confirmado em · Status.
      It exists as its own file so `RsvpTable` stays inside `max-lines-per-function` (60)
- [ ] 6.2 Render the name cell as `<th scope="row">`, not a `<td>` — it is what identifies the row to a
      screen reader reading any other cell — at `font-body text-xl text-carved-black`, left-aligned
- [ ] 6.3 Render the other five as `<td>` at `font-body text-lg text-carved-black`, `px-4 py-3`,
      `align-middle`. `text-lg` is a **floor**: Caveat runs small and this table is mostly e-mails and
      digits
- [ ] 6.4 Give every cell `whitespace-nowrap` — no wrapping is what makes the horizontal-scroll
      decision coherent, keeping row height and minimum table width predictable at every viewport
- [ ] 6.5 Right-align the Pessoas cell with `tabular-nums` and render the bare numeral, no "pessoas"
      suffix — the column header supplies the noun and a screen reader pairs them automatically
- [ ] 6.6 Render the WhatsApp cell as `formatWhatsappNumber(record.whatsapp)`, reusing the existing
      formatter. It is a no-op on today's already-masked values and idempotent, so rows written after
      any future digit normalisation still display correctly
- [ ] 6.7 Render the Confirmado em cell as `formatRsvpDateTime(record.createdAt)`
- [ ] 6.8 Render the Status cell verbatim from `record.status` in
      `font-title text-sm uppercase tracking-wide text-sertao-brown`. Build **no** status-to-label map,
      no badge, no pill, no per-status colour — there is exactly one possible value today
- [ ] 6.9 Separate rows with `border-b-2 border-sertao-brown` and `last:border-b-0`. Add **no**
      `odd:`/`even:` striping and **no** `hover:` treatment: both conventions are alpha fills
      (GUIDELINES §4.5) and nothing in the table is clickable

## 7. `RsvpTableLoadingRows` and `RsvpTableEmpty`

- [ ] 7.1 Create `src/components/admin/RsvpTableLoadingRows.tsx` rendering three placeholder `<tr>`s
      with the same cell padding and row rule as a real row
- [ ] 7.2 Make each placeholder cell a **solid** `bg-sertao-brown h-4 rounded-none` bar at a different
      width per column (`w-32`, `w-8`, `w-28`, `w-40`, `w-24`, `w-20`). **No `animate-pulse`** — it
      animates `opacity`, which §4.5 forbids — and no shimmer, fade or partial opacity of any kind
- [ ] 7.3 Create `src/components/admin/RsvpTableEmpty.tsx`: centred inside the panel with `py-12`, a
      Lucide `Users` at `size-8 text-sertao-brown` with `aria-hidden`, then
      `{{copy: admin_empty_title}}` in `font-title text-2xl text-carved-black`, then
      `{{copy: admin_empty_hint}}` in `font-body text-lg text-sertao-brown`
- [ ] 7.4 Do not present the empty state as an error and do not add a retry button or any other
      control — nobody having confirmed yet is a normal state, not a failure

## 8. `RsvpTable` (`src/components/admin/RsvpTable.tsx`)

- [ ] 8.1 Replace the stub. Props are a local
      `interface RsvpTableProps { records: RsvpRecord[]; isLoading?: boolean }`, `isLoading`
      defaulting to `false`
- [ ] 8.2 **`RsvpTable` owns the carved panel, not the page**: `carved-1 border-4 border-carved-black
bg-bone-white`, `px-5 py-6 sm:px-10 sm:py-8`. The empty state replaces the table *inside* this same
      frame, which only works if the frame lives here
- [ ] 8.3 Render the visible `<h2>` `{{copy: admin_table_heading}}` **outside** the scroll container,
      in `font-title`, so it does not slide out of view when the table is scrolled sideways
- [ ] 8.4 Wrap the `<table>` in a `div` with `overflow-x-auto rounded-none`, `role="region"`,
      `aria-label={{copy: admin_table_region_label}}` and `tabIndex={0}` — without `tabIndex` a
      keyboard-only user cannot scroll it at all. The container sits **inside** the panel's padding so
      content never scrolls under a carved corner
- [ ] 8.5 Give the container `focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-carved-black`. Do **not** reuse the generated components' `ring-3 ring-ring/50`
      — that is an alpha ring, forbidden by §4.5. An outline is a solid stroke and is fine
- [ ] 8.6 Render `<table className="w-full min-w-max border-collapse">` with a `<caption
className="sr-only">{{copy: admin_table_caption}}</caption>`. The caption is sr-only because it
      belongs to the table and a visible one would scroll out of view; the `<h2>` from 8.3 is the
      visible title
- [ ] 8.7 Render `<thead>` with six `<th scope="col">` — the fixed strings `Nome`, `Pessoas`,
      `WhatsApp`, `E-mail`, `Confirmado em`, `Status`, in that order — styled
      `font-title text-sm uppercase tracking-wide text-sertao-brown`, `px-4 py-3`, left-aligned except
      `Pessoas` which is right-aligned to match its cells
- [ ] 8.8 Give the header row `border-b-4 border-carved-black` — heavier than the `border-b-2` between
      data rows — and **no background fill**: `bg-muted` is alpha-derived and there is no third opaque
      surface colour
- [ ] 8.9 Apply per-column minimum widths so the table overflows predictably rather than squashing:
      Nome `12rem`, Pessoas `5rem`, WhatsApp `9rem`, E-mail `14rem`, Confirmado em `9rem`, Status
      `7rem` (≈ `56rem` total)
- [ ] 8.10 Implement state precedence in exactly this order: `isLoading` → panel + heading + header row
      + `RsvpTableLoadingRows`; else `records.length === 0` → panel + heading + `RsvpTableEmpty`
      **instead of** the table; else the table with one `RsvpTableRow` per record, keyed on `record.id`
- [ ] 8.11 While loading, set `aria-busy="true"` on the region and render an `sr-only`
      `{{copy: admin_table_loading}}`. Add **no** `aria-live` — nothing updates asynchronously yet,
      and an empty live region is dead code for the later change to wire
- [ ] 8.12 Render the scroll hint below the container with `sm:hidden`:
      `{{copy: admin_table_scroll_hint}}` in `font-body text-base text-sertao-brown`, preceded by a
      Lucide `MoveHorizontal` at `size-4` with `aria-hidden`. This replaces the conventional
      fade-out edge, which is a gradient **and** a transparency and is forbidden twice over
- [ ] 8.13 Do **not** implement a hidden-column rule, a card-stacked mobile variant, a sticky first
      column, sorting, filtering, search or pagination. All six columns are present at every width
- [ ] 8.14 Keep `RsvpTable` inside `max-lines-per-function` (60) and `complexity` (8) by leaving the
      row, the loading rows and the empty block in their own files — do not inline them back

## 9. `AdminDashboardPage` (`src/pages/AdminDashboardPage.tsx`)

- [ ] 9.1 Replace the placeholder string. Inside `PageWrapper`, render a `<header>` and a `<main>`
      wrapped in `mx-auto w-full max-w-5xl py-8 sm:py-12 flex flex-col gap-8` — `PageWrapper` supplies
      only `px-4`, `min-h-dvh` and a column gap
- [ ] 9.2 Render the page's single `<h1>` with the existing `Title` component:
      `{{copy: admin_page_title}}`, followed by `{{copy: admin_page_subtitle}}` in
      `font-body text-xl text-carved-black`
- [ ] 9.3 Make this the **only** file that knows where data comes from: import `rsvpListMock`, and
      declare the source as a visible seam — the records, plus an explicit `isLoading` of literal
      `false` passed to `RsvpTable`. The later Supabase change replaces exactly these lines
- [ ] 9.4 Call `summarizeRsvpList(records)` here and pass the result to `RsvpSummaryCard` — the
      derivation is the page's job, never the card's
- [ ] 9.5 Compose in order: header, `RsvpSummaryCard`, `RsvpTable`. The summary is above the table in
      both visual and document order
- [ ] 9.6 Add **no** sign-out button, no navigation, no link to `/admin/login`, no session read. A
      control that cannot work yet is worse than no control
- [ ] 9.7 Add **no** Framer Motion and no `useReducedMotion`: the dashboard is a tool the organizer
      reloads repeatedly, and there is no motion on the page to reduce
- [ ] 9.8 Update the file's existing `TODO` docblock to say what is now true — it composes
      `RsvpSummaryCard` and `RsvpTable` against a fixture, and the remaining TODO is the Supabase read

## 10. Scope guard

- [ ] 10.1 Verify **no touched file imports `supabase`**, calls `useRsvpList`, reads a session, or
      issues any network request
- [ ] 10.2 Verify `ProtectedRoute.tsx`, `useSession.ts`, `useRsvpList.ts`, `LoginForm.tsx` and
      `AdminLoginPage.tsx` are unchanged
- [ ] 10.3 Verify `src/components/ui/` gained no file and none of its files was hand-edited, and that
      `package.json` and `yarn.lock` are unchanged
- [ ] 10.4 Verify no new `.svg`/`.png` asset, no new design token, no new `globals.css` utility, and no
      literal HEX colour anywhere in the touched files
- [ ] 10.5 Search the touched files for `gradient`, `shadow`, `blur`, `animate-pulse`, `opacity` and
      `/50` and verify every hit is absent or justified — §4.5 forbids all of them
- [ ] 10.6 Verify no presentation component (page, table, row, empty state, summary card) contains a
      Portuguese identifier: no `nome`, no `numero_pessoas`, no `created_at`. The mapping lives only in
      `rsvpSchema.ts`
- [ ] 10.7 Verify every `{{copy: …}}` marker is rendered verbatim so the copy writer can find it, and
      that the fixed strings are written exactly: `Nome`, `Pessoas`, `WhatsApp`, `E-mail`,
      `Confirmado em`, `Status`, and `—` for an absent value

## 11. Verification

- [ ] 11.1 With the fixture in place, verify the table shows ten rows, six columns, in the mock's
      order, with no sort, filter, search or pagination control anywhere on the page
- [ ] 11.2 Verify the formatting by hand: a guest count renders as a bare right-aligned numeral, a
      timestamp renders as `10/09/2026 14h32`, an unformatted WhatsApp value renders as
      `83 9 8765-4321`, a malformed timestamp renders `—` without throwing, and a long e-mail renders
      in full on one line
- [ ] 11.3 Verify `formatRsvpDateTime` is timezone-stable: change the OS timezone (or run with
      `TZ=UTC`) and confirm the same record still renders the same Brazil-time string
- [ ] 11.4 Verify the summary: the count matches the number of rows, the people total matches the sum
      of the Pessoas column, and the "last confirmation" matches the newest timestamp **after
      temporarily shuffling the fixture's order** so it cannot be passing by reading `records[0]`
- [ ] 11.5 At 375px, verify all six columns are reachable by dragging, that the carved panel does not
      move or reshape while the table scrolls, that the `<h2>` stays in view, and that the scroll hint
      is visible — then verify the hint disappears above `sm`
- [ ] 11.6 At 375px, verify a single row still reads as one row after scrolling sideways — this is the
      cost of dropping zebra striping, and it is the check that decides whether the row rule is enough
- [ ] 11.7 Read the table on an actual phone and judge whether Caveat is legible for e-mails, phone
      numbers and timestamps at `text-lg`. If it is not, stop and report it: the fix is a new type
      role in the design system, which is the designer's call, not a change to this spec
- [ ] 11.8 Verify with the keyboard alone: Tab reaches the scroll container, it shows a solid outline
      (not a ring or glow), and the arrow keys scroll it horizontally
- [ ] 11.9 Verify with a screen reader that the region's label is announced, that the sr-only caption
      is announced on entering the table, that the table reports six columns, and that a cell is
      announced with both its column header and its row's name
- [ ] 11.10 Force the loading state (temporarily pass `isLoading`) and verify: the heading and all six
      headers stay put, three rows of solid non-animating bars appear, the region is `aria-busy`, the
      sr-only loading line is announced, and **nothing shifts position** when you flip it back
- [ ] 11.11 Force the empty state (temporarily pass an empty array) and verify: the table is gone, the
      empty block renders inside the same panel, the summary above still renders with `0`, `0` and
      `—`, and nothing on the page appears or disappears relative to the populated state
- [ ] 11.12 At desktop width, look hard at the `.carved-1` corners against the header row and the last
      row. If the belly crowds them, swap the table panel to `.carved-3` and the summary card to
      `.carved-1` — pre-authorised in design.md, no new spec needed — and note the swap in the PR
- [ ] 11.13 Verify with `prefers-reduced-motion: reduce` that the page is identical, and confirm by
      inspection that it contains no transition, animation or Framer Motion
- [ ] 11.14 Verify there is exactly one `<h1>` and one `<h2>` on the page, and that every icon is
      `aria-hidden` and sits beside text
- [ ] 11.15 Run `yarn lint && yarn typecheck && yarn build` and verify all three pass clean, with no
      `any`, no `as` cast, and no rule suppression in any new file
