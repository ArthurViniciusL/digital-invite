## Why

The public invite page at `/` has a working section 1 (`InviteHero.tsx`) and section 2
(`EventDetails.tsx`), but section 3 — the block that lets a guest actually respond — is still the
stub `RsvpForm.tsx` ("RSVP form — under construction"), and `InvitePage/index.tsx` carries a TODO to
compose it. The real RSVP form (name/email/guest-count fields, Zod validation, the Supabase insert)
is deliberately staged as separate future work per `AGENTS.md`'s "setup stage" note. This change
builds the section's shell instead: a confirmation button, a modal it opens, a confetti + feedback
moment on the page wired to a placeholder "Confirmar" action inside that modal, and a browser-local
memory of having confirmed — giving `dev` a buildable target now and a real form to drop into the
same modal later, without leaving `RsvpForm` an inert stub in the meantime.

## What Changes

- Replace the `RsvpForm.tsx` stub with a section containing one confirmation button (`xilo` Button
  variant) whose only behavior is opening a modal — no form fields, no `rsvpSchema` or Supabase
  wiring in this change.
- Add a new `ModalForm` component, colocated with `RsvpForm.tsx` under
  `src/pages/InvitePage/partials/` (the repo's actual partials layout, not `SYSTEM-DESIGN.md`'s
  original `src/components/invite/` suggestion — `InviteHero`/`EventDetails` already established the
  `partials/` convention and this change follows it, noting the divergence).
- Add shadcn's `Dialog` primitive via the shadcn CLI — the first component added to
  `src/components/ui/` since `button.tsx`, and the first consumer of `Dialog` in this codebase.
- `ModalForm` is presentational (`open`/`onOpenChange`/`onConfirm` props, no state of its own) and
  carries a fixed title ("Cadastro do convidado"), fixed body copy ("Em breve!") and a single
  "Confirmar" button (`xilo` variant, fixed label) in its footer. It renders **no visible dismissal
  control**: `DialogContent` is given `showCloseButton={false}`, so not even shadcn's corner `X`
  ships. Backing out remains possible through `Dialog`'s built-in affordances — the Escape key and a
  click or tap on the overlay outside the panel — they are simply not surfaced as a labelled control.
- Wire the modal's "Confirmar" button so that **it closes the modal** and the celebration plays on
  the invite page: a confetti animation (a Lottie player rendering
  `public/assets/images/confetti.json`) with the fixed feedback text "Tá confirmado {user_name}!",
  rendered inside `RsvpForm`'s own section in place of the confirmation button — not as a page-level
  overlay. The feedback text persists and the confirmation button does not return.
- **Persist the confirmation in the guest's browser.** On confirm, `RsvpForm` writes the exact string
  `'true'` to `localStorage` under `digital-invite:rsvp-confirmed`, and reads it back in a lazy
  `useState` initializer so a returning guest sees the feedback text from the section's first paint
  rather than watching the confirmation button flash and get replaced. Any read or write failure —
  storage disabled, private mode, an in-app webview — degrades silently to the un-confirmed default
  and never breaks the page. Nothing is stored on any server: this is per-browser and per-device.
- **The confetti plays only on a fresh confirmation.** A guest whose success state was restored from
  storage gets the feedback text alone, with no Lottie player mounted at all — the confetti
  celebrates the act of confirming, not the state of being confirmed.
- Add a Lottie playback dependency (`lottie-react`) — no Lottie library exists in this project today.
- Apply the established `.carved-*` alternation rule (`GUIDELINES.md` §5.3) to the modal's own panel,
  and the established Framer Motion reduced-motion contract (`useReducedMotion`) to the confirmation
  button's scroll reveal, the success-state swap, and the confetti playback — plus a reserved section
  height so neither the swap nor a restored load shifts the page's layout.
- Give the confirmation button the same `whileInView` reveal treatment `EventDetails` uses (minus its
  stagger delay), so the page's last section doesn't read as the one that forgot to animate.
