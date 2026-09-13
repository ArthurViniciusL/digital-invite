## Context

`add-rsvp-confirmation-section` is implemented and shipped, but could not be archived — 11 manual-QA
tasks are still unchecked — so `openspec/specs/rsvp-confirmation-section/` does not exist. This
change's delta is written against the capability as currently defined under that change's own
`specs/` directory, the same way `add-event-details-reveal-animation` was written against
`event-details-section`.

What is on disk today:

- `src/pages/InvitePage/partials/ModalForm.tsx` — a `Dialog` with `showCloseButton={false}`, a
  `.carved-1` `DialogContent`, a title constant of `'Convidado'`, a body of `'Em breve!'`, a
  `DialogClose`-wrapped corner `X` button, and a single "Confirmar" button calling `onConfirm: () =>
  void`.
- `src/pages/InvitePage/partials/RsvpForm.tsx` — owns `isModalOpen`, `hasConfirmed` (lazy
  `useState(() => readConfirmedFlag())`), `justConfirmed`, the two `localStorage` helpers, the Lottie
  confetti layer and the feedback text `'Tá confirmado {user_name}!'`.
- `src/lib/schemas/rsvpSchema.ts` — `name`, `email`, `guestCount` on Zod v4 (`z.email()` top-level,
  `z.coerce.number()`), plus a docblock mapping each field to its Portuguese Supabase column. Nothing
  imports it yet.
- `src/components/ui/` — `button.tsx` and `dialog.tsx` only.
- `package.json` — `react-hook-form@^7.87.0` and `@hookform/resolvers@^5.9.1` are **already
  installed**. `zod@^4.6.2`. So this change adds no dependency.

