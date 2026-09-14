## Why

`/admin` is the organizer's half of the project and it is still a placeholder.
`AdminDashboardPage.tsx` renders the string `Admin Dashboard Page — under construction`,
`RsvpTable.tsx` returns `<table>RSVP table — under construction</table>` and `RsvpSummaryCard.tsx`
returns `<article>RSVP summary — under construction</article>`. Nothing on that route has a layout.

Meanwhile the guest side is finished enough to write real rows: the RSVP form collects name,
WhatsApp, e-mail and guest count, and `src/lib/api/rsvp.ts` already inserts them into the Supabase
`rsvp` table. The data exists; the screen that reads it does not.

This change builds **the dashboard's layout only, against mocked data**. A single module holding ten
fake guests feeds the table. There is no Supabase call, no `useRsvpList`, no auth work, no login form
and no `ProtectedRoute` change — that wiring is a later change, and the whole point of separating
them is that the later one should be able to swap the data source without touching a single
presentation component.

Two things make this more than "render a table":

1. **`GUIDELINES.md` rules out the conventional data-table treatment.** §4.5 forbids gradients, soft
   shadows, glow and transparency by name. Zebra striping (`bg-muted/50`), a hover row tint, a
   shimmering skeleton (`animate-pulse` animates opacity) and the fade-out edge that signals "this
   table scrolls sideways" are all alpha or gradient effects. Every one of them needs a replacement
   drawn from three opaque colours, and those replacements are specified here.
2. **The organizer will open this on a phone as often as on a desktop**, and a six-column table does
   not fit in 375px. That decision — scroll, stack, or hide columns — is made here, with its
   accessibility consequences, rather than being discovered during implementation.

## What Changes

### The page

- `AdminDashboardPage` composes a page header (`h1` + subtitle), `RsvpSummaryCard`, then `RsvpTable`,
  inside the existing `PageWrapper`, constrained to `max-w-5xl`. It is where the data comes from and
  the only file the later Supabase change has to edit.
- No sign-out control, no navigation, no link to `/admin/login`. Auth is out of scope, and a control
  that cannot work yet is worse than no control.
- **No Framer Motion.** The invite page animates its sections into view; the dashboard is a tool the
  organizer reloads repeatedly, and animating a data table's entrance is friction, not warmth.

### The table

- Six columns, in this order: **Nome, Pessoas, WhatsApp, E-mail, Confirmado em, Status**. This
  deliberately departs from `SYSTEM-DESIGN.md` §5.3 (Nome / E-mail / Número de pessoas / Status),
  which predates both the WhatsApp field and the `created_at` column.
- **At 375px the table scrolls horizontally inside its own container**, inside a carved panel that
  does not scroll. No column is hidden and no row is restacked as a card. Justified in design.md.
- **No zebra striping.** Rows are separated by a `border-b-2 border-sertao-brown` rule; the header row
  is cut heavier, `border-b-4 border-carved-black`. No hover tint — nothing in the table is clickable.
- Loading and empty states are both specified and both built, even though the mock is synchronous, so
  the later hook has somewhere to put them.
- **No sorting, no filtering, no search, no pagination.** Rows render in source order.
- Hand-rolled `<table>` markup. **`yarn shadcn add table` is not run** — reasoned in design.md.

### The summary

- `RsvpSummaryCard` is in scope, sits **above** the table, and shows three figures: total
  confirmations, total people (the sum of guest counts), and the most recent confirmation's
  date and time. It is purely presentational and receives a derived summary object as props.

### Data

- A new `src/lib/mocks/rsvpListMock.ts` exports one `const rsvpListMock: RsvpRecord[]` with ten fake
  guests, chosen to exercise the layout (a very long name, a long e-mail, a two-digit guest count,
  timestamps spread across months).
