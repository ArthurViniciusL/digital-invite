## Purpose

Defines the observable content, layout and states of the organizer's dashboard at `/admin`: a table
of RSVP confirmations, a summary of the totals above it, and the empty and loading states both must
have. This is the capability's first delta, so every requirement is ADDED.

Reading real data is explicitly **not** part of this capability. The rows come from a fixture module
of ten fake guests; no Supabase query, no `useRsvpList`, no session check and no login behaviour is
specified or built here. What is specified is the seam: the shape the presentation consumes, so the
change that adds the real query does not touch a presentation component.

Strings written as `{{copy: …}}` are placeholders rendered verbatim until the copy writer replaces
them. Strings written in quotes are fixed structure and are written exactly as shown.

## ADDED Requirements

### Requirement: The dashboard lists every confirmation as a table

`/admin` SHALL present the RSVP confirmations as a single HTML `<table>` with a `<caption>`, a
`<thead>` and a `<tbody>`. Each confirmation SHALL occupy exactly one row. The table SHALL display
six columns in this order: "Nome", "Pessoas", "WhatsApp", "E-mail", "Confirmado em" and "Status". The
record's identifier SHALL NOT be displayed in any column. Rows SHALL be rendered in the order the
data source provides them, and the dashboard SHALL NOT re-order, sort, filter, search or paginate
them.

#### Scenario: Organizer opens the dashboard with confirmations present

- **WHEN** the organizer loads `/admin` and the data source holds ten confirmations
- **THEN** the page shows one table containing ten rows, each with the guest's name, the number of
  people, the WhatsApp number, the e-mail address, when the confirmation arrived, and its status, in
  that column order

#### Scenario: No sorting or filtering control is offered

- **WHEN** the organizer looks at the table's header row or anywhere else on the page
- **THEN** there is no sort control on any header, no search input, no status filter, no date filter,
  no pagination control and no "showing N of M" line

#### Scenario: Rows follow the source order

- **WHEN** the data source provides its records newest-confirmation-first
- **THEN** the table's first row is the newest confirmation and the last row is the oldest, with no
  client-side re-ordering applied

### Requirement: Every column is formatted for a Brazilian reader

The "Pessoas" column SHALL show the guest count as a bare numeral with no unit word, right-aligned
and using tabular figures. The "Confirmado em" column SHALL show the confirmation's date and time in
the form `27/09/2026 11h30` — a two-digit day, a two-digit month, a four-digit year, and the time in
the same `11h30` style the invite page already uses — computed in Brazil time regardless of the
reader's device timezone. The "WhatsApp" column SHALL render the number through the project's
existing WhatsApp formatter, so a value stored as digits only and a value stored already masked both
display as `83 9 8765-4321`. The "Status" column SHALL render the stored status text verbatim, with
no translation table and no per-status colour, badge or icon. The "E-mail" column SHALL render the
address in full, with no truncation and no ellipsis. Every cell SHALL keep its content on a single
line.

#### Scenario: A confirmation for four people

- **WHEN** a record's guest count is `4`
- **THEN** the "Pessoas" cell reads `4`, with no "pessoas" suffix, aligned to the right of its column

#### Scenario: A confirmation timestamp is displayed

- **WHEN** a record was created at `2026-09-10T14:32:00-03:00`
- **THEN** its "Confirmado em" cell reads `10/09/2026 14h32`, and reads the same on a device whose
  clock is set to a different timezone

#### Scenario: A WhatsApp number stored without formatting

- **WHEN** a record's WhatsApp value is the unformatted string `83987654321`
- **THEN** the cell displays `83 9 8765-4321`

#### Scenario: A timestamp cannot be parsed

- **WHEN** a record's creation timestamp is empty or malformed
- **THEN** the cell shows `—`, the rest of the row renders normally, and no error is thrown or shown

#### Scenario: A long e-mail address

- **WHEN** a record's e-mail is longer than its column's width
- **THEN** the address is shown in full on one line and the table becomes horizontally scrollable,
  rather than the address wrapping or being truncated

### Requirement: The table scrolls horizontally on a narrow screen without hiding anything

At every viewport width, including 375px, the table SHALL display all six columns for all rows. No
column SHALL be hidden, collapsed or moved into a second line at any breakpoint, and rows SHALL NOT
be restacked as cards. When the table is wider than the available space it SHALL scroll horizontally
inside its own container, and the carved panel that frames it SHALL NOT scroll or change shape. Below
the `sm` breakpoint the dashboard SHALL display a visible hint that more columns exist to the side;
that hint SHALL NOT be a gradient, a fade, a mask or any partially transparent overlay.

