## 1. Prerequisites

- [x] 1.1 Add shadcn's `input`, `label` and `form` primitives via the shadcn CLI (`radix-nova`
      preset) so they land in `src/components/ui/input.tsx`, `label.tsx` and `form.tsx`, and verify
      they import cleanly — `src/components/ui/` is **not** hand-edited (`AGENTS.md`); every
      deviation in sections 4–6 is a call-site override
- [x] 1.2 Read the generated `input.tsx` and list, for `dev`'s own reference while writing
      `CarvedTextField`, every class that must be neutralised at the call site: the focus ring
      (`focus-visible:ring-*`, `focus-visible:border-ring`), the `aria-invalid:ring-destructive` /
      `aria-invalid:border-destructive` pair, the base `rounded-*`, `shadow-*`, and `dark:bg-input/30`
- [x] 1.3 Read the generated `form.tsx` and confirm `FormField`/`FormControl`/`FormMessage` wire
      `aria-describedby` and `aria-invalid` automatically — that wiring is the reason `form` is added
      via the CLI instead of hand-rolling label/error association — and note that `FormMessage`
      applies `text-destructive` (red, off-palette) and **must** be overridden at the call site
- [x] 1.4 Confirm `react-hook-form` and `@hookform/resolvers` are already in `package.json` and that
      **no new dependency is added by this change**; the WhatsApp mask is hand-rolled and the four
      icons (`Minus`, `Plus`, `TriangleAlert`, `X`) all come from the installed `lucide-react`
- [x] 1.5 Confirm against the installed `zod@^4.6.2` typings the exact spelling of the per-issue
      message parameter in Zod v4 (the v3 `invalid_type_error` no longer exists) before writing
      section 2 — `SYSTEM-DESIGN.md` §6's snippet is v3-era and must not be trusted

## 2. Schema (`src/lib/schemas/rsvpSchema.ts`)

- [x] 2.1 Add `.trim()` and `.max(60, …)` to `name`, with the `{{copy: rsvp_error_name_max}}`
      placeholder as the max message; verify `"  a  "` now fails `.min(2)` as it should
- [x] 2.2 Add a module-level exported constant for the guest-count ceiling (value `10`) and use it as
      `guestCount`'s `.max()` bound, so the schema and the stepper's `+` ceiling cannot drift; the
      stepper in section 4 imports it rather than re-typing `10`
- [x] 2.3 Give `guestCount` a `.max()` message (`{{copy: rsvp_error_guest_count_max}}`), an `.int()`
      message (`{{copy: rsvp_error_guest_count_int}}`) and an explicit non-numeric/coercion message
      (`{{copy: rsvp_error_guest_count_type}}`) — without the last one, `z.coerce.number()` on a typed
      letter answers with Zod's English "expected number, received NaN", which a Brazilian guest can
      reach
- [x] 2.4 Add the `whatsapp` field: `z.string().trim()`, a `.min(1, …)` carrying
      `{{copy: rsvp_error_whatsapp_required}}`, and `.regex(/^\d{2} 9 \d{4}-\d{4}$/, …)` carrying
      `{{copy: rsvp_error_whatsapp_format}}`. No `.transform()` — the validated value stays the
      formatted string the guest sees, so `RsvpFormData['whatsapp']` matches the input's value
- [x] 2.5 Leave `email` unchanged (`z.email('E-mail inválido')` is already correct on v4) and leave
      the three existing pt-BR messages verbatim
- [x] 2.6 Extend the docblock's column mapping with
      `whatsapp -> rsvp.whatsapp   (recommended; no column is documented yet)`, plus two flagged
      notes: that no Supabase column exists for a phone and that digit normalisation for the database
      belongs to the future insert change, and that `PROJECT.md` §6 (`number_of_persons`) and
      `SYSTEM-DESIGN.md` §3.1 (`numero_pessoas`) contradict each other on the guest-count column.
      Flag only — do not pick a winner and do not create or assume any column

## 3. WhatsApp mask (`src/lib/formatters/whatsappNumber.ts`)

- [x] 3.1 Create the new `src/lib/formatters/` directory as a sibling of `src/lib/schemas/` and add
      `whatsappNumber.ts` exporting one pure function,
      `formatWhatsappNumber(raw: string): string` — no React import, no side effect
