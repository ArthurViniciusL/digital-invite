## Why

`add-rsvp-confirmation-section` built the third section's shell and shipped it: a confirmation button,
a modal, a confetti + feedback success state, and a browser-local confirmation flag. The modal is
still a placeholder — `ModalForm.tsx` renders the fixed body "Em breve!" and a "Confirmar" button
wired to nothing but the celebration. A guest cannot actually tell the organizer anything.

This change puts the real form in that modal: four fields, Zod validation, and a WhatsApp mask, so
the modal stops announcing itself as unfinished. The Supabase insert stays deliberately out of scope
— a valid submit still only triggers the existing confetti/feedback state — so the form's shape,
validation and visual vocabulary can be settled and reviewed before any data is persisted.

Three things follow from having real fields, and they are the substance of this change:

1. **The form is the first form in this codebase.** `GUIDELINES.md` has no section on inputs, labels,
   focus or error states, and `src/components/admin/LoginForm.tsx` is still a stub. Whatever this
   change specifies becomes the project's form vocabulary and the reference the admin login form
   follows later. That vocabulary is defined here from the existing three tokens and the
   hatching-only rules, not borrowed from shadcn's defaults.
2. **The success message can finally say a name.** `add-rsvp-confirmation-section` deliberately left
   the literal token `{user_name}` unrendered because nothing collected a name. This change reverses
   that requirement and interpolates the submitted name — which exposes a live bug in the shipped
   code: a returning guest's success state is restored from `localStorage`, which stores no name, so
   the message would render as `Tá confirmado !`. This change fixes that path rather than shipping it.
3. **Two artifacts already disagree with the shipped code**, both from the user's own direct edits:
   the modal's title is `'Convidado'`, not the spec's "Cadastro do convidado", and the modal now
   renders a visible corner `X` close button, contradicting the spec's "SHALL NOT display any visible
   dismissal control". This change updates the requirements to describe what actually shipped.

## What Changes

### The form itself

- Replace `ModalForm`'s "Em breve!" body with four fields, in this order: guest name ("Seu nome"),
  WhatsApp ("Whatsapp", placeholder `83 9 xxxx-xxxx`), e-mail ("E-mail"), and number of people
  ("Quantidade de convite", default `1`). The four fields and three of the four labels are the user's
  own decisions and are not revisited here; the e-mail label is chosen in this change.
- Move form state into `ModalForm`: it owns `useForm` with `zodResolver(rsvpSchema)` and calls
  `onConfirm(data)` only after validation passes. `ModalForm` stops being purely presentational —
  an explicit reversal of `add-rsvp-confirmation-section`'s "`ModalForm` owns no state of its own".
- Change `ModalForm`'s `onConfirm` prop from `() => void` to `(data: RsvpFormData) => void`.
  `RsvpForm` keeps owning the confirmed/just-confirmed flags, the storage helpers and the success
  state; it now receives the validated payload instead of a bare signal.
- **Mask the WhatsApp number as the guest types** — digits only, formatted to `83 9 8765-4321` —
  hand-rolled in an `onChange` handler in a new pure module, `src/lib/formatters/whatsappNumber.ts`.
  No mask library, no new dependency.

### Schema

- Add `whatsapp` to `src/lib/schemas/rsvpSchema.ts`, validated against the **mobile-only, 11-digit**
  shape (2-digit DDD + the `9` + 8 subscriber digits). Landlines are rejected on purpose: the field
  exists to reach the guest on WhatsApp.
- Add an upper bound to `guestCount` (`.max(10)`) and an explicit pt-BR message for the non-numeric
  case, which `z.coerce.number().int()` currently answers with Zod's English "expected number,
  received NaN".
- Add `.trim()` and `.max(60)` to `name`, since the name is now rendered back into a message and
  stored in the browser.
- Extend the schema's docblock with the new field's column mapping. **No documented Supabase column
  exists for a phone** — see Impact.

### Success message and the returning-guest problem

- **Interpolate the submitted name into the feedback text**, replacing the literal `{user_name}`
  token. The rendered message uses the guest's **first name only** (the substring before the first
  space), which reads better and bounds the length.
- **Persist the name alongside the confirmation flag**, under a second `localStorage` key
  `digital-invite:rsvp-name`, holding the raw name string with no JSON and no parse step — the same
  storage discipline and the same `try`/`catch` failure contract the existing flag already specifies.
- **Also specify a name-less fallback message** for the restored path, because the name key can be
  legitimately absent: every guest who already confirmed under the shipped build has the flag and no
  name. Both halves are needed; neither alone is sufficient.

### Form vocabulary (new, and the reference for every later form)

- Inputs are **ruled lines**, not carved boxes: a single bottom rule, square corners, no fill of
  their own. The `.carved-*` silhouettes stay reserved for the dialog panel and the buttons, which
  satisfies `GUIDELINES.md` §5.3's anti-repeat rule by not competing with `DialogContent`'s
  `.carved-1` at all.
- **Focus is more ink, not a ring**: the rule keeps a constant 4px weight and shifts from
  `sertao-brown` to `carved-black`, and the label darkens with it. No glow, no ring, no layout shift.
- **An error doubles the cut**: the rule becomes two stacked carved-black lines, plus a Lucide
  `TriangleAlert` and a message in `carved-black`. The palette has no red, so the error is signalled
  by ink density and an icon rather than hue.