- A new `RsvpRecord` type in `src/lib/schemas/rsvpSchema.ts` — the **English** view model the
  presentation consumes — plus `RsvpRecordRow` (the Portuguese Supabase row) and `toRsvpRecord`, the
  read-side mirror of the existing `toRsvpRow`. The later Supabase change calls `toRsvpRecord` inside
  its hook and the components never learn that the database speaks Portuguese.
- A new `src/lib/rsvp/summarizeRsvpList.ts` (pure) and a new
  `src/lib/formatters/rsvpDateTime.ts` (pure, `Intl`-based, no date library).

## Capabilities

### New Capabilities

- `admin-rsvp-dashboard`: the layout, content and states of the organizer's confirmation list at
  `/admin`, fed by a fixture. Reading real data is explicitly outside this capability.

### Modified Capabilities

_None._

## Impact

- **Code**: `src/pages/AdminDashboardPage.tsx` (composition), `src/components/admin/RsvpTable.tsx`
  and `src/components/admin/RsvpSummaryCard.tsx` (both currently stubs), new
  `src/components/admin/RsvpTableRow.tsx`, `RsvpTableEmpty.tsx` and `RsvpTableLoadingRows.tsx`, new
  `src/lib/mocks/rsvpListMock.ts`, new `src/lib/rsvp/summarizeRsvpList.ts`, new
  `src/lib/formatters/rsvpDateTime.ts`, and additive types in `src/lib/schemas/rsvpSchema.ts`.
- **Structure**: adds `src/lib/mocks/` and `src/lib/rsvp/`, neither named in `SYSTEM-DESIGN.md` §4.
  Both are siblings of the existing `src/lib/api/`, `calendar/`, `formatters/` and `schemas/`, and
  `src/lib/mocks/` is deliberately visible so the later change can find and delete it.
- **Generated UI**: none. `src/components/ui/` gains no file; no shadcn CLI run.
- **Dependencies**: none. `lucide-react` covers the two icons; date formatting uses the platform's
  `Intl`.
- **Design tokens**: consumes `carved-black` / `bone-white` / `sertao-brown`, `font-title`,
  `font-body`, `.carved-1` and `.carved-2`. **No new token and no new `globals.css` utility.**
- **Assets**: none.
- **Supabase**: none. No client import, no query, no policy, no migration. The `rsvp` table is read
  from nowhere in this change.
- **Out of scope, deliberately**: `useRsvpList`, `useSession`, `ProtectedRoute`'s missing redirect,
  `LoginForm`, `AdminLoginPage`, sorting, filtering, search, pagination, CSV export, editing or
  deleting a confirmation, and any error state for a failed fetch.

### Out-of-boundary needs, with owners

- **`ProtectedRoute` does not redirect.** `/admin` is reachable by anyone today, which means this
  layout — including every guest's name, e-mail and phone number — renders publicly the moment it
  ships. That is a real exposure and it is **not** fixed here. **Owner**: the auth change, which
  should land before or with the Supabase read. Until then the page only ever shows fixture data,
  which is the mitigation.
- **`SYSTEM-DESIGN.md` §5.3's column list is stale** (no WhatsApp, no `created_at`) and §5.2's query
  is `.order('created_at')`, ascending, which would put the oldest confirmation first. The
  recommendation is `.order('created_at', { ascending: false })`. **Owner**: the Supabase read change
  plus a docs pass.
- **Caveat (`font-body`) is a handwriting face being asked to render e-mails, phone numbers and
  timestamps.** This change mitigates it with size (`text-lg` floor) and flags it for QA. If review
  finds it unreadable, the fix is a fourth type role in the design system — a plain face for data —
  which is the **designer's** call, not this change's.
- **The WhatsApp cell is plain text, not a `wa.me` link.** Making it tappable is the obvious next
  step and the organizer will want it. **Owner**: a follow-up change, which also has to decide how a
  link is styled without a link colour.
- **No asset is requested.** If review wants the empty state to carry an illustration instead of a
  Lucide icon, that is a request to the **assets-designer** agent, not a change to this spec.