#### Scenario: Organizer opens the dashboard on a phone

- **WHEN** the organizer loads `/admin` at a 375px viewport width
- **THEN** the "Nome" and "Pessoas" columns are visible, the remaining columns are reachable by
  dragging the table sideways, the panel's carved border stays whole and unmoved, and no column has
  been removed from the table

#### Scenario: The scroll hint is shown only where it applies

- **WHEN** the viewport is below the `sm` breakpoint
- **THEN** `{{copy: admin_table_scroll_hint}}` is visible beneath the table with an icon that is
  hidden from assistive technology, and above `sm` that hint is not rendered

#### Scenario: The panel frame is not part of the scrolling area

- **WHEN** the organizer scrolls the table to its far right
- **THEN** the panel's border and its heading stay in place and only the table moves

### Requirement: The table is reachable and understandable without a pointer or a screen

The table's scrollable container SHALL be a labelled region that can be focused with the keyboard and
scrolled with the arrow keys, and its focus indicator SHALL be a solid outline — never a ring, a glow
or a blurred shadow. The table SHALL carry a caption that is available to assistive technology; that
caption SHALL NOT be visible on screen, and a visible heading outside the scrolling container SHALL
title the table instead. Every column header SHALL be a `<th>` scoped to its column, and each row's
name cell SHALL be a `<th>` scoped to its row. Every icon on the page SHALL be hidden from assistive
technology and SHALL sit beside text rather than replacing it. The page SHALL have exactly one level-1
heading and one level-2 heading.

#### Scenario: A keyboard user reaches the table

- **WHEN** a keyboard user tabs to the table's container
- **THEN** the container takes focus with a visible solid outline, its accessible name
  `{{copy: admin_table_region_label}}` is announced, and the arrow keys scroll it horizontally

#### Scenario: A screen reader reads a cell

- **WHEN** a screen reader user moves to the e-mail cell of the row for "Maria das Graças"
- **THEN** the cell is announced with its column header "E-mail" and with "Maria das Graças" as the
  row header, so the value is never announced alone

#### Scenario: A screen reader enters the table

- **WHEN** a screen reader user enters the table
- **THEN** `{{copy: admin_table_caption}}` is announced as the table's caption and the table is
  announced as having six columns, while nothing on screen shows that sentence

#### Scenario: The table's visible title stays put while scrolling

- **WHEN** the organizer scrolls the table sideways
- **THEN** the visible heading `{{copy: admin_table_heading}}` does not move out of view

### Requirement: The table renders a loading state that keeps its own shape

The table SHALL accept a loading state and, while loading, SHALL render its heading and its full
header row together with placeholder rows in place of data, so that nothing on the page shifts
position when the real rows arrive. The placeholders SHALL be solid opaque bars in the project's
palette, of differing widths per column, and SHALL NOT pulse, shimmer, fade, animate or use any
partial opacity. The loading state SHALL be announced to assistive technology as busy, with a
text status message, rather than leaving a screen reader with empty content.

#### Scenario: The dashboard is waiting for confirmations

- **WHEN** the table is in its loading state
- **THEN** the panel, its heading and all six column headers are shown, three placeholder rows of
  solid bars appear beneath them, none of those bars animate or appear semi-transparent, and no
  confirmation data is shown

#### Scenario: A screen reader meets the loading state

- **WHEN** a screen reader user reaches the table while it is loading
- **THEN** the region is announced as busy and `{{copy: admin_table_loading}}` is announced, rather
  than a row of unlabelled graphics

#### Scenario: Data replaces the loading state

- **WHEN** the table leaves its loading state with records present
- **THEN** the heading and the header row are in exactly the same position they occupied while
  loading, and only the rows beneath them change

### Requirement: The table renders an empty state when nobody has confirmed

When there are no confirmations and the table is not loading, the dashboard SHALL replace the table
with a centred block inside the same carved panel, containing an icon hidden from assistive
technology, `{{copy: admin_empty_title}}` and `{{copy: admin_empty_hint}}`. It SHALL NOT render an
empty table with only its header row, SHALL NOT present the situation as an error, and SHALL NOT
offer a retry or any other control.

#### Scenario: The event has no confirmations yet

- **WHEN** the organizer loads `/admin` and there are zero confirmations
- **THEN** the panel shows the empty block with its title and hint, no column headers and no table
  are rendered, and nothing on the page reads as an error or offers a retry

#### Scenario: The summary stays visible when empty

- **WHEN** there are zero confirmations
- **THEN** the summary above the table is still rendered, showing `0` confirmations, `0` people and
  `—` for the most recent confirmation, so no part of the page appears or disappears between the
  empty and populated states

