## 1. Prerequisites

- [ ] 1.1 Re-read `src/pages/InvitePage/partials/ModalForm.tsx` and `RsvpForm.tsx` as they stand on
      disk — this change moves code between them, and `RsvpForm.confirm` currently closes the modal
      itself (`setIsModalOpen(false)`), which task 5.1 removes
- [ ] 1.2 Confirm `DialogDescription` is already exported from `src/components/ui/dialog.tsx` and that
      **no shadcn component needs to be added** by this change; `src/components/ui/` is not hand-edited
      (`AGENTS.md`) and every deviation below is a call-site override
- [ ] 1.3 Confirm `lucide-react` exports `CalendarPlus` and that `framer-motion` exposes
      `useReducedMotion`, both already used elsewhere on this page — **no new dependency is added**
- [ ] 1.4 Note the exact type of `useForm`'s return in `ModalForm` today —
      `UseFormReturn<RsvpFormInput, unknown, RsvpFormData>` — because task 3.2 passes it as a prop and
      the three generics must match exactly or the call site will not typecheck

## 2. The calendar URL (`src/lib/calendar/googleCalendarUrl.ts`)

- [ ] 2.1 Create `src/lib/calendar/` as a sibling of the existing `src/lib/schemas/` and
      `src/lib/formatters/`, and add `googleCalendarUrl.ts` — pure, no React import, no side effect
- [ ] 2.2 Declare a local `interface CalendarEvent` with `title`, `startsAt`, `endsAt`, `timeZone`,
      `location` and `description`, all `string`, and export a `BIRTHDAY_EVENT` constant holding the
      user's fixed values: `Aniversário do Muri`, `20260927T113000`, `20260927T200000`,
      `America/Sao_Paulo`, `Alto da Serra Recepções, Cuité`, `Venha celebrar com a gente`
- [ ] 2.3 Export `buildGoogleCalendarUrl(event: CalendarEvent): string` producing
      `https://calendar.google.com/calendar/render` with `action=TEMPLATE`, `text`, `dates` as
      `<startsAt>/<endsAt>`, `ctz`, `details` and `location`
- [ ] 2.4 Build the query string with `URLSearchParams`, never with concatenation or a hand-rolled
      `encodeURIComponent` chain — three of the five values carry `ç`, `õ`, `é`, a comma or a slash,
      and this is where a mojibake bug hides
- [ ] 2.5 Do **not** normalise `URLSearchParams`' output: it emits `%2F` for the slash in `dates` and
      in `ctz`, and `+` for spaces. Google's template endpoint accepts both; "fixing" it to look
      prettier is a regression
- [ ] 2.6 Use **no `Date` object anywhere** in this module. The strings are already in the format the
      endpoint wants; parsing and reformatting them round-trips through the browser's local time zone,
      which is the usual source of a one-hour bug in this exact feature
- [ ] 2.7 Keep identifiers at 3+ characters (`id-length`) and the function small enough for
      `complexity` (8) — one `URLSearchParams` construction plus one template string is enough

## 3. The two step components (`src/pages/InvitePage/partials/`)

- [ ] 3.1 Create `GuestStep.tsx` by **moving** the existing `<Form>` / `<form>` / `RsvpFormFields` /
      `DialogFooter` + "Confirmar" block out of `ModalForm` verbatim. Do not restyle it, do not
      rename the button, do not touch `RsvpFormFields`
- [ ] 3.2 Give `GuestStep` a local `interface GuestStepProps` of
      `form: UseFormReturn<RsvpFormInput, unknown, RsvpFormData>` and `onValid: (data: RsvpFormData) =>
    void`, and a named export. **`useForm` is not called here** — it must stay in `ModalForm`, which
      stays mounted while `DialogContent`'s children unmount, or the shipped "filled values survive the
      modal being closed and reopened" requirement breaks
- [ ] 3.3 Create `CalendarStep.tsx` with a named export and a local `interface CalendarStepProps` of
      `onClose: () => void` — the single callback both answers use. It takes no other prop and holds
      no state beyond `useReducedMotion()`
