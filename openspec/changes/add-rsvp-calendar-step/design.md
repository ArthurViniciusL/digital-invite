## Context

`add-rsvp-guest-form` is implemented but not archived — its manual-QA tasks (9.1–9.16) are still
unchecked — so `openspec/specs/rsvp-confirmation-section/` does not exist. This change's delta is
written against the capability as defined under that change's own `specs/` directory, the same way
`add-rsvp-guest-form` was written against `add-rsvp-confirmation-section`.

What is on disk today, read before drafting:

- `src/pages/InvitePage/partials/ModalForm.tsx` — a `Dialog` with `showCloseButton={false}`, a
  `.carved-1 border-4 border-carved-black bg-bone-white` `DialogContent` at
  `max-h-[90dvh] overflow-y-auto px-5 py-8 sm:max-w-md sm:px-8 sm:py-10`, a `CloseModalButton`
  (`variant="xilo"`, `size-11`, `aria-label="Fechar"`, `hover:bg-sertao-brown`), a `DialogHeader` with
  the `DialogTitle` `'Convidado'` in `font-title text-2xl sm:text-3xl`, `useForm` +
  `zodResolver(rsvpSchema)`, `RsvpFormFields`, and a single `Confirmar` submit button in
  `DialogFooter`. **There is no `DialogDescription`** — the `{{copy: rsvp_modal_intro}}` line is
  commented out at line 20.
- `src/pages/InvitePage/partials/RsvpForm.tsx` — `isModalOpen`, `hasConfirmed`, `justConfirmed`,
  `confirmedName`, the four storage helpers, `buildFeedbackMessage`, the Lottie confetti layer, and a
  `confirm(data)` callback that writes storage, sets both flags **and calls `setIsModalOpen(false)`**.
- `src/pages/InvitePage/partials/EventDetails.tsx` — already holds the event's display strings
  (`27 de setembro de 2026`, `11h30`, `Alto da Serra Recepções, Cuité`) and an external map link built
  as `Button variant="xilo" asChild` around an `<a target="_blank" rel="noopener noreferrer">` with a
  Lucide `ExternalLink`. It is the precedent for opening a new tab from this page.
- `src/components/ui/dialog.tsx` — exports `DialogDescription`; `DialogContent` renders the overlay
  internally and unmounts its children when closed.
- `src/components/ui/button.tsx` — the `xilo` variant is `carved-3 rounded-none border-4
border-carved-black bg-bone-white font-title text-carved-black` with a `hover:scale-105
hover:bg-carved-black hover:text-bone-white` inversion and `active:scale-95`.