Fixed by `GUIDELINES.md` and not decided here: the three-colour palette (§4.2/§5.1, still pending the
designer's revalidation), `font-title` / `font-body` (§4.3/§5.2), the `.carved-1/2/3` utilities and
the rule that two neighbouring carved shapes must not repeat the same silhouette (§4.4/§5.3), the
hatching-only / no-gradient / no-glow / no-soft-shadow / no-transparency rules (§4.5), and Lucide as
the utility icon library (§5.4 — it explicitly lists `user`, `envelope`, `check` and `alert`).

Fixed by the caller and **not open in this design**: the four fields; the labels "Seu nome",
"Quantidade de convite" and "Whatsapp"; the `83 9 xxxx-xxxx` placeholder; the default value of `1`;
the hand-rolled mask with no library; mobile-only 11-digit validation; and the decision to keep
e-mail alongside WhatsApp rather than replace it.

**`GUIDELINES.md` has no section on forms.** Nothing on inputs, labels, validation messages or error
states. This is the project's first form — `src/components/admin/LoginForm.tsx` is still a stub — so
everything under "The form vocabulary" below is being defined, not applied, and it is the reference
`admin/LoginForm.tsx` follows later. That is the reason two primitives land under a new
`src/components/form/` rather than inside `InvitePage/partials/`.

## Goals / Non-Goals

**Goals:**

- Define the project's form vocabulary — input, label, focus, error, numeric stepper, field rhythm —
  from the existing three tokens, precisely enough that `dev` writes it without inventing a treatment,
  and general enough that the admin login form inherits it rather than re-deciding it.
- Specify the four fields' order, labels, input types, keyboard modes and constraints, and the schema
  changes that back them.
- Specify the WhatsApp mask's exact output shape and its editing behaviour, including what it gets
  wrong, so `dev` does not discover the caret problem during implementation.
- Resolve the returning-guest name problem, which is a live bug the moment the message interpolates.
- Reconcile the two pieces of spec/code drift so the artifacts describe the shipped modal.
- Keep every string that needs tone judgment as a scoped placeholder; write the caller's fixed
  strings verbatim.

**Non-Goals:**

- Any Supabase call: no `supabase.from('rsvp').insert(...)`, no `useRsvpSubmit` hook, no error state
  for a failed network request, no loading/pending state on the submit button. A valid submit closes
  the modal and plays the existing celebration, exactly as it does today.
- The admin dashboard's column for the WhatsApp number.
- The RSVP deadline cutoff (26/09/2026). The form accepts submissions on any date.
- Creating or migrating a Supabase column. The schema docblock records the recommended name; nothing
  in code depends on it.
- Any new `.svg`/`.png` asset, any new design token, any new `globals.css` utility.
- Revalidating the pending palette.
- Editing `src/components/ui/`. Every deviation from a generated component is a call-site override.
- Replacing `DialogOverlay`'s forbidden `bg-black/10` + `backdrop-blur-xs`; it already ships and is
  unreachable from the call site.
- Rewording "Confirmar". See the note under "The submit button".

## Decisions

### Where the form lives: `ModalForm` owns `useForm`

**Decision: `ModalForm` owns `useForm` + `zodResolver(rsvpSchema)` and calls `onConfirm(data)` from
inside `handleSubmit`. `RsvpForm` keeps everything it owns today and receives the validated payload.**

This reverses `add-rsvp-confirmation-section`'s "`ModalForm` owns no state of its own; it takes
`open`, `onOpenChange` and `onConfirm` props and is otherwise presentational." That sentence was
written when the modal's content was two fixed strings. Now:

- The fields are the modal's content, so the form state belongs where the fields are.
- Hoisting `useForm` into `RsvpForm` would re-render the section — including the reserved
  `min-h-48 sm:min-h-64` box and the Lottie mount point — on every keystroke, for no benefit.
- `RsvpForm`'s job is the success state and the storage boundary. Putting field state next to it
  would mix a transient input surface with a persisted outcome.

New prop contract:

```
interface ModalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: RsvpFormData) => void
}
```

`onConfirm` fires **only** from `handleSubmit`'s success path, so by the time `RsvpForm` sees it the
data has passed `rsvpSchema`. `RsvpForm`'s `confirm` handler takes the payload, writes both storage
keys, sets `hasConfirmed`/`justConfirmed`, and closes the modal — the same single handler it has
today, one argument richer.

**The form is not reset when the modal closes.** With no footer dismissal control and an overlay tap
as the main way out on a phone, an accidental dismissal that erased a filled form would be a real
loss. Values persist for the page session so reopening the modal resumes where the guest left off.
There is nothing to reset after success: the confirmation button never comes back.

**`onOpenChange` still touches nothing but `isModalOpen`.** Backing out writes no storage key and
leaves `hasConfirmed` alone, unchanged from the shipped behaviour.

### Composition

```
RsvpForm (page section)                         unchanged: reserved box, storage, success state
 └─ ModalForm                                   NEW: useForm + zodResolver(rsvpSchema)
     └─ DialogContent  .carved-1, border-4      ┐ unchanged silhouette
         ├─ DialogClose corner X                │ shipped; gains a pt-BR accessible name
         ├─ DialogHeader
         │   ├─ DialogTitle    'Convidado'      │ font-title, centred
         │   └─ DialogDescription {{intro}}     │ NEW: replaces 'Em breve!'
         ├─ RsvpFormFields  (left-aligned)      ┘
         │   ├─ CarvedTextField   name          <- src/components/form/, shared
         │   ├─ CarvedTextField   whatsapp      <- masked onChange
         │   ├─ CarvedTextField   email
         │   └─ CarvedStepperField guestCount   <- src/components/form/, shared
         └─ DialogFooter
             └─ Button xilo  'Confirmar'        type="submit"
```

`<form>` wraps from `RsvpFormFields` through `DialogFooter` inclusive, so the submit button is inside
it and Enter in any field submits.

Files:

| Path | Responsibility |
| --- | --- |
| `src/pages/InvitePage/partials/ModalForm.tsx` | Dialog shell, `useForm`, `handleSubmit`, footer |
| `src/pages/InvitePage/partials/RsvpFormFields.tsx` | The four fields in order; no state |
| `src/components/form/CarvedTextField.tsx` | Label + ruled-line input + error message |
| `src/components/form/CarvedStepperField.tsx` | Label + `−`/`+` pair + numeric field + error |
| `src/lib/formatters/whatsappNumber.ts` | `formatWhatsappNumber(raw: string): string`, pure |
| `src/lib/schemas/rsvpSchema.ts` | `whatsapp`, new bounds, pt-BR messages |
| `src/pages/InvitePage/partials/RsvpForm.tsx` | Validated payload, name persistence, interpolation |

Two directories are new and neither is named in `SYSTEM-DESIGN.md` §4:

- **`src/components/form/`** — because these two primitives are explicitly the reference for
  `src/components/admin/LoginForm.tsx`. Putting them in `InvitePage/partials/` would make the admin
  form import from a page's partials; putting them in `components/invite/` would misname them. §4
  lists `ui/`, `invite/`, `admin/` and `layout/` as a suggestion, and the repo has already diverged
  from it once (the invite sections live under `pages/InvitePage/partials/`, not
  `components/invite/`). This is a deliberate, documented extension, not a new architecture.
- **`src/lib/formatters/`** — a sibling of the existing `src/lib/schemas/`, for the same reason: a
  pure, testable, framework-free transform that does not belong in a component.

The four-file split is also what keeps `ModalForm` under ESLint's `max-lines-per-function` of 60 and
`complexity` of 8. A single component holding a Dialog shell, a `useForm` call and four fields would
fail lint.

### The form vocabulary

This is the part with no precedent. Five decisions, each one chosen against a named alternative.

#### 1. An input is a ruled line, not a carved box

**Decision: every input is a single bottom rule — `rounded-none`, no border on three sides, a 4px
bottom border, `bg-bone-white`, full width of the panel.**

```
Seu nome                          <- label, font-body, text-lg, left
────────────────────────────────   <- the rule: border-b-4, sertao-brown at rest
```

Rationale, and it is the keystone of the whole vocabulary:

- **It answers §5.3 by not competing.** The anti-repeat rule says two neighbouring carved shapes must
  not share a silhouette. Four boxed inputs inside a `.carved-1` panel would need four alternating
  silhouettes from a set of three, and every one of them would read as a smaller copy of the panel.
  A rule has no silhouette at all, so the question stops applying. `.carved-*` stays reserved for two
  things — the panel that holds, and the buttons you press — and that reservation is now a rule of the
  system rather than an accident.
- **It is what the subject matter actually looks like.** A cordel pamphlet's form is a ruled line you
  write on. The guest fills in a line; they do not type into a widget.
- **It survives 320px.** A rule needs no horizontal padding budget for side borders, so the full
  panel width is available for the value — which matters for `83 9 8765-4321` and for a long e-mail.
- **It is zero new CSS.** Stock Tailwind border utilities only. Nothing added to `globals.css`,
  nothing new to maintain, nothing for the pending palette revalidation to break.

Rejected: giving each input `.carved-2` with a `border-2`. It looks like the panel, it fights the
`xilo` button's `.carved-3` for attention, and at 320px an asymmetric 255px-radius corner on a 44px
tall box clips the text.

Specifics:

| Property | Value | Why |
| --- | --- | --- |
| Radius | `rounded-none` | Square, because the carve belongs to the panel and the buttons |
| Rule | `border-0 border-b-4` | Thick per §4.5; constant weight in every state (see focus) |
| Rule colour, at rest | `border-sertao-brown` | §4.2's documented job for the third token: "subtle detail, secondary type" |
| Fill | `bg-bone-white` | Explicit, not `bg-transparent` — there is no alpha anywhere on the surface |
| Height | `h-12` (48px) | Above the 44px tap-target floor |
| Text | `font-body text-lg text-carved-black` | 18px: Caveat runs small, and anything under 16px makes iOS Safari zoom the page on focus |
| Shadow | none | §4.5 |

`dev` reads the generated `input.tsx` and neutralises, at the call site, every default that draws a
ring, a shadow, a radius, a `dark:` variant or a `destructive` tint. `src/components/ui/` is not
edited (`AGENTS.md`). The relevant categories in the `radix-nova` input are the focus ring
(`focus-visible:ring-*`, `focus-visible:border-ring`), the `aria-invalid:ring-destructive` /
`aria-invalid:border-destructive` pair, the base `rounded-*`, and `dark:bg-input/30`.

#### 2. Focus is more ink, not a ring

**Decision: the rule's weight never changes. Its colour goes `sertao-brown` → `carved-black` on
focus, and the label darkens from `sertao-brown` to `carved-black` with it, via `focus-within` on the
field wrapper.**

- A ring or a glow is forbidden outright by §4.5, and there is no second hue to ring with.
- Thickening the rule on focus — the obvious woodcut answer — would change the element's height by
  2px and nudge every field below it. Holding the weight constant and moving the colour gives the
  same "the gouge bit deeper here" reading with zero layout shift.
- Two cues, not one: the rule and its label move together, so the active field is legible without
  relying on colour discrimination alone.
- Contrast check: `#6B4226` on `#F4EEDD` is about 6.6:1, and `#1C1410` about 14.5:1. Both pass at
  rest, so the resting state is not "a disabled-looking field that only becomes visible on focus".
  This is the one place the pending palette revalidation could bite — if `sertao-brown` moves lighter,
  the resting rule must stay at or above 3:1 against `bone-white`.

Rejected: `outline-2 outline-carved-black` on the whole field. It draws a box, which reintroduces
exactly the silhouette decision 1 removes.

#### 3. An error doubles the cut

The palette has no red and §4.5 forbids adding one. So error is signalled by **ink density plus a
symbol**, never by hue.

```
Whatsapp                                   <- label, carved-black
83 9 87
════════════════════════════════            <- rule doubled: two carved-black lines
──────────────────────────────
⚠ {{copy: rsvp_error_whatsapp_format}}      <- Lucide TriangleAlert + message, carved-black
```

**Decision: an errored field's rule becomes two stacked `carved-black` lines** — the input's own
`border-b-4 border-carved-black` plus a `border-b-2 border-carved-black` on its wrapper, separated by
3px of wrapper padding. Below it, a message in `font-body text-base text-carved-black`, preceded by a
`TriangleAlert` at `size-4`, `aria-hidden`, inline.

- "The engraver cut the line twice" is a woodcut-native way to say *look here*, and it is
  unmistakably distinct from focus (one line) at a glance and at 320px.
- It is pure borders. No `repeating-linear-gradient`, so no argument with §4.5's ban on gradients,
  and nothing for QA to have to adjudicate.
- The icon carries the meaning for anyone who cannot compare line weights; §5.4 lists `alert` as
  Lucide's job, so no asset is needed.
- **Precedence when a field is both errored and focused**: the doubled rule wins on the rule, and
  focus shows in the label. An errored field's rule is `carved-black` in both states.

Rejected: hatching the rule with a hard-stop `repeating-linear-gradient`. It is the most on-style
answer, and CSS has no stroke-free alternative for drawing parallel lines — but it requires a new
`globals.css` utility and it puts the word "gradient" in the codebase in a project whose guidelines
forbid gradients by name. Not worth the standing argument for a treatment the doubled rule already
covers. Recorded here in case the doubled rule proves too quiet in review.

Rejected: `text-destructive`. `globals.css` maps it to `oklch(0.577 0.245 27.325)` — red, off-palette.
shadcn's `FormMessage` applies it by default and **must be overridden** at the call site.

Error timing: messages appear on blur and on submit, not on the first keystroke. `react-hook-form`'s
default `mode: 'onSubmit'` plus `reValidateMode: 'onChange'` gives this — a guest is not told their
e-mail is invalid while they are still typing the `@`, but once it has been flagged it clears as soon
as it is fixed. `dev` uses the default `mode` rather than `onChange`.

Announcement: shadcn's `FormMessage` already wires `aria-describedby` and `aria-invalid` through
`FormField`/`FormControl`. That wiring is the reason `form` is added via the CLI rather than
hand-rolling label/error association.

#### 4. The numeric field has no native spinner

**Decision: `Quantidade de convite` renders as a `−` / value / `+` row. The native spinner is never
shown, and the field is not `type="number"`.**

```
Quantidade de convite
┌────┐                  ┌────┐
│ −  │      1           │ +  │        <- two xilo icon buttons, 44px, flanking
└────┘   ────────       └────┘
          ^ the same ruled line, w-16, text-center
```

- A native spinner is browser chrome: grey arrows, ~12px tall, rendered differently in every engine.
  It is the single most foreign-looking thing that could appear inside a woodcut panel, and it fails
  the tap-target floor outright.
- `type="text"` with `inputMode="numeric"` and `maxLength={2}` instead of `type="number"`: it means no
  spinner exists to hide, so no `appearance-none` and no `::-webkit-inner-spin-button` override is
  needed, and therefore no `globals.css` addition. It also keeps the mobile keypad. `z.coerce.number()`
  already accepts the string — which is exactly why the non-numeric message in the schema section
  below is mandatory rather than nice-to-have.
- The buttons are `Button variant="xilo"`, `type="button"`, sized to 44px via a `size-11` class
  override (`size="icon-lg"` is 36px, under the floor), containing Lucide `Minus` / `Plus` at
  `size-5` with `aria-hidden`, and carrying the pt-BR accessible names "Diminuir quantidade" and
  "Aumentar quantidade". They call `setValue('guestCount', next, { shouldValidate: true })`.
- `−` is disabled at 1; `+` is disabled at 10 (see the bound below). Disabled uses the `xilo`
  variant's stock `disabled:opacity-50`. That is an alpha effect and §4.5 dislikes transparency — but
  it is inherited from `button.tsx`, which this change does not edit, and overriding it would mean
  inventing a disabled treatment for the whole button system. Out of scope; noted.
- **Both buttons keep `.carved-3`** (baked into `xilo`), deliberately repeating each other. §5.3 is
  about neighbouring shapes not looking accidentally similar; a matched `−`/`+` pair is *supposed* to
  read as one control, and alternating their silhouettes would look like a mistake. The differentiation
  in this row comes from the centre field, which is a ruled line and not a carved shape at all.
- The field stays typeable, so a guest can enter `4` directly instead of tapping `+` four times.

At 320px the row measures 44 + gap + 64 + gap + 44 ≈ 168px inside a panel of roughly 288px. It fits
with room to spare, which is why the buttons flank rather than stack.

#### 5. Arrangement inside a dialog that must work at 320px

**Field order: name → WhatsApp → e-mail → guest count.**

- **Name first.** It is the label the user wrote first, and it is what the success message says back.
- **WhatsApp second.** It is the channel the organizer will actually use, and it is the only field
  with a format the guest has to be shown; putting it high means its placeholder is seen before the
  guest has settled into skimming.
- **E-mail third.** Required per `PROJECT.md` §5.1 and a dashboard column per §5.2, but the least
  used of the three contacts now that WhatsApp exists. Third is honest about that without demoting it
  to optional.
- **Guest count last.** It is a quantity rather than an identity, it is the visually heaviest row, and
  it sits directly above the submit button — which is the right reading order: who you are, how to
  reach you, how many are coming, confirm.

Layout:

| Element | Treatment |
| --- | --- |
| Panel width | `DialogContent` gets `sm:max-w-md`; the generated default `sm:max-w-sm` (384px) is tight for four labelled fields |
| Panel padding | `px-5 py-8 sm:px-8 sm:py-10`, down from the shipped `px-6 py-10 sm:px-10 sm:py-12` — a form needs the width more than the air |
| Alignment | The shipped `text-center` on `DialogContent` is **removed**. Header stays centred via `DialogHeader`; the field stack and every error message are `text-left`. Centred labels and centred error text under a left-aligned value are unreadable |
| Field rhythm | `space-y-5` between fields; `gap-2` between a label and its rule; `gap-1.5` between a rule and its message |
| Tall content | `DialogContent` gets `max-h-[90dvh] overflow-y-auto`. Four fields with two errors showing exceeds a 320×568 viewport. The carved border scrolls with the panel, so the silhouette stays whole — preferable to an inner scroll area that would put a scrollbar through the middle of the form |
| Footer | Keeps the shipped `m-0 flex-row justify-center gap-3 border-0 bg-transparent p-0` override, which neutralises the generated `DialogFooter`'s `border-t bg-muted/50 -mx-4 -mb-4 rounded-b-xl` |

#### The submit button

`Button variant="xilo"`, `type="submit"`, label **"Confirmar"** — kept verbatim from the shipped
code and from `add-rsvp-confirmation-section`, which fixed it as caller-specified content rather than
draftable copy. Sizing: `size="lg"` is only `h-9` (36px), below the tap floor and visually slight for
a primary action, so it carries `h-14 w-full sm:w-auto sm:px-8 text-base` — full width on a phone
where it is the only action, intrinsic width from `sm` up.

Noted and not acted on: with real fields behind it, "Confirmar presença" would say what happens more
plainly than "Confirmar". Changing it would reopen a string two artifacts already fix verbatim, for a
gain that is real but small. If the user wants it, it becomes a copy placeholder and one label change.

### Schema changes

`src/lib/schemas/rsvpSchema.ts`, Zod v4. Field names stay English; messages stay pt-BR.

| Field | Change | Reason |
| --- | --- | --- |
| `name` | add `.trim()`, add `.max(60, …)` | The value is now rendered back into a message and written to `localStorage`. `.trim()` makes `"  a  "` fail `.min(2)` as it should |
| `email` | unchanged | `z.email('E-mail inválido')` already correct on v4 |
| `guestCount` | add `.max(10, …)`, add an explicit non-numeric message, add a message to `.int()` | See below |
| `whatsapp` | **new** — `z.string().trim().min(1, …).regex(/^\d{2} 9 \d{4}-\d{4}$/, …)` | See below |

**`guestCount`'s upper bound: 10.** `PROJECT.md` §5.1 expects "até ~30 registros de RSVP (grupos
familiares incluídos)", so a single invite claiming 50 people is a typo or abuse, and there is no
bound today. A family group at a 50th birthday plausibly reaches 8–10; 10 is generous enough not to
reject a real answer and tight enough to catch a fat-finger. It is also the `+` button's ceiling, so
the bound is reachable by tapping and the two cannot drift — `dev` declares it once as a module-level
constant in the schema file and imports it into `CarvedStepperField`'s consumer rather than
re-typing `10`.