- [ ] 3.4 Lay the step out as `flex flex-col items-center gap-6 text-center`, containing, in order: the
      Lucide `CalendarPlus` icon, the message, and the footer row
- [ ] 3.5 Icon: `CalendarPlus` at `h-10 w-10 shrink-0 text-sertao-brown` with `aria-hidden="true"` —
      the same icon treatment `EventDetails`'s `FactRow` uses. No new asset, no hand-drawn SVG
- [ ] 3.6 Message: render the fixed string `Adicionar lembrete no calendário google?` inside
      `DialogDescription` with `font-body text-xl text-carved-black sm:text-2xl text-balance`,
      overriding the generated `text-sm text-muted-foreground` at the call site — `muted-foreground` is
      outside the three-token palette
- [ ] 3.7 Footer: reuse the form step's existing override verbatim —
      `m-0 flex-row justify-center gap-3 border-0 bg-transparent p-0` on `DialogFooter`
- [ ] 3.8 Render "SIM" then "NÃO", both `Button variant="xilo" type="button"` with
      `h-14 flex-1 text-base sm:flex-none sm:px-10`. They are deliberately **identical** in weight,
      size and silhouette — no primary/secondary, no opacity, no lighter border, no fourth colour. Both
      keep `.carved-3` from the `xilo` variant and are meant to match each other, the same way the
      `−`/`+` stepper pair does
- [ ] 3.9 "NÃO" calls `onClose()` and nothing else
- [ ] 3.10 "SIM" calls `window.open(calendarUrl, '_blank', 'noopener')` as the **first statement** of
      its handler, synchronously inside the click, and then calls `onClose()`. Do **not** branch on
      `window.open`'s return value — with `'noopener'` it returns `null` by design — and do not add
      any error state for a blocked popup
- [ ] 3.11 Do **not** implement "SIM" as `Button asChild` around an `<a target="_blank">`, even though
      `EventDetails`'s map link does exactly that. This link closes the dialog in the same click, which
      unmounts the anchor during event dispatch and can silently drop the navigation
- [ ] 3.12 Compute the URL once at module scope (`const calendarUrl = buildGoogleCalendarUrl(
    BIRTHDAY_EVENT)`), not inside the handler and not in a `useMemo`
- [ ] 3.13 Add an `sr-only` span inside the "SIM" button carrying `{{copy: calendar_new_tab_hint}}`
      rendered **verbatim**, so a screen reader user is told a new tab opens. Do not invent the string
- [ ] 3.14 Animate the step's root with `framer-motion`: `opacity: 0 → 1`, `y: 8 → 0`, `duration: 0.25`,
      `ease: 'easeOut'`, declared as a module-level `Variants` constant like every other partial on this
      page. With `useReducedMotion() ?? false` true, pass `initial={false}` so it appears instantly
- [ ] 3.15 Add **no** `AnimatePresence`, no exit animation, no cross-fade between steps and no animated
      panel height — the form unmounts immediately and the panel's height jump is accepted

## 4. `ModalForm` becomes a two-step flow

- [ ] 4.1 Add a `type RsvpModalStep = 'form' | 'calendar'` and keep `useForm` + `zodResolver(rsvpSchema)`
      exactly where they are
- [ ] 4.2 Write `function useRsvpModalFlow(onConfirm, onOpenChange)` **in the same file**, above the
      component and not exported: it owns `step` and `confirmedData: RsvpFormData | null` and returns
      `{ step, confirmValid, requestClose, handleOpenChange }`. Two parameters keeps it inside
      `max-params` (3), and the split is what keeps both it and `ModalForm` inside `complexity` (8) and
      `max-lines-per-function` (60). Do **not** create a `src/pages/InvitePage/hooks/` directory for it
- [ ] 4.3 `confirmValid(data)` — passed to `GuestStep` as `onValid` and reached only from
      `handleSubmit`'s success path — SHALL do exactly two things: store the payload and set the step to
      `'calendar'`. **It must not call `onConfirm`.**
- [ ] 4.4 `handleOpenChange(next)` is the **only** handler passed to `<Dialog onOpenChange>`. When
      `next` is `false` **and** `confirmedData !== null`, it calls `onConfirm(confirmedData)` and then
      `onOpenChange(false)`; otherwise it just calls `onOpenChange(next)`. Guard on the payload being
      non-null, not on `step === 'calendar'` — the payload is what makes a close meaningful