- Compose `RsvpForm` into `InvitePage/index.tsx`, resolving the remaining half of its existing TODO.
- Leave the confirmation button's label as the single copy placeholder for the copy writer agent;
  every other string in scope is fixed verbatim per the caller's instructions.

## Capabilities

### New Capabilities

- `rsvp-confirmation-section`: layout structure and content scope for the public invite page's third
  section — a confirmation button, a modal shell, a page-level confetti + feedback success state, and
  a browser-local record of having confirmed, with the real RSVP form fields staged as future work.

### Modified Capabilities

_None — `invite-hero-section` and `event-details-section` are untouched by this change; the three
sections compose independently inside `InvitePage`._

## Impact

- **Code**: `src/pages/InvitePage/partials/RsvpForm.tsx` (implementation target, replacing the
  existing stub, and the owner of the modal-open, confirmed and just-confirmed flags, the success
  state, and the two `localStorage` helpers), a new `src/pages/InvitePage/partials/ModalForm.tsx`, and
  `src/pages/InvitePage/index.tsx` (composes `RsvpForm`, resolving its TODO). Adds
  `src/components/ui/dialog.tsx` via the shadcn CLI (generated output, not hand-authored, excluded
  from lint/format per `AGENTS.md`).
- **Dependencies**: adds `lottie-react` (new — no Lottie library is installed today). No other new
  package.
- **Browser storage**: introduces this project's first use of `localStorage` — one key,
  `digital-invite:rsvp-confirmed`, holding the literal string `'true'`. Read and write are both
  wrapped so a throwing or disabled storage degrades to the un-confirmed default. No cookie, no
  `sessionStorage`, no URL state.
- **Assets**: reads the existing `public/assets/images/confetti.json` (Lottie/bodymovin export,
  already delivered). No new or modified `.svg`/`.png` asset is requested by this change.
- **Design tokens**: consumes existing `--color-carved-black`, `--color-bone-white`,
  `--color-sertao-brown`, `font-title`/`font-body`, and `.carved-1`/`.carved-3` from
  `src/styles/globals.css` — no new tokens introduced.
- **Content**: introduces exactly one copy placeholder for the copy writer agent — the confirmation
  button's label. Every other string in this change's scope ("Cadastro do convidado", "Em breve!",
  "Confirmar", "Tá confirmado {user_name}!") is fixed verbatim, supplied by the caller, not drafted
  here.
- **Known temporary state, not a defect**: the feedback text renders the literal token `{user_name}`,
  because this change collects no name. It is a staged placeholder resolved by the future change that
  adds the real RSVP form fields and the Supabase insert; that change owns substituting the collected
  name and deciding the fallback when none exists. QA verifies the token renders verbatim rather than
  filing it.
- **Accepted user decision — no visible dismissal control, and no undo.** The modal exposes no
  labelled way out, and the corner `X` is suppressed; a guest backs out with Escape or a tap on the
  overlay. Combined with the `localStorage` persistence, confirming is effectively irreversible from
  the guest's side — there is no in-modal dismissal and no undo after the fact, short of clearing
  site data. The user reviewed this and accepted it; the trade-off is recorded in design.md under
  "No visible dismissal control, and what it costs".
- **Previously logged as a gap, now resolved**: shadcn's default corner close control carries an
  English `sr-only` "Close" label, against the pt-BR UI rule. The generated `dialog.tsx` exposes
  `showCloseButton`, so the control is hidden and that label never reaches a guest. No follow-up is
  owed.
- **To revisit when the real RSVP insert lands**: the `localStorage` flag is per-browser and
  per-device, so a guest who confirms on a phone sees the button again on a laptop. Acceptable while
  no RSVP record exists; once the `rsvp` table is the source of truth, the table wins and this flag
  becomes at most a local fast-path — or is deleted.
- **Out of scope for this change**: `rsvpSchema.ts`, `react-hook-form` wiring, any Supabase insert
  call, the real form fields (name, email, guest count), any server-side or cross-device record of the
  confirmation, interpolating a real name into `{user_name}`, any new `.svg`/`.png` asset request,
  revalidating the pending color palette, and delivering the Xilosa font.