**`guestCount`'s non-numeric message is mandatory.** `z.coerce.number()` on `"abc"` produces `NaN`
and Zod answers with its default English string ("Invalid input: expected number, received NaN").
Since the field is `type="text"` with `inputMode="numeric"` (decision 4), a guest *can* type a letter,
so that English string is reachable by a Brazilian guest — a direct violation of the
Portuguese-UI rule. `.int()` needs its own message for the same reason (`"1.5"` coerces fine and then
fails `.int()`).

Zod v4 renamed the per-issue message params: the v3 `invalid_type_error` is gone, replaced by a
unified `error` param. `dev` confirms the exact spelling against the installed `zod@^4.6.2` typings
rather than trusting this document or `SYSTEM-DESIGN.md` §6, whose snippet is v3-era and already
diverges from the shipped file in three ways (Portuguese identifiers, `z.string().email()`, no
top-level `z.email`).

**`whatsapp` validates the masked string, mobile only.** The regex `/^\d{2} 9 \d{4}-\d{4}$/`:

- matches exactly the shape `formatWhatsappNumber` produces at 11 digits, so a fully-typed number
  always passes and a partially-typed one always fails — the validation and the mask cannot disagree;
- rejects landlines for free, because the literal `9` in the pattern is the mobile ninth digit. That
  is the caller's decision and the reason is worth keeping next to the regex: the field exists to
  reach the guest on WhatsApp, and a landline cannot;