- [ ] 4.5 `requestClose()` is `handleOpenChange(false)` and is what `CalendarStep`'s `onClose` receives.
      Do not give the two answer buttons their own `onConfirm` path — five exits, one funnel
- [ ] 4.6 Do **not** wrap `onConfirm` in a `setTimeout` to let the dialog's exit animation finish. The
      ~100 ms overlap of confetti behind a fading overlay is accepted and documented
- [ ] 4.7 Do **not** reset `step` back to `'form'` on close: it would re-render the form behind the
      exit animation as a visible flicker, and nothing reopens the modal after a confirmation
- [ ] 4.8 Do **not** add a "already confirmed" dedupe flag. Re-running `onConfirm` rewrites the same two
      keys and re-sets two booleans to the values they hold, so React bails out and the confetti does
      not replay
- [ ] 4.9 Render **one** `DialogTitle` in `DialogHeader`, keeping its existing
      `font-title text-2xl text-carved-black sm:text-3xl`, with its text derived from `step`:
      `'Convidado'` on the form step, `'Calendário'` on the calendar step. Both are fixed strings, not
      copy placeholders. Do **not** render a separate title inside each step component
- [ ] 4.10 Give that `DialogTitle` `tabIndex={-1}`, `outline-none` and a ref, and focus it from a
      `useEffect` keyed on `step` when `step` becomes `'calendar'` — the "Confirmar" button that had
      focus is unmounted by the swap, and without this focus falls to `document.body`. The effect must
      not fire on the initial open, since `step` starts at `'form'`
- [ ] 4.11 Render the branch as `step === 'form' ? <GuestStep form={form} onValid={confirmValid} /> :
    <CalendarStep onClose={requestClose} />`, leaving `CloseModalButton`, `DialogHeader` and every
      `DialogContent` class (`carved-1`, `border-4`, `max-h-[90dvh] overflow-y-auto`, the padding, the
      `sm:max-w-md`) untouched
- [ ] 4.12 Keep `showCloseButton={false}` and `ModalFormProps` unchanged —
      `open`, `onOpenChange`, `onConfirm: (data: RsvpFormData) => void`. The **signature does not
      change**; only when `onConfirm` fires does

## 5. `RsvpForm` stops owning the close

- [ ] 5.1 Delete the `setIsModalOpen(false)` line from `RsvpForm`'s `confirm` callback. `ModalForm` now
      closes the modal and then tells `RsvpForm` it happened; leaving the line in would give two
      components the same job
- [ ] 5.2 Leave everything else in `confirm` untouched: the two independent `try`/`catch` storage
      writes, `setConfirmedName`, `setHasConfirmed`, `setJustConfirmed`, and `buildFeedbackMessage`
- [ ] 5.3 Verify `RsvpForm` gains **no** new state, no knowledge of the step, and no import from
      `src/lib/calendar/` — the whole feature sits below its level

## 6. Scope guard

- [ ] 6.1 Verify no touched file imports `supabase`, and that no network request, submit-pending state
      or submit-error state was introduced
- [ ] 6.2 Verify nothing was changed in `rsvpSchema.ts`, `RsvpFormFields.tsx`, `CarvedTextField.tsx`,
      `CarvedStepperField.tsx`, `whatsappNumber.ts`, the confetti, the feedback message, or either
      storage key's name or shape