- The numeric field's **native spinner is not used at all**. It is replaced by a `Minus`/`Plus` pair
  of `xilo` buttons flanking a typeable field.
- Add `input`, `label` and `form` via the shadcn CLI (`radix-nova`), and neutralise their
  ring/shadow/radius/`destructive` defaults at the call site — `src/components/ui/` is not edited.

### Reconciling the shipped drift

- The modal's title requirement becomes `'Convidado'`.
- The "no visible dismissal control" requirement is replaced by one describing the corner `X` that
  shipped — and fixes two defects in it: the button has **no accessible name at all** (a bare Lucide
  `X`), and it uses `hover:bg-amber-800`, an off-palette Tailwind colour.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `rsvp-confirmation-section`: the modal gains real fields and validation; the success message
  interpolates the submitted name and the restored path gets a name; the modal's title and its
  dismissal control are corrected to the shipped code.

## Impact

- **Code**: `src/pages/InvitePage/partials/ModalForm.tsx` (form owner), a new
  `src/pages/InvitePage/partials/RsvpFormFields.tsx` (the four-field stack),
  `src/pages/InvitePage/partials/RsvpForm.tsx` (receives validated data, second storage key,
  interpolated message), `src/lib/schemas/rsvpSchema.ts` (new field, new bounds, new messages), a new
  `src/lib/formatters/whatsappNumber.ts` (pure mask), and two new shared primitives under a new
  `src/components/form/` directory (`CarvedTextField.tsx`, `CarvedStepperField.tsx`).
- **Structure**: adds two directories not named in `SYSTEM-DESIGN.md` §4 — `src/lib/formatters/` and
  `src/components/form/`. Justified in design.md; `src/components/form/` exists precisely because
  these primitives are the reference for `admin/LoginForm.tsx` and must not live under `invite/`.
- **Generated UI**: adds `src/components/ui/input.tsx`, `label.tsx` and `form.tsx` via the shadcn CLI
  (`AGENTS.md`'s explicit pitfall). Not hand-edited; every deviation is a call-site override.
- **Dependencies**: none. `react-hook-form@^7.87` and `@hookform/resolvers@^5.9.1` are already in
  `package.json`; `lucide-react` covers `Minus`, `Plus`, `TriangleAlert` and `X`.
- **Browser storage**: adds a second key, `digital-invite:rsvp-name`, holding the guest's name as a
  raw string. It is the guest's own name, on the guest's own device, transmitted nowhere — no new
  privacy surface beyond what the existing flag already was. Both keys degrade independently.
- **Assets**: none. No new or modified `.svg`/`.png`; the four utility icons are all Lucide, per
  `GUIDELINES.md` §5.4.
- **Design tokens**: consumes the existing `carved-black`/`bone-white`/`sertao-brown`, `font-body`,
  and `.carved-1`/`.carved-3`. **No new token and no new `globals.css` utility** — the ruled-line
  vocabulary is composed from stock Tailwind border utilities so nothing new needs maintaining.
- **Reverses a shipped requirement**: `add-rsvp-confirmation-section` states the `{user_name}` token
  "SHALL be rendered literally... is not interpolated in this capability and is not a defect". This
  change interpolates it, which also supersedes that change's QA task verifying the token renders
  verbatim (its tasks.md 4.4).
- **Out of scope, deliberately**: any Supabase insert, a `useRsvpSubmit` hook, the admin dashboard's
  column for the new field, and the RSVP deadline cutoff of 26/09/2026. A valid submit still only
  triggers the existing confetti/feedback state.

### Out-of-boundary needs, with owners

- **No Supabase column exists for a phone.** Neither `PROJECT.md` §6 nor `SYSTEM-DESIGN.md` §3.1
  defines one. Recommended mapping: `whatsapp -> rsvp.whatsapp` (`text not null`). Needs a migration
  plus an update to both documents. **Owner**: the future change that adds the Supabase insert,
  together with whoever owns the database. This change writes the recommendation into the schema
  docblock and does not create or assume the column.
- **`PROJECT.md` and `SYSTEM-DESIGN.md` already disagree on the guest-count column.** `PROJECT.md`
  §6 says `number_of_persons`; `SYSTEM-DESIGN.md` §3.1's DDL says `numero_pessoas`; `rsvpSchema.ts`'s
  docblock says `numero_pessoas`. Flagged, not fixed — resolving it is the same owner's job, before
  the first insert is written.
- **The admin dashboard has no column for the WhatsApp number.** `PROJECT.md` §5.2 and
  `SYSTEM-DESIGN.md` §5.3 both fix the table at Nome / E-mail / Número de pessoas / Status.
  **Owner**: a future admin-dashboard change.
- **`DialogOverlay` uses `bg-black/10` and `backdrop-blur-xs`** — transparency and a blur, both named
  as forbidden in `GUIDELINES.md` §4.5. It already ships today, and `DialogContent` renders the
  overlay internally with no prop passthrough, so it cannot be overridden at the call site. Out of
  scope here. **Owner**: a follow-up change, which will have to either re-run the CLI with a modified
  registry or introduce a project-level dialog wrapper.
- **`AGENTS.md` and `GUIDELINES.md` §5.2 both still say the Xilosa font has not been delivered**, but
  `globals.css` now carries a real `@font-face` pointing at `/assets/fonts/xilosa_.ttf`. Doc drift
  only; this change reserves `font-title` for the dialog title regardless. **Owner**: a docs pass.