- needs **no** `.transform()`. The field's value stays the `string` the guest sees, so
  `RsvpFormData['whatsapp']` matches the input's value and there is no branded post-parse type for
  `dev` to thread through. **Digit normalisation for the database is the future insert change's job**,
  flagged in the docblock.
- the leading `.min(1, …)` gives the empty field its own "required" message instead of falling
  through to the format message, which would tell a guest their blank field is badly formatted.

**Docblock.** The existing mapping block gains `whatsapp` and gains the two flags below verbatim, so
the next reader of the file meets them before writing an insert:

```
 *   name          -> rsvp.nome
 *   email         -> rsvp.email
 *   guestCount    -> rsvp.numero_pessoas
 *   whatsapp      -> rsvp.whatsapp   (recommended; no column is documented yet)
```

- **No Supabase column exists for a phone.** `whatsapp -> rsvp.whatsapp` is a recommendation this
  change makes and does not act on. Owner: the future insert change plus the database owner.
- **The guest-count column name is already contradictory** across three sources: `PROJECT.md` §6 says
  `number_of_persons`, `SYSTEM-DESIGN.md` §3.1's DDL says `numero_pessoas`, and this docblock says
  `numero_pessoas`. Flagged, deliberately not fixed here — picking a winner is a data-model decision
  that belongs with the migration, and guessing it in a comment would make the drift harder to find.