- [x] 3.2 Implement it as: strip every non-digit, keep at most 11 digits, then emit by digit count —
      `0 → ''`, `1–2 → 83`, `3 → 83 9`, `4–7 → 83 9 8765`, `8–11 → 83 9 8765-4321`. Write it as
      slice-and-join over the digit string, not a chain of `if`s on the length, to stay inside
      ESLint's `complexity` max of 8, and use identifiers of 3+ characters (`id-length`)
- [x] 3.3 Verify by hand that **no output ever carries a trailing separator** — `83 ` and
      `83 9 8765-` must be unreachable at every digit count; this is what makes a single Backspace
      remove an orphaned separator in the same keystroke
- [x] 3.4 Verify pasting `(83) 98765-4321` yields `83 9 8765-4321`, and that typing past 11 digits
      does not grow the value
- [x] 3.5 Do **not** attempt caret preservation. Reformatting from digits sends the caret to the end
      on a mid-string edit; this is an accepted, documented cost for a 14-character field, not a
      defect to fix here (design.md, "The WhatsApp mask")

## 4. Shared form primitives (`src/components/form/`)

- [x] 4.1 Create the new `src/components/form/` directory — these two primitives are deliberately
      **not** under `InvitePage/partials/`, because they are the reference `src/components/admin/
    LoginForm.tsx` will consume later
- [x] 4.2 Add `CarvedTextField.tsx`: label + ruled-line input + error message, built on the generated
      `Input`/`Label`/`Form*` primitives, with a local `interface CarvedTextFieldProps`, a named
      export, and props for label, field name, placeholder, `inputMode`, `autoComplete`, `maxLength`
      and an optional helper line
- [x] 4.3 Give the input the ruled-line treatment at the call site: `rounded-none`,
      `border-0 border-b-4 border-sertao-brown`, `bg-bone-white`, `h-12`,
      `font-body text-lg text-carved-black`, full width, no shadow — and neutralise every generated
      default listed in task 1.2
- [x] 4.4 Implement focus as more ink, not a ring: via `focus-within` on the field wrapper, the rule
      goes `border-sertao-brown → border-carved-black` and the label darkens with it. The rule's
      **weight never changes** (no `border-b-6` on focus), so focusing a field shifts no layout
- [x] 4.5 Implement the error state as a doubled cut: the input's own `border-b-4 border-carved-black`
      plus a `border-b-2 border-carved-black` on the wrapper, separated by ~3px of wrapper padding;
      below it the message in `font-body text-base text-carved-black` preceded by an inline Lucide
      `TriangleAlert` at `size-4` with `aria-hidden`. Override `FormMessage`'s `text-destructive` —
      `globals.css` maps it to a red that is outside the three-token palette
- [x] 4.6 Make an errored field's rule read `carved-black` in both focused and unfocused states: the
      doubled rule wins on the rule, focus shows in the label
- [x] 4.7 Add `CarvedStepperField.tsx`: label + `−` / typeable value / `+` row. The value field is
      `type="text"` with `inputMode="numeric"` and `maxLength={2}` — **not** `type="number"`, so no
      native spinner exists to hide and no `appearance-none` or `::-webkit-inner-spin-button`
      override is needed. Centre the value (`w-16 text-center`) on the same ruled line as 4.3
- [x] 4.8 Render the two controls as `Button variant="xilo"`, `type="button"`, with a `size-11`
      class override (44px floor; `size="icon-lg"` is only 36px), containing Lucide `Minus` / `Plus`
      at `size-5` with `aria-hidden`, and the pt-BR accessible names "Diminuir quantidade" and
      "Aumentar quantidade". They call `setValue` with `{ shouldValidate: true }`
- [x] 4.9 Disable `−` at 1 and `+` at the ceiling constant imported from `rsvpSchema` (task 2.2).
      Both buttons keep `.carved-3` from the `xilo` variant and deliberately match each other — a
      `−`/`+` pair is one control, and alternating their silhouettes would look like a mistake
- [x] 4.10 Add **no motion** anywhere in either primitive: no field entrance, no error slide-in, no
      transition on the focus colour beyond what `xilo` already inherits
- [x] 4.11 Verify neither primitive introduces a new design token, a new `globals.css` utility, or any
      colour outside `carved-black` / `bone-white` / `sertao-brown`