Fixed by `GUIDELINES.md` and not decided here: the three-token palette (§4.2/§5.1, still pending the
designer's revalidation), `font-title` / `font-body` (§4.3/§5.2), the `.carved-1/2/3` utilities and
the anti-repeat rule (§4.4/§5.3), the hatching-only / no-gradient / no-glow / no-soft-shadow /
no-transparency rules (§4.5), and Lucide as the utility icon library (§5.4, which lists `calendar`
by name).

Fixed by the user and **not open in this design**: the step lives in the same `Dialog`; the strings
`Calendário`, `Adicionar lembrete no calendário google?`, `SIM` and `NÃO`; `SIM` opens Google Calendar
in a new tab with `noopener` and then closes; `NÃO` just closes; the `X`, Escape and an overlay tap on
the calendar step behave exactly like `NÃO`; the page-level side effects fire on close, not on submit;
and the event's title, date, time, timezone, location and description.

## Goals / Non-Goals

**Goals:**

- Turn `ModalForm` into a two-step flow with exactly one place where a confirmation can fire, so
  decision 6 ("side effects on close") cannot be satisfied twice or skipped by one of the five exits.
- Specify the calendar step's composition, tokens and utilities precisely enough that `dev` writes it
  without inventing a treatment, including which `Button` variant and size each of `SIM` and `NÃO`
  carries and why they are equal weight.
- Specify the focus move and the accessible-name change when the content swaps, because the element
  that had focus ("Confirmar") is unmounted by the swap.
- Specify the swap's motion and its reduced-motion behaviour in the same vocabulary the rest of the
  page already uses.
- Keep `ModalForm` inside ESLint's `max-lines-per-function` (60) and `complexity` (8) without
  hoisting form state out of the one component that can preserve it.

**Non-Goals:**

- Any Supabase call. A confirmation is still two `localStorage` keys and a confetti animation.
- An `.ics` file, an Apple Calendar or Outlook option, or any calendar provider other than Google.
- Remembering whether the guest already added the event, or offering the reminder again on a later
  visit. A returning guest goes straight to the restored success state, as today.
- A calendar link anywhere outside the modal.
- Changing the confetti, the feedback text, the storage keys, the form's fields, or any validation.
- Fixing `DialogOverlay`'s `bg-black/10` + `backdrop-blur-xs`, or the form step's missing
  `DialogDescription`.
- Rewording `Confirmar`, `Calendário`, `Adicionar lembrete no calendário google?`, `SIM` or `NÃO`.

## Decisions

### The flow: one funnel, one confirmation

**Decision: `ModalForm` owns a two-value step and the validated payload. The payload is what makes a
close a confirmation, and every exit goes through a single `onOpenChange` handler.**

```
type RsvpModalStep = 'form' | 'calendar'
```

State in `ModalForm`:

| State           | Type                    | Meaning                                                       |
| --------------- | ----------------------- | ------------------------------------------------------------- |
| `step`          | `RsvpModalStep`         | Which branch `DialogContent` renders                          |
| `confirmedData` | `RsvpFormData \| null`  | The validated payload, non-null once the form has been submitted |

Two handlers:

- `handleValid(data)` — the only thing `handleSubmit`'s success path does: `setConfirmedData(data)`
  and `setStep('calendar')`. **It does not call `onConfirm`.**
- `handleOpenChange(next)` — replaces the raw `onOpenChange` passed to `Dialog`. When `next` is
  `false` **and** `confirmedData` is non-null, it calls `onConfirm(confirmedData)` first and then
  `onOpenChange(false)`. Otherwise it just calls `onOpenChange(next)`.

Why the guard is `confirmedData !== null` and not `step === 'calendar'`: they are the same condition
today, but the payload is the thing that actually makes a close meaningful. Reading the payload means
`onConfirm` can never be called with a value the schema has not seen, and it keeps the guard true
even if a later change adds a third step after the calendar one.

Consequences:

- **`SIM` and `NÃO` do not call `onConfirm`.** They call `requestClose()`, which is
  `handleOpenChange(false)`. So do the corner `X` (through `DialogClose`), Escape and an overlay tap —
  Radix routes all three through `onOpenChange(false)`. Five exits, one code path, decision 5 for
  free rather than as three separate handlers that could drift.
- **`onConfirm` is called in the same event turn as the close**, not after a timer. React batches the
  two state updates, so the confetti mounts on the same commit that starts the dialog's 100 ms
  `data-closed:fade-out-0` exit. The confetti is behind the fading overlay for about a tenth of a
  second. A `setTimeout` to wait the animation out would fire after the guest may have navigated and
  would put the page's celebration on a timer owned by a component that is unmounting — worse than a
  100 ms overlap.
- **`step` is not reset on close.** Resetting it would re-render the form branch behind the exit
  animation, which the guest sees as a flicker back to the form they just submitted. Nothing reopens
  the modal after a confirmation: `RsvpForm` has replaced its button with the success state.
- **Idempotence.** If `handleOpenChange(false)` somehow ran twice, the second `onConfirm` rewrites the
  same two storage keys and re-sets two booleans to the values they already hold, so React bails out
  and the confetti does not replay. No dedupe flag is needed, and `dev` should not add one.

### The prop contract

```
interface ModalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: RsvpFormData) => void   // unchanged signature, new timing
}
```

The **signature does not change**. What changes is when `onConfirm` fires: no longer on a valid
submit, but on the close that follows the calendar step. Keeping the name avoids churn at the call
site, and the timing is the thing the delta spec states explicitly so a future reader does not
re-derive it from the code.

**`RsvpForm`'s `confirm` handler drops its `setIsModalOpen(false)` line.** Today `ModalForm` asks
`RsvpForm` to confirm and `RsvpForm` closes the modal; after this change `ModalForm` closes the modal
and tells `RsvpForm` it happened. Leaving the line in would be harmless but would mean two components
both believe they own the close. Everything else in `confirm` is untouched: two independent
`try`/`catch` storage writes, `setConfirmedName`, `setHasConfirmed`, `setJustConfirmed`.

`RsvpForm` gains **no** new state, no knowledge of the step, and no calendar import. The whole feature
is below its level.

### Composition

```
RsvpForm (page section)                                unchanged except: confirm() no longer closes
 └─ ModalForm                                          step state, confirmedData, close funnel
     └─ DialogContent   .carved-1, border-4            unchanged silhouette and padding
         ├─ CloseModalButton  (X, corner)              unchanged; now confirms on the calendar step
         ├─ DialogHeader
         │   └─ DialogTitle                            ONE node; text = 'Convidado' | 'Calendário'
         └─ step === 'form'
             ? GuestStep        NEW FILE (moved code)  <Form> + <form> + RsvpFormFields + Confirmar
             : CalendarStep     NEW FILE               icon + message + SIM / NÃO
```

| Path                                                | Responsibility                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| `src/pages/InvitePage/partials/ModalForm.tsx`       | Dialog shell, `useForm`, step state, close funnel, title swap, focus move |
| `src/pages/InvitePage/partials/GuestStep.tsx`       | The existing form branch, moved verbatim; takes `form` and `onValid`      |
| `src/pages/InvitePage/partials/CalendarStep.tsx`    | Message, `SIM`/`NÃO`, the `window.open` call                              |
| `src/lib/calendar/googleCalendarUrl.ts`             | `buildGoogleCalendarUrl(event)` + the event constant, pure                |
| `src/pages/InvitePage/partials/RsvpForm.tsx`        | One deleted line                                                          |

**`useForm` stays in `ModalForm` and is passed down to `GuestStep` as a prop.** This is load-bearing,
not a style choice: `add-rsvp-guest-form` requires that "filled values survive the modal being closed
and reopened", and that only works because `useForm` lives in a component that stays mounted while
`DialogContent`'s children unmount. `GuestStep` is a child of `DialogContent`; moving `useForm` into
it would silently break a shipped requirement the moment a guest backs out with a half-filled form.
So `GuestStep`'s props are:

```
interface GuestStepProps {
  form: UseFormReturn<RsvpFormInput, unknown, RsvpFormData>
  onValid: (data: RsvpFormData) => void
}
```

Threading the whole `UseFormReturn` through a prop is not elegant, and the alternative — leaving the
form branch inline in `ModalForm` — is what the 60-line lint limit rules out once the step
conditional, two handlers and the title swap are added. Recorded as a trade-off rather than hidden.

**The step state machine is a local hook in `ModalForm.tsx`.** `dev` writes
`function useRsvpModalFlow(onConfirm, onOpenChange)` above the component in the same file, returning
`{ step, confirmValid, requestClose, handleOpenChange }`. It is not exported and does not get its own
file — it is one component's state machine, not a shared primitive, and a `src/pages/InvitePage/hooks/`
directory for a single 20-line hook is more structure than the thing deserves. Two parameters keeps it
inside `max-params` (3), and the split is what keeps both the hook and the component inside
`complexity` (8) and `max-lines-per-function` (60).

### The calendar step's layout

```
                    ┌───────────────────────────┐
                    │            X              │   corner close, unchanged
                    │                           │
                    │       Calendário          │   DialogTitle, font-title, 2xl/3xl, centred
                    │                           │
                    │           [📅+]           │   Lucide CalendarPlus, size-10, sertao-brown
                    │                           │
                    │  Adicionar lembrete no    │   DialogDescription, font-body, xl/2xl
                    │    calendário google?     │   carved-black, centred, text-balance
                    │                           │
                    │   ┌───────┐  ┌───────┐    │   equal weight, side by side, gap-3
                    │   │  SIM  │  │  NÃO  │    │   both xilo, h-14
                    │   └───────┘  └───────┘    │
                    └───────────────────────────┘
```

Root of `CalendarStep`: `flex flex-col items-center gap-6 text-center`, matching the
`DialogContent`'s own `gap-6` rhythm.

| Element     | Element / class                                                                       | Why                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Title       | the existing `DialogTitle`, `font-title text-2xl text-carved-black sm:text-3xl`        | Byte-identical treatment to `Convidado`, so the panel does not appear to change identity between steps                   |
| Icon        | Lucide `CalendarPlus`, `h-10 w-10 shrink-0 text-sertao-brown`, `aria-hidden="true"`    | §5.4 assigns the calendar to Lucide; `text-sertao-brown` is the same icon treatment `EventDetails`'s `FactRow` uses      |
| Message     | `DialogDescription`, `font-body text-xl text-carved-black sm:text-2xl text-balance`    | Same size as `EventDetails`'s closing line, the page's other short body sentence. `carved-black`, not `muted-foreground` |
| Buttons     | `Button variant="xilo" type="button"`, `h-14 flex-1 text-base sm:flex-none sm:px-10`   | See below                                                                                                               |
| Button row  | the existing `DialogFooter` override `m-0 flex-row justify-center gap-3 border-0 bg-transparent p-0` | Reuses the form step's footer treatment verbatim; no new footer vocabulary                                |

`DialogDescription`'s generated classes `text-sm text-muted-foreground` are both overridden at the
call site — `muted-foreground` is outside the three-token palette, and `text-sm` is unreadable in
Caveat. `src/components/ui/` is not edited.

**The icon is a judgment call and the caller may want it dropped.** It exists because without it the
step is a title, a sentence and two buttons — a generic confirm dialog that could belong to any
product. The `CalendarPlus` glyph names the thing being offered before the sentence is read, and it is
the one element that makes the step look like part of this page rather than a shadcn example. It adds
no asset and no token. §5.4's warning about "a second calendar icon" is about hand-drawing one, not
about reusing Lucide's — `EventDetails` already uses Lucide `Calendar`, and using `CalendarPlus` here
keeps the two related and distinguishable.

#### `SIM` and `NÃO` are equal weight, and `SIM` is first

**Decision: both are `Button variant="xilo"`, `type="button"`, identically sized. Neither is styled as
primary or secondary. `SIM` is on the left, `NÃO` on the right.**

- **There is no secondary treatment available.** The project has exactly one button variant. A
  secondary would have to be invented from `disabled:opacity-50`-style transparency (§4.5 forbids it),
  a fourth colour (§4.2 forbids it), or a thinner border (which would read as broken carving, not as
  hierarchy). Inventing a button variant for a two-button step is out of proportion.
- **The choice is genuinely symmetric.** The RSVP is already confirmed at this point. "NÃO" costs the
  guest nothing and loses them nothing, so making it look weaker would nudge them toward opening a
  Google property they did not ask for. Equal weight is the honest rendering of the question.
- **`SIM` first** because the sentence is a yes/no question and "sim" is its first answer in
  Portuguese; because the affirmative is the action most guests who bothered to read the question
  want; and because at 320px the two share the row equally, so left/right carries order, not rank.
- **Both keep `.carved-3`** from the `xilo` variant, deliberately matching each other. This is the
  same reasoning `add-rsvp-guest-form` recorded for the `−`/`+` stepper pair: §5.3's anti-repeat rule
  is about neighbouring shapes looking accidentally similar, and a matched answer pair is supposed to
  read as one control. The silhouette variety in the panel comes from `.carved-1` on the panel against
  `.carved-3` on the buttons, exactly as on the form step.
- Sizing: `h-14` (56px, above the 44px tap floor, and the same height as the `Confirmar` button it
  replaces), `flex-1` at 320px so the pair fills the row, `sm:flex-none sm:px-10` from `sm` up so they
  stop stretching on a wide panel. `text-base` because the `xilo` variant's own `text-sm sm:text-base`
  is too small for a two-word decision.

At 320px the row is two `flex-1` buttons plus `gap-3` inside a panel of roughly 288px of content
width — about 138px each. `SIM` and `NÃO` are three glyphs; there is no wrapping risk.

#### `SIM` opens the tab with `window.open`, not with an anchor

**Decision: `SIM` is a real `<button>`. Its click handler calls
`window.open(calendarUrl, '_blank', 'noopener')` synchronously and then calls `requestClose()`.**

The obvious alternative is `Button asChild` around an `<a href target="_blank" rel="noopener
noreferrer">`, which is what `EventDetails`'s map link already does, and it was the first choice. It
is rejected here for one specific reason: this link **closes the dialog in the same click**, which
unmounts the anchor during event dispatch. Whether the browser still performs the link's default
activation after its node has been removed is not reliably specified across engines, and the failure
mode is silent — the guest taps `SIM`, the modal closes, nothing opens, and the RSVP still succeeded
so nobody notices. `window.open` inside a user-gesture handler has no such race and is not treated as
a blocked popup.

Details:

- The features string `'noopener'` is what satisfies the user's decision; it also means `window.open`
  returns `null`, so `dev` must not branch on its return value or use it.
- The call is the **first** statement in the handler. A state update before it would not actually
  delay it (React batches), but the ordering makes the "synchronous, inside the gesture" requirement
  visible in the code.
- The URL is computed once at module scope (`buildGoogleCalendarUrl(BIRTHDAY_EVENT)` is pure and its
  input is a constant), not inside the handler and not in a `useMemo`.
- Nothing about the outcome is checked. If a hardened browser blocks the window, the modal still
  closes and the RSVP is still confirmed. There is no error state, because there is nothing the guest
  could do about it and the reminder is an extra.

Accessibility cost of the button-over-anchor choice: a screen reader does not announce that a new tab
will open. Mitigated by an `sr-only` span inside the button carrying
`{{copy: calendar_new_tab_hint}}` — the one content slot in this change. Noted in Risks: until the
copy writer fills it, a screen reader announces `SIM {{copy: calendar_new_tab_hint}}` literally.

### The calendar URL

`src/lib/calendar/googleCalendarUrl.ts`, pure, no React import, no side effect:

```
interface CalendarEvent {
  title: string
  startsAt: string      // 'YYYYMMDDTHHmmss', local wall time
  endsAt: string
  timeZone: string
  location: string
  description: string
}

export const BIRTHDAY_EVENT: CalendarEvent
export function buildGoogleCalendarUrl(event: CalendarEvent): string
```

Values, fixed by the user:

| Field         | Value                               |
| ------------- | ----------------------------------- |
| `title`       | `Aniversário do Muri`               |
| `startsAt`    | `20260927T113000`                   |
| `endsAt`      | `20260927T200000`                   |
| `timeZone`    | `America/Sao_Paulo`                 |
| `location`    | `Alto da Serra Recepções, Cuité`    |
| `description` | `Venha celebrar com a gente`        |

Output shape:

```
https://calendar.google.com/calendar/render?action=TEMPLATE
  &text=Anivers%C3%A1rio+do+Muri
  &dates=20260927T113000%2F20260927T200000
  &ctz=America%2FSao_Paulo
  &details=Venha+celebrar+com+a+gente
  &location=Alto+da+Serra+Recep%C3%A7%C3%B5es%2C+Cuit%C3%A9
```

- **Built with `URLSearchParams`**, never with string concatenation. Three of the five values contain
  a character that must be escaped (`ç`, `õ`, `é`, a comma, a slash), and hand-rolled escaping of
  guest-visible Portuguese is exactly where a mojibake bug hides.
- `URLSearchParams` percent-encodes the `/` in both `dates` and `ctz` (`%2F`) and uses `+` for spaces.
  Google's template endpoint accepts both. `dev` should not "fix" the encoding to look prettier.
- **The times are local wall times plus `ctz`, not UTC with a `Z`.** `20260927T113000` with
  `ctz=America/Sao_Paulo` says "11:30 in Cuité" and stays correct regardless of what the guest's own
  device timezone is or what Brazil does about DST between now and 2026. A UTC instant computed today
  would bake in an assumption about the 2026 offset.
- **No `Date` object anywhere.** The strings are already in the format the endpoint wants; parsing
  them into a `Date` and formatting them back is a round trip through the browser's local timezone,
  which is the single most common way this exact feature gets a one-hour bug.
- The strings are Portuguese because they are shown to the guest — inside their calendar app, which is
  guest-facing surface. The identifiers around them are English, per `AGENTS.md`.
- `dev` keeps the function small: one `URLSearchParams` construction from an object literal and one
  template string. `id-length` (3+, except `id, to, db, fn, on`) applies.

### Accessibility

**The title is one node whose text changes.** `DialogTitle` is rendered once, in `ModalForm`'s
`DialogHeader`, with its text derived from `step`. Radix's `aria-labelledby` keeps pointing at the
same element, so the dialog's accessible name becomes "Calendário" with no re-wiring. Rendering a
separate `DialogTitle` inside each step would unmount and remount the labelling element mid-dialog,
which Radix warns about and which some screen readers handle poorly.

**Focus moves to the title on the swap.** The element that had focus when the swap happens is the
`Confirmar` button, and it is unmounted by the swap — leaving focus on `document.body`, from which
Tab lands somewhere unpredictable and a screen reader announces nothing at all. So:

- `ModalForm` holds a ref on the `DialogTitle` and, in a `useEffect` keyed on `step`, focuses it when
  `step` becomes `'calendar'`.
- The title carries `tabIndex={-1}` and `outline-none` — programmatically focusable, not in the tab
  order, no focus ring drawn (§4.5 forbids the ring anyway).
- A screen reader then announces "Calendário", and the reading order from there is the message, `SIM`,
  `NÃO`, and the corner `X`. This is the same "focus the new heading" pattern the page already uses in
  `RsvpForm`'s `SuccessState`, which focuses its own `role="status"` container on `justConfirmed`.
- The effect does **not** fire on the initial open — `step` starts at `'form'` — so Radix's own
  initial focus behaviour on the form step is untouched.

Rejected: a `role="status"` live region around the message. A live region that mounts at the same
moment its content appears is unreliably announced across screen readers, and combining it with a
focus move risks a double announcement. The focus move alone is the dependable half.

**The message is the `DialogDescription`**, so it is also wired as the dialog's `aria-describedby`.
This is the first `DialogDescription` in the project; the form step still has none, which is a
pre-existing dev-mode Radix warning this change does not fix.

Other checks:

- Both buttons are `type="button"`. On the calendar step there is no `<form>` at all — `GuestStep` is
  unmounted — so no submit can be triggered by Enter, but the explicit type keeps that true if the
  branches are ever nested differently.
- The icon is `aria-hidden="true"` and carries no meaning the message does not already state.
- Both buttons are 56px tall, above the 44px floor. The corner `X` keeps its `size-11`.
- Escape and the overlay keep working through Radix; this change only changes what they *mean*.

### Motion

The page's vocabulary is short fades with a small upward travel: `revealVariants` in `RsvpForm`
(`y: 12`, `opacity: 0 → 1`, 0.4 s `easeOut`), and the three variants in `EventDetails` (0.4–0.5 s,
`easeOut`, staggered by delay). `add-rsvp-guest-form` deliberately gave the form itself no motion.

**Decision: the incoming calendar step fades and rises once — `opacity: 0 → 1`, `y: 8 → 0`, 0.25 s
`easeOut` — and the outgoing form step is not animated out.**

- Some motion is warranted here and was not on the form: pressing `Confirmar` and having the panel's
  entire contents change instantly reads as a misfire. A quarter-second settle says "this is the next
  step", not "something went wrong".
- It is shorter than the page's 0.4 s reveals on purpose. Those are scroll-triggered reveals of
  content the guest has not asked for; this is a direct response to a button press, and a response
  that takes 0.4 s feels sluggish.
- **No `AnimatePresence`, no exit animation, no cross-fade.** The form unmounts immediately. Two steps
  of very different heights overlapping inside a panel that is resizing at the same time looks like a
  rendering bug, and `AnimatePresence` around a conditional inside `DialogContent` is a well-known
  source of stuck-mounted children.
- **The panel's height change is not animated.** Animating it would mean measuring the content, and
  the dialog is centred by `-translate-x/y-1/2`, so both edges move. The jump is accepted; QA checks
  it at 320px.
- **Reduced motion**: `CalendarStep` calls `useReducedMotion() ?? false` — the same expression every
  other partial on this page uses — and passes `initial={false}` when it is true, so the step appears
  at its final position with no transition. This matches `ConfirmationButton` and `SuccessState`
  exactly; `dev` should not invent a separate CSS media query for it.
- The dialog's own Radix open/close animation (`fade-in-0 zoom-in-95`, `duration-100`) is untouched.
- The `xilo` variant's `hover:scale-105` / `active:scale-95` on `SIM` and `NÃO` is inherited and not
  overridden.

### Not in scope, restated so `dev` does not drift into it

No `supabase` import. No `.ics` generation. No second calendar provider. No "already added" memory, no
third storage key. No change to `rsvpSchema`, `RsvpFormFields`, `CarvedTextField`,
`CarvedStepperField`, the confetti, the feedback message, or either storage key's name or shape. No
edit to `src/components/ui/`. No new asset, token or `globals.css` utility.

## Risks / Trade-offs

- **[Trade-off]** `GuestStep` receives the whole `UseFormReturn` as a prop, which is not a pretty API.
  → Accepted: `useForm` cannot move down without breaking the shipped "filled values survive close and
  reopen" requirement, and the form branch cannot stay inline without breaking the 60-line lint limit.
  The prop is typed explicitly, so a mismatch is a compile error rather than a runtime surprise.
- **[Risk]** The confetti starts on the page while the dialog is still playing its 100 ms exit
  animation, so the first frames are behind a fading overlay. → Accepted; 100 ms of a multi-second
  animation. The alternative, a timer, is worse. QA looks at it once on a real device.
- **[Risk]** `window.open` can still be blocked by a hardened browser or an in-app webview, and the
  guest gets no feedback. → Accepted: the RSVP is already confirmed, the reminder is an extra, and an
  error state for a blocked popup would be more alarming than the missing tab. Flagged for QA to try
  once in an in-app browser (Instagram/WhatsApp), which is how a good share of guests will open this.
- **[Risk]** The `sr-only` new-tab hint renders the literal `{{copy: calendar_new_tab_hint}}` into the
  `SIM` button's accessible name until the copy writer fills it, so a screen reader announces the
  marker. → **Mitigation**: it is the only placeholder in this change and it is listed first in the
  content table; the same discipline already applies to `{{copy: rsvp_feedback_fallback}}`, which is
  visible on screen. `dev` renders it verbatim regardless — inventing the string would be writing
  final copy.
- **[Risk]** Closing the calendar step now writes to storage, reversing a rule the previous change
  states plainly ("backing out writes nothing to browser storage"). A reader who checks only the older
  artifact will think this is a bug. → **Mitigation**: the delta restates that requirement scoped to
  the form step, and both scenarios (form-step close writes nothing / calendar-step close confirms)
  are spelled out side by side.
- **[Risk]** The panel's height changes between steps and the dialog is centre-anchored, so the whole
  panel jumps on the swap. → Accepted, not animated; QA checks at 320px and at a desktop width that
  nothing overflows or is clipped during the swap.
- **[Risk]** The event's date now exists twice in the codebase — as display copy in `EventDetails.tsx`
  and as `20260927T113000` in `googleCalendarUrl.ts` — and they can drift. → **Mitigation**: flagged in
  the proposal's out-of-boundary list and as an explicit verification task. Not unified, because a
  shared source would have to serve both a Portuguese human string and a Google API format, and the
  transform between them is more code than the duplication costs at one event.
- **[Trade-off]** `SIM` is a button rather than a link, so middle-click, long-press and "open in
  background" do not work on it. → Accepted in exchange for the click not racing the dialog's unmount.
- **[Open, minor]** The event ends at 20:00, so the guest's calendar shows an 8½-hour block. That is
  the user's fixed decision and is implemented as given; raised in the proposal in case they want a
  shorter block.

## Open Questions

- **Does the `CalendarPlus` icon stay?** Decided as yes and implementable as-is. It is the one purely
  additive element in the step and the easiest thing to cut if the caller wants the step barer.
- **Should `SIM`/`NÃO` really be equal weight?** Decided as yes, with reasons above. If the caller
  wants `SIM` to lead, the cheapest honest change is order and width (`SIM` wider), not a new variant
  and not transparency on `NÃO`.

Deliberately deferred rather than open: an `.ics` download for Apple/Outlook guests, remembering that
the guest already added the event, and offering the reminder again from the restored success state.
All three are follow-up changes and none of them is blocked by this one.

## Content slots for the copy writer

Every string in this step is **fixed by the user** and is written verbatim, not drafted:
`Calendário`, `Adicionar lembrete no calendário google?`, `SIM`, `NÃO`, and the calendar event's own
strings `Aniversário do Muri`, `Alto da Serra Recepções, Cuité` and `Venha celebrar com a gente`.
`Fechar` (the corner `X`'s accessible name) and `Confirmar` are unchanged from the shipped code.

One slot is left:

| Slot                              | Must communicate                                                                                     | Length     | Tone                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `{{copy: calendar_new_tab_hint}}` | That activating `SIM` opens Google Calendar in a new tab. `sr-only`, inside the button, never visible | ≤ 5 words  | Plain and factual — it is a navigation warning, not part of the invitation's voice    |