### The WhatsApp mask

`src/lib/formatters/whatsappNumber.ts`, one exported pure function:

```
formatWhatsappNumber(raw: string): string
```

Behaviour: strip every non-digit, keep at most 11, then emit by digit count.

| Digits typed | Output |
| --- | --- |
| 0 | `''` |
| 1–2 | `83` |
| 3 | `83 9` |
| 4–7 | `83 9 8765` |
| 8–11 | `83 9 8765-4321` |

- **It never emits a trailing separator.** `83 ` and `83 9 8765-` are not reachable outputs. This is
  what makes backspacing work: the guest deletes a digit, the function reformats from the remaining
  digits, and the now-orphaned separator disappears in the same keystroke instead of needing a second
  press.
- Wiring: the field's `onChange` passes `formatWhatsappNumber(event.target.value)` to
  `react-hook-form`'s `field.onChange`, so the stored value and the displayed value are always the
  same formatted string and the input stays controlled.
- Attributes: `inputMode="tel"`, `autoComplete="tel"`, `maxLength={14}` (the full
  `83 9 8765-4321` is 14 characters), `placeholder="83 9 xxxx-xxxx"` — the caller's exact string.
- **Known cost: the caret jumps to the end when the guest edits mid-string.** Reformatting from
  digits discards cursor position. Preserving it properly means counting digits before the caret and
  re-deriving an offset — a genuinely fiddly piece of code for a 14-character field that is almost
  always typed left to right in one go. Accepted; recorded here so `dev` does not treat it as a bug
  found late and QA does not file it. If it proves annoying in testing, the fix is local to this one
  module.