## 5. The four fields (`src/pages/InvitePage/partials/RsvpFormFields.tsx`)

- [x] 5.1 Create `RsvpFormFields.tsx` holding the four fields in order and **no state of its own**;
      it reads the form context provided by `ModalForm`
- [x] 5.2 Field 1 — name: `CarvedTextField`, label "Seu nome" (fixed string, not a placeholder),
      `autoComplete="name"`
- [x] 5.3 Field 2 — WhatsApp: `CarvedTextField`, label "Whatsapp",
      `placeholder="83 9 xxxx-xxxx"` (the caller's exact string), `inputMode="tel"`,
      `autoComplete="tel"`, `maxLength={14}`, and an `onChange` that passes
      `formatWhatsappNumber(event.target.value)` to `react-hook-form`'s `field.onChange` so the
      displayed and stored values are always the same string and the input stays controlled
- [x] 5.4 Render `{{copy: rsvp_whatsapp_helper}}` as the WhatsApp field's helper line, below the label
      or the rule per `CarvedTextField`'s API — it answers why the number is being asked for
- [x] 5.5 Field 3 — e-mail: `CarvedTextField`, label "E-mail", `inputMode="email"`,
      `autoComplete="email"`
- [x] 5.6 Field 4 — guest count: `CarvedStepperField`, label "Quantidade de convite"
- [x] 5.7 Space the stack with `space-y-5` between fields, `gap-2` between a label and its rule, and
      `gap-1.5` between a rule and its message, all `text-left`

## 6. `ModalForm` owns the form (`src/pages/InvitePage/partials/ModalForm.tsx`)

- [x] 6.1 Change `ModalFormProps.onConfirm` from `() => void` to `(data: RsvpFormData) => void` and
      update `RsvpForm`'s call site in the same step so the project keeps typechecking
- [x] 6.2 Call `useForm` with `zodResolver(rsvpSchema)` inside `ModalForm` and `defaultValues` of
      empty strings for name, WhatsApp and e-mail, and `1` for `guestCount` — an explicit reversal of
      `add-rsvp-confirmation-section`'s "`ModalForm` owns no state of its own", justified in
      design.md's "Where the form lives"
- [x] 6.3 Leave `mode` at `react-hook-form`'s default (`'onSubmit'` plus `reValidateMode: 'onChange'`)
      — **not** `onChange` — so a guest is not told their e-mail is invalid while they are still
      typing the `@`, but a flagged field clears as soon as it is fixed
- [x] 6.4 Call `onConfirm(data)` only from `handleSubmit`'s success path, so `RsvpForm` never sees
      unvalidated data
- [x] 6.5 Do **not** reset the form when the modal closes: values persist for the page session so
      reopening resumes where the guest left off. There is nothing to reset after success — the
      confirmation button never comes back
- [x] 6.6 Wrap `<form>` from `RsvpFormFields` through `DialogFooter` inclusive so the submit button is
      inside the form and Enter in any field submits
- [x] 6.7 Replace the fixed body `'Em breve!'` with `{{copy: rsvp_modal_intro}}` in
      `DialogDescription`, and keep the title as the fixed string `'Convidado'` (`font-title`,
      centred via `DialogHeader`)
- [x] 6.8 Remove the `text-center` currently on `DialogContent` — the header stays centred through
      `DialogHeader`, while the field stack and every error message are left-aligned; centred labels
      over left-aligned values are unreadable
- [x] 6.9 Adjust `DialogContent`: `sm:max-w-md` (up from the generated `sm:max-w-sm`),
      `px-5 py-8 sm:px-8 sm:py-10` (down from the shipped `px-6 py-10 sm:px-10 sm:py-12`), and
      `max-h-[90dvh] overflow-y-auto` so the whole carved panel scrolls as one when four fields plus
      errors exceed a 320×568 viewport. Keep `.carved-1` and `border-4` unchanged
- [x] 6.10 Keep the footer's existing `m-0 flex-row justify-center gap-3 border-0 bg-transparent p-0`
      override and make the "Confirmar" button `type="submit"` with
      `h-14 w-full sm:w-auto sm:px-8 text-base`. The label stays the fixed string "Confirmar" — not a
      copy placeholder
- [x] 6.11 Fix the shipped corner close control: give the `DialogClose`-wrapped button
      `aria-label="Fechar"` (it currently has **no accessible name at all** — a bare Lucide `<X />`),
      `aria-hidden` on the icon, and a `size-11` override (it is `size="icon-sm"`, 28px, under the
      44px floor, and it is the modal's only visible dismissal affordance on a phone)
- [x] 6.12 Replace that button's `hover:bg-amber-800` — a stock Tailwind colour outside the palette —
      with `hover:bg-sertao-brown hover:text-bone-white`
- [x] 6.13 Keep `showCloseButton={false}` on `DialogContent` so the generated control with its English
      `sr-only` "Close" stays suppressed, and verify Escape and an overlay tap still close the modal
      through `onOpenChange` alone, writing nothing to storage
- [x] 6.14 Keep `ModalForm` inside ESLint's `max-lines-per-function` (60) and `complexity` (8) by
      leaving the fields in `RsvpFormFields` — do not inline them back

## 7. `RsvpForm`: validated payload, the name, and the message

- [x] 7.1 Change `RsvpForm`'s confirm handler to take the validated `RsvpFormData`; it keeps doing
      exactly what it does today — write storage, set `hasConfirmed`/`justConfirmed`, close the modal
      — one argument richer. `onOpenChange` still touches nothing but `isModalOpen`
- [x] 7.2 Declare the second storage key once as a module-level constant —
      `const RSVP_NAME_STORAGE_KEY = 'digital-invite:rsvp-name'` — beside the existing
      `RSVP_CONFIRMED_STORAGE_KEY`, and do not repeat the literal at the read or write site
- [x] 7.3 Add `readConfirmedName()` as a third module-level helper returning the raw stored string or
      `null`, with the **same `try`/`catch` contract** as the existing two: any throw returns `null`,
      nothing surfaces to the guest. No `JSON.parse`, no schema, no re-validation against
      `rsvpSchema` — a bound changing in a later release must not silently downgrade a guest
- [x] 7.4 Read it in its own lazy `useState` initializer alongside the existing
      `useState(() => readConfirmedFlag())`, so the restored message is correct from first paint
- [x] 7.5 Add `writeConfirmedName(name)` writing the raw string, in its **own** `try`/`catch`, and
      call it from the confirm handler as a separate statement from `writeConfirmedFlag()` — two
      independent blocks, never one block around both, so a quota error on the second cannot roll back
      the first
- [x] 7.6 Treat an absent, empty or whitespace-only stored name as no name at all — one `.trim()`
      check, and the only validation applied to a restored name
- [x] 7.7 Add one small module-level function that takes a name and returns the feedback string, so
      the named and fallback paths are decided in one place rather than in JSX: a usable name yields
      `Tá confirmado <primeiro nome>!` using the substring before the first space of the trimmed name
      (a single-word name yields itself unchanged); no usable name yields
      `{{copy: rsvp_feedback_fallback}}`
- [x] 7.8 On a fresh confirmation, build the message from the **payload**, not from storage, so the
      in-session message is correct even when the write failed
- [x] 7.9 Delete the literal `{user_name}` token from the codebase entirely — it is not a variable and
      was never a template; leaving it would invite a future reader to write their own interpolation
- [x] 7.10 Keep every storage helper a small named module-level function so `RsvpForm` stays inside
      ESLint's `complexity` (8) and `max-lines-per-function` (60), with no `any` and no `as` cast

## 8. Scope guard

- [x] 8.1 Verify no touched file imports `supabase`, and that no `useRsvpSubmit` hook, no network
      request, no submit-pending state and no submit-error state was introduced — a valid submit still
      only closes the modal and plays the existing celebration
- [x] 8.2 Verify no deadline check against 26/09/2026 exists anywhere, and that the admin dashboard
      was not touched
- [x] 8.3 Verify `src/components/ui/` was not hand-edited: every deviation from `input.tsx`,
      `label.tsx`, `form.tsx`, `button.tsx` and `dialog.tsx` is a call-site override
- [x] 8.4 Verify no new `.svg`/`.png` asset, no new design token, and no new `globals.css` utility was
      added, and that `DialogOverlay`'s `bg-black/10` + `backdrop-blur-xs` was left untouched — it is
      unreachable from the call site and belongs to a follow-up change
- [x] 8.5 Verify every `{{copy: …}}` marker is rendered verbatim so the copy writer can find it, and
      that the fixed strings are written exactly: `Convidado`, `Seu nome`, `Whatsapp`,
      `83 9 xxxx-xxxx`, `E-mail`, `Quantidade de convite`, `Confirmar`, `Fechar`,
      `Diminuir quantidade`, `Aumentar quantidade`

## 9. Verification

- [ ] 9.1 Verify submitting an empty form keeps the modal open, flags every invalid field, plays no
      confetti and writes nothing to browser storage
- [ ] 9.2 Trigger **each** validation message by hand — short name, 61-character name, invalid e-mail,
      empty WhatsApp, landline WhatsApp, partial WhatsApp, a letter in the guest count, `1.5` in the
      guest count, `50` in the guest count — and verify every one renders in Portuguese, with no Zod
      English default reachable anywhere (this is the Zod v4 message-param risk; reading the schema is
      not enough)
- [ ] 9.3 Verify error timing: no message appears on the first keystroke into an untouched field,
      messages appear on blur and on submit, and a flagged field's message clears as it is fixed
- [ ] 9.4 Verify a valid submit closes the modal, plays the confetti once, and shows
      `Tá confirmado <primeiro nome>!` — check a multi-part name ("Maria das Graças Figueredo" →
      "Maria") and a single-word name
- [ ] 9.5 Verify in devtools that a successful confirmation writes `digital-invite:rsvp-confirmed` as
      exactly `true` and `digital-invite:rsvp-name` as the raw submitted name with no JSON wrapper
- [ ] 9.6 Verify the returning-guest paths: with both keys present, the named message renders from
      first paint with no confirmation button flash; with the flag present and the name key **deleted**
      (the state of every guest who confirmed under the shipped build), the section renders
      `{{copy: rsvp_feedback_fallback}}` with no empty gap and no stray punctuation; with the name key
      holding only spaces, the same fallback renders
- [ ] 9.7 Verify a flag value that is not exactly `'true'` yields the confirmation button even when a
      name is stored, and that the stored name is never rendered in that case
- [ ] 9.8 Verify with storage blocked (browser site-data setting, or a devtools override that makes
      `localStorage` throw) that the page loads with the confirmation button, that a valid submit still
      closes the modal, plays the celebration and greets the guest by first name, and that no error
      reaches the guest
- [ ] 9.9 Verify the WhatsApp field at each digit count: `839` shows `83 9` with no trailing space,
      a single Backspace from `83 9 8765` shows `83 9 876`, and a full eleven digits show
      `83 9 8765-4321`
- [ ] 9.10 Verify the stepper on a phone: the numeric keypad appears, no spinner arrows are rendered,
      `−` is disabled at 1 and `+` at 10, both controls measure at least 44×44, and typing `4`
      directly works
- [ ] 9.11 Verify with a screen reader that every field is announced with its Portuguese label, that
      an errored field is announced as invalid with its message, and that the corner close control is
      announced as a button named "Fechar" with its icon not announced separately
- [ ] 9.12 Verify at 320px viewport width that the panel fits, that the doubled error rule is legible
      against the single focus rule, that the panel scrolls with a visible sliver of overlay when two
      errors are showing, and that the "Confirmar" button stays reachable
- [ ] 9.13 Verify at 320px that the reserved `min-h-48 sm:min-h-64` box still absorbs the
      button → success-state swap with a **long first name** in the feedback message, with no page
      content shifting
- [ ] 9.14 Verify with `prefers-reduced-motion: reduce` that the form itself animates nothing and the
      existing confetti gating is unchanged
- [ ] 9.15 Verify backing out of the modal (corner `X`, Escape, overlay tap) leaves the confirmation
      button in place, writes nothing to storage, and that reopening the modal in the same session
      still shows the values the guest had typed
- [ ] 9.16 Run `yarn lint && yarn typecheck && yarn build` and verify all three succeed with no new
      warnings from `ModalForm.tsx`, `RsvpFormFields.tsx`, `RsvpForm.tsx`, `CarvedTextField.tsx`,
      `CarvedStepperField.tsx`, `whatsappNumber.ts` or `rsvpSchema.ts`, and that the CLI-generated
      `input.tsx`, `label.tsx` and `form.tsx` typecheck and build cleanly (they are excluded from lint
      and format per `AGENTS.md`)
