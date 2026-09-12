## Context

`RsvpForm.tsx` (`src/pages/InvitePage/partials/RsvpForm.tsx`) is a deliberate stub, per `AGENTS.md`'s
"setup stage" pitfall: `<form>RSVP form — under construction</form>`. It is not yet composed into
`InvitePage` (`src/pages/InvitePage/index.tsx`'s TODO still reads "compose `RsvpForm` once it
exists"). Per `SYSTEM-DESIGN.md` §4's folder layout, `RsvpForm` is the third of the invite page's
three sections (`InviteHero`, `EventDetails`, `RsvpForm`); this design covers only `RsvpForm` and the
new `ModalForm` it opens. `SYSTEM-DESIGN.md` §4 suggests `src/components/invite/RsvpForm.tsx`, but
both prior sections actually landed under `src/pages/InvitePage/partials/` instead — this design
follows the repo's real layout and places `ModalForm.tsx` alongside `RsvpForm.tsx` there, noting the
divergence rather than resolving it (not this change's job to relocate `InviteHero`/`EventDetails`).

The real RSVP form — name, email, guest count, `rsvpSchema` validation via
`@hookform/resolvers/zod`, the Supabase `rsvp` insert — is explicitly staged as later work; this
change only builds the section's shell: a confirmation button, a modal, and a confetti + feedback
effect wired to a placeholder "Confirmar" action. `rsvpSchema.ts`, `react-hook-form`, and
`supabaseClient.ts` are untouched.

Design constraints already fixed by `GUIDELINES.md` (not decided here): the three-color palette
(`carved-black`, `bone-white`, `sertao-brown`), `font-title` (Xilosa, generic-serif fallback until
delivered) and `font-body` (Caveat), the `.carved-1/2/3` asymmetric-radius utilities and the rule
that neighboring carved shapes must not repeat the same silhouette (§5.3), and Lucide as the utility
icon library (§5.4, not needed by this section's fixed content pieces). `InviteHero` used
`.carved-1` (panel) and `.carved-3` (medallion); `EventDetails` — the section immediately before this
one in page order — used `.carved-2` (facts panel) and `.carved-3` (GPS CTA). The `xilo` Button
variant (`src/components/ui/button.tsx`) already bakes in `carved-3` as part of its class list, so
every `xilo`-variant button in this design carries `.carved-3` without a separate decision.

`src/components/ui/` today holds only `button.tsx` plus `.gitkeep`. This change is the first
consumer of shadcn's `Dialog` primitive, added via the shadcn CLI per `AGENTS.md`'s explicit pitfall
("Add shadcn components with the CLI... that directory is excluded from lint and format on
purpose") — `dialog.tsx` is generated output, not hand-authored here.

`public/assets/images/confetti.json` is a bodymovin/Lottie export (`"v":"5.5.7"`, 1920×1080, ~126
frames at 25fps, ≈5s of playback) — plain Lottie JSON, not the newer `.lottie` bundle format. No
Lottie playback library is installed (`package.json` has neither `lottie-react` nor
`@lottiefiles/*`); this change adds one.

**Revision note (first pass).** An earlier pass of this design placed the confetti + feedback success
state _inside_ the modal, keeping the modal open on "Confirmar". The user reviewed the two options
and chose the documented alternative instead: **"Confirmar" closes the modal and the celebration
plays on the invite page.** Every decision below reflects that choice; the in-modal variant is
recorded under "Alternative considered" for the record. The user also confirmed `lottie-react` as the
player library, and left the button reveal-animation question to this design, which now decides it.

**Revision note (second pass, after implementation).** The section is already implemented. Three
things changed after that implementation landed, and the artifacts are revised to match:

1. **The confirmation now persists across visits** via `localStorage`, reversing this design's
   earlier non-goal ("no `localStorage`... reloading `/` restores the default state"). See
   "Persisting the confirmation" below, which is the only genuinely new decision in this pass.
2. **The confetti does not replay for a returning guest.** It celebrates the act of confirming, not
   the fact of being confirmed, so the section now distinguishes "just confirmed" from "was already
   confirmed" even though both render the same text.
3. **The feedback text is `Tá confirmado {user_name}!`**, not the `Eita que tá arretado!` earlier
   passes specified verbatim. The user changed this deliberately and chose to leave the literal
   `{user_name}` token visible. It is a staged placeholder, not a bug and not an interpolation that
   silently failed — see "The feedback text and its `{user_name}` token" below.

**Revision note (third pass).** A review found this design specifying a footer dismissal button on
`ModalForm` that the implemented component never had (`ModalForm.tsx` passes `showCloseButton={false}`
and its footer holds only "Confirmar"). The user was asked whether to add the control to the code or
drop it from the plan, and **chose to drop it**: the modal ships with no visible dismissal control at
all. The reasoning behind the earlier decision, and what accepting its removal costs, are kept below
under "No visible dismissal control, and what it costs" rather than deleted — that trade-off now
compounds with the `localStorage` persistence, and a future reader needs both halves. This also
removes one of the change's two copy placeholders; `{{copy: rsvp_confirm_button_label}}` is now the
only one.

## Goals / Non-Goals

**Goals:**

- Give `dev` a composition precise enough to implement without further design decisions: the
  confirmation button, the modal's fixed-content shell, and the page-level confetti + feedback
  success state, including which existing token/utility/component applies to each.
- Specify exactly where the success state renders once the modal is gone, how long it persists, and
  what happens to the confirmation button it replaces.
- Specify how the confirmation is remembered between visits, when it must be read, and how a browser
  that refuses storage degrades.
- Carry the established reduced-motion contract across the move from modal to page, including the
  layout-stability consequence that move introduces.
- Keep every piece of wording that requires tone or word-choice judgment as a scoped placeholder,
  while writing the caller's fixed verbatim strings directly.

**Non-Goals:**

- The real RSVP form: no `name`/`email`/`guestCount` fields, no `rsvpSchema.ts` change, no
  `react-hook-form` wiring, no Supabase insert. `ModalForm`'s shell in this change is the placeholder
  that a later change will replace with the real fields, inside the same modal.
- Any new `.svg`/`.png` asset request — `confetti.json` already exists and is the only asset this
  change consumes.
- Revalidating the pending color palette (`GUIDELINES.md` §4.2) or delivering the Xilosa font.
- Any server-side record of the confirmation. The persistence added in this pass is browser-local
  only; nothing is written to Supabase, no URL state, no cookie, no cross-device sync.
- Interpolating a real guest name into the feedback text — the `{user_name}` token stays literal
  until the form that collects a name exists.
- Any visible dismissal or undo control: not a footer dismissal button in the modal, not shadcn's
  corner `X`, and not an "undo" under the celebration. See the decision below.
- Relocating `InviteHero.tsx`/`EventDetails.tsx` to match `SYSTEM-DESIGN.md`'s original
  `src/components/invite/` suggestion — out of scope; this change follows the repo's real layout.

## Decisions

### Overall composition: a button that opens a modal, and a celebration that lands back on the page

```
RsvpForm (page section) — default state
┌───────────────────────────────────────────┐
│                                           │
│         [ {{confirm button}} ]            │  <- xilo variant, carved-3 baked in
│                                           │
└───────────────────────────────────────────┘
         │ opens
         ▼
ModalForm (shadcn Dialog)                       no corner X, no footer dismissal button;
┌───────────────────────────────────────────┐   Escape and an overlay tap still close it
│  Cadastro do convidado                    │  <- fixed title, font-title
│                                           │
│  Em breve!                                │  <- fixed body, font-body
│                                           │
│                        [ Confirmar ]      │  <- xilo variant, the footer's only control
└───────────────────────────────────────────┘
         │ on Confirmar: modal CLOSES, flag is stored, RsvpForm swaps to its success state
         ▼
RsvpForm (page section) — success state, same box
┌───────────────────────────────────────────┐
│ ····· confetti.json, absolute inset-0 ····│  <- fresh confirm ONLY; decorative layer, behind
│ ····  Tá confirmado {user_name}!      ····│  <- fixed feedback text, z-10, both paths
│ ···········································│
└───────────────────────────────────────────┘
         (the confirmation button is gone, this session and the next)

RsvpForm (page section) — restored state, on a later visit in the same browser
┌───────────────────────────────────────────┐
│                                           │
│        Tá confirmado {user_name}!         │  <- same text, rendered from first paint
│                                           │  <- NO confetti layer mounted at all
└───────────────────────────────────────────┘
```

Rationale: `PROJECT.md` §5.1 describes the RSVP section as "form + confirm button"; since the real
fields don't exist yet, the only thing `RsvpForm` can responsibly render today is the entry point
(the button) plus the interaction shell (the modal) that a later change fills in. Keeping the button
on the page minimal (no card, no panel, no heading) mirrors `EventDetails`'s closing message sitting
outside a panel — the page section's job here is to invite the tap, not to compete visually with the
two richer sections above it.

State ownership: `RsvpForm` owns three booleans — `isModalOpen` (passed to `ModalForm` as
`open`/`onOpenChange`), `hasConfirmed` (which content renders), and `justConfirmed` (whether the
confetti plays). `ModalForm` owns no state of its own; it takes `open`, `onOpenChange` and `onConfirm`
props and is otherwise presentational. `onConfirm` sets `hasConfirmed` and `justConfirmed` to `true`,
sets `isModalOpen` to `false`, and writes the storage flag, in the same handler. This is what the
first-pass reversal buys: the celebration belongs to the section, so the section owns the flags, and
`ModalForm` stays a dumb shell that the real form drops into later without inheriting success-state
logic.

`onOpenChange` matters more than usual here: with no dismissal control in the panel, it is the only
path by which the modal closes without confirming, and it is what `Dialog` calls for both Escape and
an overlay click. `dev` wires it straight to `setIsModalOpen` and nothing else — closing that way
touches neither `hasConfirmed` nor storage.

### Element 1 — confirmation button on the page

A single `Button` with `variant="xilo"` (matching `EventDetails`'s GPS CTA and `InviteHero`'s use of
the same variant family for calls-to-action), centered in the section, opening `ModalForm`.

- Content placeholder: `{{copy: rsvp_confirm_button_label — 2-4 words, Portuguese, invites the guest
to start confirming attendance, Cordel Arcade tone, e.g. the sense of "Confirmar presença" — that
exact string is illustrative only, not final}}`. This is the change's **only** copy placeholder.
- **Reveal animation: yes.** The button gets the same scroll-triggered reveal `EventDetails.tsx`
  already uses — a local `Variants` object shaped like its `gpsVariants` (`hidden: { y: 12, opacity:
0 }` → `visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }`), applied
  with `initial={reduceMotion ? false : 'hidden'}`, `whileInView="visible"`, `viewport={{ once:
true }}`.
  - **No `delay`.** `EventDetails`'s 0.15s/0.3s delays exist to stagger three elements inside one
    section; this section reveals a single element, so a delay would only make the page's last
    interactive control feel late.
  - Reasoning for deciding yes rather than leaving it optional: the button is the final element of
    `/` and the only content of its section. Every other block on the page enters on scroll; a button
    that simply exists when scrolled to would read as the one unfinished section rather than as a
    deliberate contrast. It is also the exact code shape `dev` has already written twice, so the
    consistency costs a variants object and one wrapper.
  - Apply the variants to a `motion.div` wrapping the `Button`, not via `asChild` with
    `motion.button`. `EventDetails` needed `asChild` because its CTA is an anchor; here the element
    is already a `<button>`, and wrapping leaves the `xilo` variant's class list (including
    `carved-3`) untouched.
- A returning guest never sees this button, so its reveal never runs on a restored visit — the
  success state is what mounts instead.

### Element 2 — `ModalForm`'s content: title, body, Confirmar

Built on shadcn's `Dialog` (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`,
`DialogFooter` from the generated `dialog.tsx`). The dialog's content panel
(`DialogContent`) carries `.carved-1` plus the heavy `border-4 border-carved-black bg-bone-white`
treatment already established by both prior panels. `.carved-1` is chosen over `.carved-2` because
`EventDetails`'s panel — the surface directly behind the open modal — is `.carved-2`, and §5.3's rule
is that two neighboring carved shapes must not repeat the same silhouette; `InviteHero`'s own
`.carved-1` panel is far up the page and never coincides on screen with an open modal.

- Title: fixed string "Cadastro do convidado", rendered via `DialogTitle`, `font-title`.
- Body: fixed string "Em breve!", rendered via `DialogDescription` (or a plain `<p>` if
  `DialogDescription`'s semantics don't fit a single short sentence), `font-body`.
- Confirm button: `Button` with `variant="xilo"`, fixed label "Confirmar" (caller-specified verbatim,
  not a placeholder — distinct from Element 1's button, whose label is a placeholder because
  `PROJECT.md` never fixes that exact string). Calls `onConfirm`. It is the **only** control in
  `DialogFooter`.
- No dismissal control of any kind: `DialogContent` is rendered with `showCloseButton={false}` (the
  generated `dialog.tsx` exposes the prop), so shadcn's corner `X` never renders, and no `DialogClose`
  button sits in the footer. See the next decision.
- Backing out writes nothing: whichever affordance closes the modal, no storage key is set, and the
  next visit still shows the confirmation button.

Both the title and body strings are fixed content, not copy placeholders — the caller specified them
verbatim as this change's scope, the same way `InviteHero`'s "Muricarliton" and "50" are treated as
fixed facts rather than draftable copy.

### No visible dismissal control, and what it costs

**Decision: the modal exposes no labelled way out. It closes on Escape, on a click or tap on the
overlay outside the panel, and on "Confirmar" — nothing else.**

An earlier pass of this design specified a footer dismissal button (`xilo` variant, wrapped in
`DialogClose`, sitting before "Confirmar" so the affirmative action read last) with its own copy
placeholder. The argument for it was genuine and is worth keeping on the record: **Escape and an
overlay tap are thin affordances on a mobile-first invite.** Escape does not exist on a phone at all,
and "tap outside the box to close it" is a convention a guest either knows or does not — this invite
is opened by people of every age from a WhatsApp link, mostly one-handed, and the first pass had also
just removed the success state's close button, leaving the modal with no thumb-reachable exit.

The implemented `ModalForm.tsx` never carried that button, and the user, shown the discrepancy,
decided the spec should drop it rather than the code gain it. The concern above is accepted as a
known cost, not refuted.

Two consequences to record, because they compound:

1. **The modal cannot be dismissed by any visible control**, only by the two built-in affordances. A
   guest who opened it to look, on a phone, backs out by tapping the page outside the panel.
2. **Confirming is effectively irreversible from the guest's side.** `onConfirm` writes the
   `localStorage` flag, the confirmation button is replaced rather than demoted, and there is no undo
   control — so a mistaken tap on "Confirmar" persists across reloads with no in-page way back. The
   only escape hatch is clearing site data.

Neither is a defect and neither should be filed as one. Both are cheap to reverse if the user changes
their mind: (1) is one `DialogClose`-wrapped `Button` in `DialogFooter` plus one copy placeholder, and
(2) is revisited by the future change that adds the real form and the Supabase insert, where "edit my
RSVP" is a real requirement rather than an undo for a no-op.

Because `showCloseButton={false}` suppresses shadcn's corner control, the English `sr-only` "Close"
label that control ships with never reaches a guest — the pt-BR UI-text gap earlier passes logged as
a follow-up is resolved by this decision rather than deferred.

### Element 3 — confetti + feedback success state, on the page, inside `RsvpForm`'s own section

**Decision: activating "Confirmar" closes the modal, and the confetti + feedback text render inside
`RsvpForm`'s section, in place of the confirmation button — not as a page-level overlay.**

Why the section and not a full-viewport overlay: an overlay covering the invite would need its own
dismissal affordance, a z-index above everything, and page-level state — which is to say it would be
a second modal wearing different clothes, immediately after the user asked for the modal to get out
of the way. Keeping the celebration inside the section that owned the trigger keeps the state local
to `RsvpForm`, needs no portal, and lands the burst where the guest is already looking: they scrolled
to this section to tap the button, so the section _is_ roughly where the modal was.

Layout:

- The `<section>` is `relative`, centers its content (`flex flex-col items-center justify-center
gap-6 text-center`), spans the page's content width, and carries `overflow-x-clip` so a wide
  confetti burst can never produce a horizontal scrollbar.
- **It reserves its height in all three states** (button, fresh success, restored success):
  `min-h-48 sm:min-h-64`. The states are close but not identical in height, and the confetti layer is
  absolutely positioned and therefore contributes none. Without the reserved box, confirming would
  nudge the page. The reserved box is also what gives the confetti a real canvas, and it keeps a
  restored visit — which never mounts the confetti — the same height as a fresh one.
- **Confetti layer** — a Lottie player wrapped in a `pointer-events-none absolute inset-0`
  container, `aria-hidden="true"` (decorative reinforcement, mirroring how `EventDetails` marks its
  fact icons), rendering `/assets/images/confetti.json`, `loop={false}`. `confetti.json` is 1920×1080
  and the section box is not 16:9, so pass `rendererSettings={{ preserveAspectRatio: 'xMidYMid
slice' }}` — the burst covers the box and crops at the edges instead of letterboxing into a small
  centered rectangle on a narrow phone. **Rendered only on a fresh confirmation** — see "The confetti
  belongs to the moment" below.
- **Feedback text** — the fixed string "Tá confirmado {user_name}!", `font-body`,
  `text-carved-black`, `relative z-10` so it sits above the confetti layer, sized
  `text-2xl sm:text-3xl`: one step above `EventDetails`'s closing message (`text-xl sm:text-2xl`),
  because this is the page's emotional payoff and the last thing the guest reads. Identical in both
  the fresh and restored paths.
- **Announcement and focus.** The success region carries `role="status"` so the swap is announced to
  a screen reader. On a **fresh confirmation**, `dev` should also move focus to that region
  (`tabIndex={-1}` plus a `.focus()` on mount): Radix returns focus to the dialog's trigger on close,
  but that trigger has just been unmounted, so focus would otherwise fall to `<body>`. On a
  **restored** visit there is no dialog and no lost focus, so focus is not moved — stealing focus on
  page load would yank a returning guest to the bottom of the page. Gate the focus call on the same
  `justConfirmed` flag that gates the confetti.
- **No programmatic scroll** on confirm, and none on a restored load either. The guest is already at
  this section — scrolling them would be motion they did not ask for, and it would fight the
  reduced-motion contract below.
- Timing is not orchestrated: `onConfirm` closes the dialog and mounts the success state in the same
  render. A brief overlap with the dialog's own exit animation is fine and reads as the celebration
  bursting out from behind it. No `setTimeout`, no completion callback chaining.

**Persistence: the feedback text stays, the button does not come back.** The confetti plays once and
stops (`loop={false}`, player left mounted on its final frame — no unmount timer, nothing to clean
up); the feedback text persists for the rest of the page session, and now for later visits in the
same browser. `RsvpForm`'s confirmation button is **replaced**, not demoted — it is not rendered
again alongside the feedback text.

Why: an RSVP flow's truthful end state is "you're in", and re-offering the same button underneath the
celebration would read as "did that work?" and invite double-confirmation — a real concern the moment
the Supabase insert exists. The rejected alternative was having confetti and text both disappear when
the animation ends and the section return to its button: rejected because a celebration that erases
itself after five seconds leaves a guest who looked away with no evidence anything happened.

**Alternative considered — success state inside the modal (the earlier decision, now reversed)**:
"Confirmar" swaps the modal's own content for the confetti/feedback/close and the `Dialog` stays
open. Its argument was that a dialog closing conventionally signals dismissal, which fights a
celebratory outcome. The user chose the page-level version regardless: the celebration reads bigger
with the overlay gone, and the modal is a placeholder shell that will hold a real form later, so
keeping it purely an input surface — open to fill in, closed once submitted — is the shape that
survives the real form landing in it.

### Persisting the confirmation in `localStorage`

**Decision: on confirm, `RsvpForm` writes a flag to `localStorage`, and reads it back on every later
load so a returning guest sees the feedback text instead of the button.** This replaces the earlier
non-goal, which said nothing was persisted and a reload restored the button.

- **Key**: `digital-invite:rsvp-confirmed`. English identifier per the repo's code-in-English rule,
  namespaced with the project name so the invite never collides with anything else on the same
  origin. `dev` declares it once as a module-level constant in `RsvpForm.tsx` (e.g.
  `const RSVP_CONFIRMED_STORAGE_KEY = 'digital-invite:rsvp-confirmed'`) rather than repeating the
  literal at the read and write sites.
- **Stored shape**: the exact string `'true'`, and nothing else. Not JSON, not a timestamp, not an
  object. The flag has exactly one bit of information today, and the smaller the stored shape the
  smaller the failure surface: reading it is a string comparison, so there is no parse step that can
  throw and no schema to version. `hasConfirmed` is true **iff** the stored value reads exactly
  `'true'`; anything else — missing key, empty string, `"1"`, leftover JSON from some future
  iteration — is treated as not confirmed. That comparison is the whole of the "unparseable value"
  handling.
- **Read at initial render, not in an effect.** The read happens in a lazy `useState` initializer —
  `useState(() => readConfirmedFlag())` — so `hasConfirmed` is already `true` on the component's very
  first render. Reading it in a `useEffect` would render the confirmation button once, then swap it
  for the feedback text on the next commit: a returning guest would watch the page ask them to
  confirm again and then take it back. That flash is precisely the thing this feature exists to
  prevent, so the initializer is a requirement, not a micro-optimization. The lazy form (a function
  passed to `useState`) also matters: `useState(readConfirmedFlag())` would touch storage on every
  render.
- **Failure handling — this is a browser boundary, so it gets real handling.** `localStorage` is not
  reliably present: Safari private mode has historically thrown on write, site-data settings and
  enterprise policies can disable it outright, and embedded webviews (the in-app browsers of
  WhatsApp and Instagram, which is exactly how this invite will be opened) can deny access. So:
  - The read is wrapped in `try`/`catch` and returns `false` on any throw — the guest simply sees the
    default state with the confirmation button.
  - The write is wrapped in `try`/`catch` and swallows any throw. The confirmation still succeeds for
    the current session: the modal closes, the confetti plays, the feedback text appears. The only
    consequence is that the next visit shows the button again.
  - Neither failure surfaces anything to the guest, logs an error that would alarm someone reading
    the console, or lets an exception escape into React's render path. A storage helper that throws
    during a `useState` initializer would blank the page.
  - Keep the two accesses in small named helpers (`readConfirmedFlag` / `writeConfirmedFlag`) so the
    `try`/`catch` is contained and `RsvpForm`'s own logic stays free of them — this also keeps the
    component under ESLint's `complexity` and `max-lines-per-function` limits.
- **This is per-browser and per-device, and stores nothing on any server.** A guest who confirms on
  their phone and later opens the invite on a laptop sees the confirmation button again; so does a
  guest who clears site data, or opens the link a second time from a different app's in-app browser.
  That is acceptable **only because no RSVP record exists yet** — there is nothing authoritative for
  the flag to disagree with, so the worst case is a guest tapping a placeholder button twice. Written
  down here so a later reader does not file it as a bug, and so it is revisited when the real
  Supabase insert lands: at that point the authoritative "has this guest confirmed" answer comes from
  the `rsvp` table, and this flag becomes at most a local fast-path — or is deleted.
- **Not chosen**: `sessionStorage` (dies with the tab, which defeats the purpose), a cookie (sent on
  every request for a value no server reads), and a URL query parameter (survives a share and would
  confirm somebody else).

### The confetti belongs to the moment, not to the state

**Decision: the confetti plays on a fresh confirmation only. A guest whose success state was restored
from storage sees the feedback text with no confetti mounted at all.**

The confetti celebrates an event — the guest just decided to come — not a fact. Replaying it on every
visit would turn a one-time payoff into a five-second animation the guest has to sit through each
time they re-open the invite to check the address, which is the most likely reason they return. It
would also mean loading and rendering a 1920×1080 Lottie for a guest who has nothing new to celebrate.

Implementation shape: `justConfirmed` is a separate `useState(false)` that only `onConfirm` sets to
`true`. It is deliberately **not** derived from `hasConfirmed`, because `hasConfirmed` is true in both
paths. The confetti layer renders when `justConfirmed && !reduceMotion`; the feedback text renders
whenever `hasConfirmed`. Because `justConfirmed` starts `false` on every load, the restored path
never mounts the player — the component tree contains no Lottie node at all, so nothing is fetched
and nothing is rendered. The same flag gates the one-time focus move described in Element 3.

The success-state entry animation (`initial`/`animate` on the feedback text) follows the same logic:
on a restored visit the text was not "revealed", it was simply always there, so animating it in on
page load would be a small unexplained movement. `dev` may pass `initial={false}` on the restored
path for the same reason reduced motion does.

### The feedback text and its `{user_name}` token

The feedback text is the fixed string `Tá confirmado {user_name}!`, rendered **literally, token
included**. This supersedes `Eita que tá arretado!` from the earlier passes; the user changed it
deliberately.

The `{user_name}` token is a **staged placeholder, not a broken interpolation**. This change collects
no guest name — the modal still reads "Em breve!" and has no fields — so there is nothing to
substitute. It is left visible on purpose, as a marker of where the name will go once the real RSVP
form exists. Consequences worth recording:

- It is **not** a copy placeholder for the copy writer agent. The copy writer does not draft this
  string; the user fixed it verbatim, in the same category as "Cadastro do convidado" and "Em breve!".
- It is **not** a defect for QA to file. QA should verify the token renders verbatim, not that it
  disappears.
- It is resolved by the future change that adds the real RSVP form fields (name, email, guest count,
  `rsvpSchema`, the Supabase insert). That change owns replacing the token with the collected name,
  and owns deciding the fallback when a name is absent. Until it lands, the token stays.

### Lottie library choice: `lottie-react`, not `@lottiefiles/dotlottie-react` — confirmed

`confetti.json` is plain bodymovin/Lottie JSON (confirmed `"v":"5.5.7"`), not a `.lottie` bundle.
`lottie-react` is a thin React wrapper around `lottie-web` built to consume exactly this format with
no format conversion step. `@lottiefiles/dotlottie-react` is built around the newer `.lottie` bundle
format and consumes raw JSON only as a secondary path; reaching for it here would add a dependency
optimized for a file format this project doesn't have. **The user reviewed and confirmed this
choice**; it is settled, not open.

- **New dependency**: `lottie-react` (`dev` installs via `yarn add lottie-react`, within `dev`'s
  existing `yarn install` authorization boundary per `.agents/rules/tooling-yarn-dev-authorization.md`
  — no separate authorization needed).
- Usage: the file lives in `public/`, outside the module graph, so it is not imported as
  `animationData`. `dev` references it by its public URL path (`/assets/images/confetti.json`),
  consistent with how every other asset in this project is consumed from `public/` by path (see
  `GUIDELINES.md` §11's `/assets/images/...` convention). Which prop carries that path is the
  library's business (`path` on the full player, `src` on the lighter one `dev` selected) — the
  design's constraint is only that the file is referenced by public URL and not bundled.

### Reduced motion: the contract carries over, now with a layout-stability clause

`RsvpForm` calls `useReducedMotion()` from `framer-motion` — the same call `InviteHero.tsx` and
`EventDetails.tsx` already make. With the success state on the page rather than in a modal, the
contract applies in `RsvpForm`, and `ModalForm` needs no motion handling of its own beyond
`Dialog`'s stock open/close behavior.

- **The button's scroll reveal** (Element 1) uses the established
  `initial={reduceMotion ? false : 'hidden'}` guard, identical to `EventDetails`.
- **The button → success-state swap** is triggered by an interaction, not by scroll, so it uses
  `initial`/`animate` — _not_ `whileInView`. Same guard: `initial={reduceMotion ? false : 'hidden'}`
  with `animate="visible"`, so a reduced-motion guest sees the feedback text simply be there.
- **The confetti does not autoplay under `prefers-reduced-motion: reduce`.** When `reduceMotion` is
  `true`, the Lottie player is not rendered at all. A multi-second autoplaying animation is precisely
  what the preference asks a page to avoid, and this project's contract has never carved out an
  exception for a particular animation technology. The feedback text renders in both cases — only the
  confetti is conditional. Note this is the *second* gate on the confetti and they are independent:
  `justConfirmed` decides whether this is a celebration at all, `reduceMotion` decides whether a
  celebration may animate.
- **The section's reserved `min-h-48 sm:min-h-64` applies in every motion mode and on every path**,
  fresh or restored. A reduced-motion guest is asking for no motion, and an un-reserved box would
  hand them a layout jump on confirm — motion by another name.

### `Dialog`'s own base behavior is otherwise untouched

No customization of shadcn's default `Dialog` overlay/focus-trap/escape-to-close behavior is
requested — `dev` uses the CLI-generated `dialog.tsx` as-is for those mechanics, applying only the
content-level decisions above (panel class, the single footer button, `showCloseButton={false}`).
Those stock mechanics are load-bearing now rather than incidental: with no dismissal control in the
panel, escape-to-close and overlay-click-to-close are the guest's only way out, so neither may be
disabled.

## Risks / Trade-offs

- **[Trade-off]** The modal has no visible dismissal control, so a guest who opened it only to look
  has to know that Escape or a tap outside closes it — and on a phone only the second exists.
  Accepted by the user in the third pass; the full reasoning, including the mobile-first concern that
  originally argued for a footer dismissal button, is recorded under "No visible dismissal control,
  and what it costs". → **Mitigation if it proves wrong in testing**: one `DialogClose`-wrapped
  `Button` in `DialogFooter` plus one copy placeholder restores it.
- **[Trade-off]** Confirming is irreversible from the guest's side, and the two decisions compound:
  the confirmation is written to `localStorage` and so survives a reload, the confirmation button is
  replaced rather than demoted, and the modal offers no dismissal control to back out of in the first
  place. A mistaken tap on "Confirmar" has no in-page undo. Accepted: nothing is recorded anywhere but
  the guest's own browser, so there is nothing to undo, and an explicit "undo" control under the
  celebration would invite double-confirmation once the real submission exists. Revisit with the real
  form, where an "edit my RSVP" path is a genuine requirement. The manual escape hatch, if the user
  ever needs one during testing, is clearing site data.
- **[Trade-off]** Persistence is per-browser, so the same guest gets a different answer on a
  different device, and an in-app browser (WhatsApp, Instagram) may be a different storage context
  from the same phone's default browser. Accepted because no authoritative record exists to disagree
  with; flagged in "Persisting the confirmation" as something the real Supabase change must revisit,
  not inherit.
- **[Risk]** A stale flag outlives its meaning: if the real RSVP form lands and a guest's actual
  record is later removed or was never created, their browser still says confirmed and the invite
  would hide the form from the one person who needs it. → **Mitigation**: recorded as an explicit
  hand-off above — once the `rsvp` table is the source of truth, the table wins and this flag is
  downgraded to a fast-path or deleted. Keeping the stored shape to one dumb string makes that
  deletion trivial.
- **[Trade-off]** `{user_name}` renders literally to real guests for as long as this state ships.
  Accepted by the user as a staged placeholder; called out here and in the spec so QA does not file
  it and the future form change knows it owns the resolution.
- **[Trade-off]** The confetti is scoped to `RsvpForm`'s section rather than the viewport, so the
  burst is smaller than a full-page overlay would be. Accepted in exchange for no portal, no
  page-level state, no z-index contention, and no second dismissable surface right after the modal
  was removed. `preserveAspectRatio: 'slice'` plus the reserved section height recover most of the
  scale.
- **[Risk]** Reserving `min-h-48 sm:min-h-64` is a guess at a box that fits all three states; if the
  final copy for the confirm button or the feedback text runs long on a narrow phone, the reserved
  height may be short and the jump returns. → **Mitigation**: QA checks every state at 320px width
  after the copy writer's strings land, and the value is a single class to adjust.
- **[Risk]** Moving focus to the success region is an unusual pattern and can be implemented wrong —
  stealing focus on every render, or worse, stealing it on page load for a returning guest who never
  interacted. → **Mitigation**: it is gated on `justConfirmed` and fires once; QA verifies both with
  the keyboard, including that a restored visit does not move focus.

## Open Questions

_None._ All questions from the previous passes are resolved: the success state plays on the page with
the modal closed; `lottie-react` is confirmed as the player library; the confirmation button receives
the `whileInView` reveal; the confirmation persists in `localStorage` under
`digital-invite:rsvp-confirmed`; the confetti is gated to fresh confirmations only; and the modal
ships with no visible dismissal control, which also settles the corner control's English `sr-only`
label by suppressing the control entirely.

One item is deliberately deferred rather than open: the `{user_name}` token and the browser-local
flag's relationship to a real RSVP record both belong to the future change that adds the form fields
and the Supabase insert.