- Lint shape: `id-length` requires 3+ character identifiers (except `id, to, db, fn, on`), so no `i`
  or `n`; `complexity` caps at 8, so the function is written as slice-and-join over the digit string,
  not a chain of `if` statements on the length.

Not used: `type="tel"` alone without the mask (the guest gets no format feedback), a mask library
(the caller ruled it out), and storing digits with a separate display value (two sources of truth for
a field the guest is looking straight at).

### The returning-guest name problem

The shipped `RsvpForm` reads `digital-invite:rsvp-confirmed` in a lazy `useState` initializer and
renders the success state from first paint. That path has **no name**. Once the message interpolates,
a returning guest would read `Tá confirmado !` — a broken string shipped to a real guest, and
silently, because nothing throws.

**Decision: do both. Persist the name under a second key, *and* specify a name-less fallback
message.** Neither half is sufficient on its own, and the reason the second half is not belt-and-
braces is concrete: **every guest who has already confirmed under the shipped build has the flag and
no name.** A name-only solution ships the broken string to exactly those people.

**Half 1 — a second key, `digital-invite:rsvp-name`.**

- Stored shape: the submitted `name`, as a raw string. Not JSON, not an object, no timestamp.
- **Why a second key rather than JSON under the existing one.** `add-rsvp-confirmation-section`
  decided the stored shape deliberately — "the exact string `'true'`, and nothing else... reading it
  is a string comparison, so there is no parse step that can throw and no schema to version" — and
  that decision is load-bearing, because the read happens inside a `useState` initializer where a
  throw blanks the page. Moving to `{"confirmed":true,"name":"…"}` would introduce a `JSON.parse` at
  exactly that spot and would break every browser that already holds `'true'`. A second raw-string key
  keeps the existing contract byte-for-byte, keeps both reads parse-free, and lets the two degrade
  independently: a missing name does not invalidate a confirmation.
- The read is a third module-level helper, `readConfirmedName()`, with the **same `try`/`catch`
  contract** the existing two already have: any throw returns `null`, nothing surfaces to the guest,
  nothing escapes into render. It is read in its own lazy `useState` initializer alongthe existing one.
- The write happens in the same `confirm` handler as the flag, from the validated payload. It is
  wrapped in `try`/`catch` and swallows. **A failed name write must not prevent a successful flag
  write, or vice versa** — `dev` keeps them as two independent helpers with two independent
  `try`/`catch` blocks, not one block around both, so a quota error on the second does not roll back
  the first.
- **On a fresh confirmation the name comes from the payload, not from storage.** The in-session
  message never depends on the write having succeeded.
- Privacy: it is the guest's own name, in the guest's own browser, transmitted nowhere. No new
  surface beyond what the flag already was. When the `rsvp` table becomes the source of truth, both
  keys are deleted together — which is why keeping them dumb strings matters.

**Half 2 — the fallback.** When `hasConfirmed` is true and no usable name is available (key absent,
empty, or whitespace-only after trimming), the section renders
`{{copy: rsvp_feedback_fallback}}` instead — a complete, celebratory sentence with no name in it, not
the named message with a hole in it. `dev` treats a whitespace-only stored value as absent; that is
one `.trim()` check, and it is the only validation applied to the restored name. The stored value is
**not** re-run through `rsvpSchema` on read: it passed validation when it was written, and a strict
re-check would silently downgrade a guest to the fallback because a bound changed in a later release.

**The name that gets rendered is the first name.** `dev` renders the substring before the first space
of the trimmed name — `"Maria das Graças Figueredo"` → `"Maria"`. Reasons: `Tá confirmado, Maria!`
reads the way a person speaks, a full four-part Brazilian name would wrap the feedback line on a
320px phone, and the schema's `.max(60)` alone does not bound the rendered length usefully. The full
name is what the schema validates and what gets stored; the first name is a presentation choice made
at render time, so the future insert change still has the whole string. A single-word name yields
itself unchanged.

`dev` builds the message through one small module-level function taking the name and returning the
string, so the two paths (named / fallback) are decided in one place rather than in JSX. The literal
`{user_name}` token disappears from the codebase entirely — it is not a variable, it was never a
template, and leaving it as one would invite a future reader to write their own interpolation.

### Reconciling the spec/code drift

Both items are the user's direct edits to shipped code, and in both the code wins.

**1. The modal's title is `'Convidado'`.** `add-rsvp-confirmation-section`'s spec says "Cadastro do
convidado". The delta modifies the requirement to `'Convidado'`. Not a copy placeholder — it stays in
the same category as "Em breve!" and "Confirmar": a fixed string the user wrote.