### Requirement: A summary of the totals sits above the table

The dashboard SHALL display a summary above the table, in its own panel, containing exactly three
figures: how many confirmation records exist, how many people are coming in total (the sum of every
record's guest count, not the number of records), and when the most recent confirmation arrived. The
most recent confirmation SHALL be determined by comparing the records' timestamps rather than by
trusting their position in the list, and SHALL be formatted identically to the table's "Confirmado
em" column. When there are no records the first two figures SHALL read `0` and the third SHALL read
`—`.

#### Scenario: Ten confirmations totalling twenty-seven people

- **WHEN** the data source holds ten records whose guest counts sum to twenty-seven
- **THEN** the summary shows `10` for the confirmation count and `27` for the people total, and those
  two figures are visibly distinct from one another

#### Scenario: The most recent confirmation is not the first in the list

- **WHEN** the newest record is not in the first position of the list
- **THEN** the summary still shows that newest record's date and time

#### Scenario: Summary appears before the table

- **WHEN** the organizer loads `/admin` at any viewport width
- **THEN** the summary is above the table in both the visual order and the document order

### Requirement: The dashboard follows the carved visual language without any forbidden effect

The dashboard SHALL use only `carved-black`, `bone-white` and `sertao-brown`, `font-title` and
`font-body`. It SHALL NOT use a gradient, a soft or blurred shadow, a glow, or any partially
transparent colour anywhere — including for row striping, row hover, the loading placeholders, the
scroll affordance and focus indicators. The table SHALL NOT stripe alternate rows and SHALL NOT
change a row's appearance on hover. Rows SHALL be separated by a rule, and the header row SHALL be
separated from the body by a heavier rule. The summary panel and the table panel SHALL NOT use the
same carved silhouette as each other. The dashboard SHALL introduce no entrance animation, transition
or motion of any kind.

#### Scenario: The organizer hovers over a row

- **WHEN** the pointer moves over any row of the table
- **THEN** nothing about that row's appearance changes, because no row is interactive

#### Scenario: Rows are distinguished from one another

- **WHEN** the organizer reads down the table
- **THEN** every row but the last is separated from the next by a visible rule, no row has a
  background fill different from its neighbours, and the header row is separated from the first data
  row by a heavier rule than the rules between data rows

#### Scenario: Two stacked panels are compared

- **WHEN** the summary panel and the table panel are seen one above the other
- **THEN** their carved outlines are visibly different from each other, and neither uses the
  silhouette reserved for the page's buttons

#### Scenario: The page is loaded with reduced motion preferred

- **WHEN** the organizer loads `/admin` with `prefers-reduced-motion: reduce`
- **THEN** the page looks and behaves exactly as it does without that preference, because it contains
  no motion to reduce

### Requirement: The dashboard reads from a fixture and touches no backend

This capability SHALL be fed by a single fixture module holding ten fake confirmation records, and
SHALL NOT import the Supabase client, issue any network request, call `useRsvpList`, read the
session, or render any authentication control including a sign-out button, a login link or any
navigation. The fixture module SHALL be the only file a later change has to replace in order to show
real data, and the components that present the records SHALL NOT need to change when it is replaced.

#### Scenario: The dashboard is opened with the network unavailable

- **WHEN** the organizer loads `/admin` with no network connection
- **THEN** the page renders completely, showing the ten fixture confirmations, and issues no request

#### Scenario: The data source is swapped for a real one later

- **WHEN** a later change replaces the fixture with a hook that returns the same record shape
- **THEN** the page, the summary and the table render that data with no change to their own markup,
  props or styling

#### Scenario: No authentication surface is present

- **WHEN** the organizer looks at the dashboard
- **THEN** there is no sign-out control, no link to the login page and no navigation of any kind

### Requirement: The presented record shape is English and maps the Portuguese columns in one place

The records the presentation consumes SHALL use English field names, and the translation between them
and the database's Portuguese column names SHALL live only in the project's RSVP schema module,
beside the existing write-side mapping. No page, table, row or summary component SHALL refer to a
Portuguese column name.

#### Scenario: A presentation component is inspected

- **WHEN** the dashboard's page, table, row, empty-state or summary component is read
- **THEN** it refers only to English field names, and contains no `nome`, `numero_pessoas` or
  `created_at` identifier

#### Scenario: The read-side mapping is looked for

- **WHEN** a developer looks for how a database row becomes a presented record
- **THEN** they find one exported mapping function in the RSVP schema module, directly beside the
  existing function that maps a submitted form into a database row