- [ ] 6.3 Verify `src/components/ui/` was not hand-edited: `DialogDescription`'s `text-sm
    text-muted-foreground` is neutralised at the call site, and `DialogOverlay`'s `bg-black/10` +
      `backdrop-blur-xs` is left exactly as it is — still out of scope, still a follow-up change
- [ ] 6.4 Verify no new `.svg`/`.png` asset, no new design token and no new `globals.css` utility was
      added, and that no colour outside `carved-black` / `bone-white` / `sertao-brown` appears in the
      new files
- [ ] 6.5 Verify no `.ics` generation, no second calendar provider, no third storage key and no
      "already added" memory was introduced
- [ ] 6.6 Verify the fixed strings are written exactly: `Calendário`,
      `Adicionar lembrete no calendário google?`, `SIM`, `NÃO`, `Aniversário do Muri`,
      `Alto da Serra Recepções, Cuité`, `Venha celebrar com a gente` — and that
      `{{copy: calendar_new_tab_hint}}` is the **only** `{{copy: …}}` marker this change adds, rendered
      verbatim

## 7. Verification

- [ ] 7.1 Verify a valid submit swaps the modal's content in place: the same dialog stays open, no
      second modal appears, the title reads "Calendário", and the page behind it still shows the
      confirmation button with no confetti
- [ ] 7.2 Verify in devtools that **nothing** is written to `digital-invite:rsvp-confirmed` or
      `digital-invite:rsvp-name` at the moment of the swap, and that both are written the moment the
      modal closes from the calendar step
- [ ] 7.3 Verify each of the five exits — "SIM", "NÃO", the corner `X`, Escape, an overlay tap —
      closes the modal, writes both keys exactly once, plays the confetti once and shows
      `Tá confirmado <primeiro nome>!`
- [ ] 7.4 Verify an invalid submit still keeps the modal on the form step with its fields flagged and
      never reaches the calendar step
- [ ] 7.5 Verify "SIM" opens a **new tab** and that the original tab is still at `/` with the invite
      page intact, then check the Google Calendar form is pre-filled with `Aniversário do Muri`,
      27/09/2026 11:30–20:00, `Alto da Serra Recepções, Cuité` and `Venha celebrar com a gente`, with
      `ç`, `õ` and `é` all rendered correctly and no `%C3` visible in the event fields
- [ ] 7.6 Verify the time zone by changing the OS/browser time zone away from `America/Sao_Paulo` and
      confirming Google still shows the event at 11:30 in São Paulo time, not shifted to the device's
      zone
- [ ] 7.7 Verify the popup path in an in-app webview (open `/` from a WhatsApp or Instagram message)
      and confirm that whether or not the tab opens, the modal closes, no error appears and the RSVP
      is confirmed
- [ ] 7.8 Verify with a screen reader that the dialog is announced as "Calendário" after the swap, that
      focus lands on the title rather than on the page body, that Tab reaches "SIM", "NÃO" and "Fechar"
      in that order, and that the icon is not announced
- [ ] 7.9 Verify that the placeholder `{{copy: calendar_new_tab_hint}}` is present in the "SIM" button's
      accessible name — it is expected to be announced literally until the copy writer fills it, and
      this check exists so it is not mistaken for a bug
- [ ] 7.10 Verify at 320px that both answer buttons fit on one row, neither label wraps, both measure at
      least 44×44, and the panel neither overflows nor clips during the swap; repeat at a desktop width
- [ ] 7.11 Verify with `prefers-reduced-motion: reduce` that the calendar step appears instantly with no
      fade and no travel, and that the page's existing confetti gating is unchanged
- [ ] 7.12 Verify backing out from the **form** step (corner `X`, Escape, overlay tap) still leaves the
      confirmation button in place, writes nothing to storage, and that reopening the modal in the same
      session still shows the values the guest had typed — the `useForm`-stays-in-`ModalForm` decision
      is what protects this, so it is the regression most likely to be introduced here
- [ ] 7.13 Verify a returning guest (both storage keys present) still goes straight to the restored
      success state on reload and is never offered the calendar step again
- [ ] 7.14 Cross-check that `EventDetails.tsx`'s display strings (`27 de setembro de 2026`, `11h30`,
      `Alto da Serra Recepções, Cuité`) and `googleCalendarUrl.ts`'s machine values describe the same
      event. They are deliberately not shared; this check is the only thing keeping them in step
- [ ] 7.15 Run `yarn lint && yarn typecheck && yarn build` and verify all three succeed with no new
      warnings from `ModalForm.tsx`, `GuestStep.tsx`, `CalendarStep.tsx`, `RsvpForm.tsx` or
      `googleCalendarUrl.ts`, and that `ModalForm` and `useRsvpModalFlow` are both inside
      `max-lines-per-function` (60) and `complexity` (8)