**2. The modal has a visible corner close control.** The spec says it "SHALL NOT display any visible
dismissal control — no footer dismissal button and no corner close control", and reasons at length
about the cost of that. The shipped `ModalForm` renders a `DialogClose`-wrapped `xilo` `X` button at
`absolute top-4 right-4`. The delta replaces the prohibition with a requirement describing the
control, and in doing so:

- **Retires the "no visible dismissal control" trade-off.** The concern that argued for a footer
  button — Escape does not exist on a phone, and "tap outside to close" is a convention a guest either
  knows or does not — is now *answered* by the corner `X`, which is thumb-reachable and labelled. The
  earlier design's mobile-first worry is resolved, not accepted as a cost.
- **Keeps the irreversibility trade-off intact.** Backing out is now easy; undoing a confirmation
  still is not, and this change makes it slightly worse by storing a second key. There is still no
  undo control, by design. Revisit with the insert change, where "edit my RSVP" is a real requirement.
- **Fixes two defects in the shipped control**, both in scope here because the delta is describing it
  anyway:
  - **It has no accessible name.** It contains a bare Lucide `<X />` and nothing else — no
    `aria-label`, no `sr-only` text. A screen reader announces an unlabelled button. It gains
    `aria-label="Fechar"` (pt-BR, per the UI-text rule) and `aria-hidden` on the icon. Note this is
    *not* the English `sr-only` "Close" the generated `dialog.tsx` ships — that one is still
    suppressed by `showCloseButton={false}`, so the previous change's claim that the gap "needs no
    follow-up" was right about the generated control and wrong about the hand-rolled replacement.
  - **It uses `hover:bg-amber-800`**, a stock Tailwind colour outside the three-token palette, in
    direct violation of §4.5's "avoid saturated colours outside the defined palette" and §5.1's "no
    component repeats a literal colour". It becomes `hover:bg-sertao-brown hover:text-bone-white` —
    `sertao-brown` is §4.2's documented button-hover token.
  - Sizing: `size="icon-sm"` is 28px, under the 44px floor, and it is now the modal's only dismissal
    affordance on a phone. It carries a `size-11` override.

### Reduced motion and the existing contract

Unchanged and inherited: `RsvpForm` still calls `useReducedMotion()`, the confetti is still gated on
`justConfirmed && !reduceMotion`, and the reserved `min-h-48 sm:min-h-64` box still absorbs the swap.

Two additions:

- **The form adds no motion of its own.** No animated field entrance, no error message slide-in, no
  transition on the rule's focus colour beyond the `xilo` variant's inherited one. An error appearing
  is information, and it should be there instantly; `frontend-design`'s point about scattered
  fade-and-slide entrances applies directly to a four-field stack.
- **The reserved box is now at more risk of being wrong**, because the feedback text's length varies
  with the guest's name. Flagged in Risks; QA re-checks at 320px with a long first name.

### Not in scope, restated so `dev` does not drift into it

No `supabase` import anywhere in the touched files. No `useRsvpSubmit` hook. No submit-pending or
submit-error state on the button — there is no network call to be pending on, and inventing a
disabled/spinner state now would have to be redesigned when the real one lands. No deadline check
against 26/09/2026. `onConfirm(data)` receiving a validated payload and dropping everything but the
name is the correct, honest end of this change.

## Risks / Trade-offs

- **[Trade-off]** The ruled-line input is a real departure from shadcn's boxed default, so the
  generated `input.tsx` fights it with ring, radius, shadow and `destructive` classes that all have to
  be neutralised at the call site. → **Mitigation**: the overrides live in exactly one place,
  `CarvedTextField`, which every later form (including the admin login) consumes. If the neutralising
  turns out to need more `!`-style specificity than is comfortable, the fallback is a project-level
  wrapper — still not an edit to `src/components/ui/`.
- **[Trade-off]** Error is signalled by line weight plus an icon, with no colour change, because the
  palette has no red. It is less immediately alarming than a red border. → Accepted: §4.5 forbids the
  alternative, and the icon plus the message text carry the meaning without relying on hue at all,
  which is better for colour-blind guests than a red border would have been. QA should still confirm
  the doubled rule is legible at 320px; if it reads too quietly, the hatched-rule alternative recorded
  above is the next step.
- **[Risk]** The doubled rule and the focus rule are both `carved-black`, so a focused-and-errored
  field distinguishes itself from a merely-focused one only by the second line. → **Mitigation**: the
  message and its icon are always present under an errored field, so the two states are never
  actually ambiguous in context; the rule is the secondary cue, not the only one.
- **[Risk]** The caret jumps to the end when the WhatsApp value is edited mid-string. → Accepted and
  documented above; the field is 14 characters and almost always typed in one pass. Fix is local.
- **[Risk]** `guestCount`'s bound of 10 is a judgment call from `PROJECT.md` §5.1's "~30 registros
  total". A genuine 12-person family group would be rejected. → **Mitigation**: it is one constant in
  one file, shared with the stepper's ceiling, so raising it is a one-line change. Worth asking the
  user if they expect any group above 10.
