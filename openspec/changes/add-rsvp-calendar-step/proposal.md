## Why

`add-rsvp-guest-form` shipped: the modal collects four validated fields, and a valid submit closes the
modal and plays the confetti + "Tá confirmado {primeiro nome}!" success state. The guest tells the
organizer they are coming, and then nothing helps them remember the date — the party is on
27/09/2026, which for most guests is months away.

This change adds one step after the form, inside the same modal: a short "Calendário" step that asks
whether the guest wants a reminder on Google Calendar. "SIM" opens a Google Calendar template in a new
tab; "NÃO" simply closes. Either way the RSVP already counts as confirmed — the calendar is an offer,
not a second gate.

Two consequences follow, and they are the substance of the change:

1. **`ModalForm` becomes a two-step flow.** Today `handleSubmit` calls `onConfirm(data)`, which closes
   the modal and fires every page-level side effect. The calendar step sits between those two moments,
   so the submit must stop being the thing that confirms, and the close must become it.
2. **Every exit from the calendar step confirms.** "NÃO", the corner `X`, Escape and an overlay tap all
   mean the same thing: the guest answered the calendar question by declining it. None of them may
   discard an RSVP the guest already submitted. That reverses, for this step only, the shipped rule
   that closing the modal writes nothing to storage.

## What Changes

### The step itself

- On a valid submit, `ModalForm` swaps its own content from the form to a calendar step **inside the
  same `Dialog`**. No second modal, no extra block below the form, no navigation.
- The step's content is fixed by the user and is not draftable copy: the title `Calendário`, the
  message `Adicionar lembrete no calendário google?`, and two buttons, `SIM` and `NÃO`.
- The single `DialogTitle` node swaps its text from `Convidado` to `Calendário`, so the dialog's
  accessible name follows the step.
- `SIM` and `NÃO` are **visually equal weight** — both `Button variant="xilo"`, same size, side by
  side. There is no primary/secondary pairing, because the project has no secondary button treatment
  that does not rely on transparency (forbidden by `GUIDELINES.md` §4.5), and because nudging a guest
  toward granting a calendar action by weakening "NÃO" would be a dark pattern.

### Where the confirmation now happens

- `ModalForm` holds the validated payload and calls `onConfirm(data)` **when the modal closes from the
  calendar step**, not when the form is submitted. The prop's name and signature are unchanged; its
  timing is not, and that is stated in the delta.
- `RsvpForm`'s `confirm` handler stops calling `setIsModalOpen(false)`. It still writes both storage
  keys, sets `hasConfirmed`/`justConfirmed` and builds the message — the close is now the caller's job,
  which removes the double ownership.
- All four exits from the calendar step (`SIM`, `NÃO`, the corner `X`, Escape, an overlay tap) route
  through one `onOpenChange` funnel in `ModalForm`, so there is exactly one place where a confirmation
  can fire and it cannot be fired twice.

### The calendar link

- New pure module `src/lib/calendar/googleCalendarUrl.ts`: a `buildGoogleCalendarUrl(event)` function
  and the event's own data as a module constant. Title "Aniversário do Muri", 27/09/2026 11:30 to
  20:00 in `America/Sao_Paulo`, location "Alto da Serra Recepções, Cuité", description "Venha celebrar
  com a gente".
- `SIM` calls `window.open(url, '_blank', 'noopener')` **synchronously inside the click handler**, then
  requests the close. A new tab, never a same-tab navigation away from `/`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `rsvp-confirmation-section`: the modal gains a second step; "Confirmar" advances to it instead of
  confirming; the page-level confirmation side effects move from submit to close; closing the modal
  now means two different things depending on which step is showing.

## Impact

- **Code**: `src/pages/InvitePage/partials/ModalForm.tsx` (step state, close funnel, title swap), a
  new `src/pages/InvitePage/partials/CalendarStep.tsx`, a new
  `src/pages/InvitePage/partials/GuestStep.tsx` (the existing form branch, moved out so `ModalForm`
  stays inside ESLint's `max-lines-per-function` of 60), `src/pages/InvitePage/partials/RsvpForm.tsx`
  (the confirm handler stops closing the modal), and a new
  `src/lib/calendar/googleCalendarUrl.ts`.
- **Structure**: adds one directory not named in `SYSTEM-DESIGN.md` §4 — `src/lib/calendar/` — as a
  sibling of the existing `src/lib/schemas/` and `src/lib/formatters/`, for the same reason those two
  exist: a pure, framework-free transform that does not belong in a component.
- **Generated UI**: none. `DialogDescription` is already exported from the existing
  `src/components/ui/dialog.tsx`; no shadcn component is added and `src/components/ui/` is not edited.
- **Dependencies**: none. `lucide-react` covers the step's icon; `framer-motion` is already used by
  every other section of the page.
- **Browser storage**: no new key. The two existing keys are written at a later moment in the flow,
  with the same contract.
- **Assets**: none. No new or modified `.svg`/`.png`.
- **Design tokens**: consumes the existing `carved-black`/`bone-white`/`sertao-brown`, `font-title`,
  `font-body`, and the `.carved-1`/`.carved-3` utilities already on the panel and the `xilo` button
  variant. **No new token and no new `globals.css` utility.**
- **Reverses a shipped behaviour**: `add-rsvp-guest-form`'s "Guest can back out of the modal without
  confirming" states that the corner `X`, Escape and an overlay tap all "write nothing to browser
  storage". That stays true on the form step and is explicitly false on the calendar step. The delta
  restates the requirement scoped to the step.
- **Out of scope, deliberately**: any Supabase insert; an `.ics` download or an Apple/Outlook calendar
  option; a reminder offer anywhere outside the modal (the `Sobre` section keeps only its map link);
  remembering whether the guest already added the event; and any change to the confetti, the feedback
  text, or the storage keys themselves.

### Out-of-boundary needs, with owners

- **The event data now exists in two places.** `EventDetails.tsx` holds the human-readable strings
  (`27 de setembro de 2026`, `11h30`, `Alto da Serra Recepções, Cuité`) and this change adds the
  machine-readable instants (`20260927T113000`, `America/Sao_Paulo`). They are deliberately not shared
  — one is display copy, the other is an API format — but they can drift if the party moves. **Owner**:
  whoever changes the date must change both; the task list flags the pair explicitly.
- **The 20:00 end time is an assumption.** The user fixed it, and it is recorded as fixed, but a
  8½-hour block is what the guest will see in their calendar. **Owner**: the user, if they
  would rather the block end earlier.
- **`DialogOverlay` still uses `bg-black/10` and `backdrop-blur-xs`** — transparency and a blur, both
  forbidden by `GUIDELINES.md` §4.5, still unreachable from the call site. Unchanged and still out of
  scope. **Owner**: the follow-up change `add-rsvp-guest-form` already flagged.
- **The form step renders no `DialogDescription`**, so Radix logs a missing-description warning in dev
  today (the intro line is commented out in `ModalForm.tsx`). The calendar step adds one for itself;
  the form step's warning is pre-existing and is **not** fixed here. **Owner**: the copy writer filling
  `{{copy: rsvp_modal_intro}}`, which is what the commented-out line is waiting for.