- **[Risk]** Zod v4's per-issue message param spelling differs from v3 and from `SYSTEM-DESIGN.md`
  §6's snippet. Getting it wrong fails silently — the field still validates, but a guest sees Zod's
  English default. → **Mitigation**: an explicit task to verify every message renders in Portuguese
  by triggering each failure by hand, not just by reading the schema.
- **[Risk]** The second storage key can be written when the first fails, or the reverse, leaving a
  browser that says "confirmed" with no name, or a name with no confirmation. → **Mitigation**: the
  first case is exactly what the fallback message handles; the second is inert, because
  `hasConfirmed` is what gates the success state and a stray name is never read without it. The two
  independent `try`/`catch` blocks make both cases survivable rather than trying to make them
  impossible.
- **[Trade-off]** Persisting a guest's name in their browser is slightly more personal data at rest
  than a boolean. → Accepted: it is their own name, on their own device, sent nowhere, and it is the
  only way to keep the interpolated message honest across a reload. Deleted together with the flag
  when the `rsvp` table takes over.
- **[Risk]** The reserved `min-h-48 sm:min-h-64` box now has to fit a message whose length depends on
  a guest's first name. A long one could wrap and overflow the reserve at 320px. → **Mitigation**: QA
  checks with a long first name; first-name-only rendering already cuts the worst case dramatically;
  the reserve is a single class.
- **[Trade-off]** `ModalForm` stops being presentational, contradicting a design decision recorded in
  the previous change. → Accepted and stated openly in "Where the form lives"; the previous decision
  was correct for a modal holding two fixed strings and is not correct for one holding a form.
- **[Risk]** Four fields plus visible errors overflow a 320×568 viewport, and the panel scrolls. A
  guest might not notice the submit button below the fold. → **Mitigation**: `max-h-[90dvh]` leaves a
  visible sliver of overlay so the panel reads as scrollable; field order puts the count row directly
  above the button; QA checks that submitting with two errors visible keeps the button reachable.
- **[Known, out of scope]** `DialogOverlay`'s `bg-black/10` + `backdrop-blur-xs` violates §4.5 and
  ships today. It is unreachable from the call site. Flagged for a follow-up change, not fixed here.

## Open Questions

- **Is 10 the right ceiling for `Quantidade de convite`?** Decided as 10 and implementable as-is; the
  user may know of a family group larger than that. One constant if they do.
- **Should "Confirmar" become "Confirmar presença" now that the button submits a real form?** Decided
  as "keep it", because two prior artifacts fix the string verbatim. Raised because the button's
  meaning changed materially in this change and the user may want the label to follow.

Deliberately deferred rather than open: the Supabase column name for the phone, the
`number_of_persons` / `numero_pessoas` contradiction, the dashboard column, digit normalisation of
the stored WhatsApp value, and the relationship between the two `localStorage` keys and a real `rsvp`
record. All five belong to the change that adds the insert.

## Content slots for the copy writer

Every slot below is pt-BR, and every one is a placeholder — `dev` renders the `{{copy: …}}` marker
verbatim so the copy writer can find it. Strings **not** listed here are fixed and must be written
exactly: `Convidado`, `Seu nome`, `Whatsapp`, `83 9 xxxx-xxxx`, `E-mail`,
`Quantidade de convite`, `Confirmar`, `Fechar`, `Diminuir quantidade`, `Aumentar quantidade`,
`Tá confirmado <primeiro nome>!`, and the three existing schema messages (`Informe seu nome`,
`E-mail inválido`, `Mínimo de 1 pessoa`).

| Slot | Must communicate | Length | Tone |
| --- | --- | --- | --- |
| `{{copy: rsvp_modal_intro}}` | That filling this in is what confirms the guest's presence. Replaces `'Em breve!'` in `DialogDescription` | ≤ 12 words, one sentence | Warm, festive, sober — Cordel Arcade. Not instructional ("preencha os campos abaixo") |
| `{{copy: rsvp_whatsapp_helper}}` | Why the number is being asked for: it is how the organizer will reach the guest | ≤ 10 words | Plain and reassuring; it is a privacy answer, not a sales line |
| `{{copy: rsvp_feedback_fallback}}` | The same celebration as `Tá confirmado <nome>!` but with no name in it — a complete sentence, not the named one with a gap | ≤ 5 words | Identical register to `Tá confirmado …!` — the two are read by the same guest on different visits |
| `{{copy: rsvp_error_whatsapp_required}}` | The field is empty and must be filled | ≤ 6 words | Imperative, direct, no apology. Matches `Informe seu nome`'s register |
| `{{copy: rsvp_error_whatsapp_format}}` | The number is incomplete or is not a mobile — say the expected shape, mention it must be a celular | ≤ 10 words | Says how to fix it, never just "inválido" |
| `{{copy: rsvp_error_name_max}}` | The name is longer than 60 characters | ≤ 8 words | Same register as the other field errors |
| `{{copy: rsvp_error_guest_count_type}}` | Only numbers belong in this field | ≤ 8 words | Same register. Must exist, or Zod answers in English |
| `{{copy: rsvp_error_guest_count_int}}` | A whole number, not a fraction | ≤ 8 words | Same register |
| `{{copy: rsvp_error_guest_count_max}}` | The ceiling is 10 people per invite, and the organizer should be contacted for more | ≤ 12 words | Not scolding; the guest with a big family is a good problem |
