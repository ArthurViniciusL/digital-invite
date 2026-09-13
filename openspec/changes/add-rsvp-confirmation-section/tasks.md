## 1. Prerequisites

- [x] 1.1 Add shadcn's `Dialog` primitive via the shadcn CLI (`shadcn` devDependency already
      installed) so it lands in `src/components/ui/dialog.tsx`, and verify it imports cleanly (this
      is the first use of `Dialog` anywhere in the codebase)
- [x] 1.2 Add `lottie-react` as a new dependency (`yarn add lottie-react`) and verify a minimal
      import renders with no console error
- [x] 1.3 Confirm `public/assets/images/confetti.json` is reachable at `/assets/images/confetti.json`
      in a dev build (no 404) before wiring it into `RsvpForm`
- [x] 1.4 Check whether the generated `dialog.tsx` exposes a `showCloseButton` prop on
      `DialogContent` — it does, and task 3.5 passes `showCloseButton={false}`. That also suppresses
      the corner control's English `sr-only` "Close" label, so the pt-BR UI-text gap needs no
      follow-up and `src/components/ui/` stays unedited (`AGENTS.md`)

## 2. Confirmation button (`RsvpForm.tsx`)

- [x] 2.1 Replace the stub in `src/pages/InvitePage/partials/RsvpForm.tsx` with a `relative`,
      centered section carrying `overflow-x-clip` and the reserved `min-h-48 sm:min-h-64` box from
      design.md's Element 3, so every state occupies the same height
- [x] 2.2 Render one `Button` (`variant="xilo"`) inside it, labelled with the
      `{{copy: rsvp_confirm_button_label}}` placeholder from design.md — the change's only copy
      placeholder
- [x] 2.3 Wrap the button in a `motion.div` carrying `EventDetails`-style reveal variants
      (`y: 12`/`opacity: 0` → `y: 0`/`opacity: 1`, `duration: 0.4`, `ease: 'easeOut'`, **no delay**),
      with `initial={reduceMotion ? false : 'hidden'}`, `whileInView="visible"`,
      `viewport={{ once: true }}` — per design.md's Element 1 decision
- [x] 2.4 Own `isModalOpen` in `RsvpForm` (passed to `ModalForm` as `open`/`onOpenChange`); verify
      activating the button opens the modal with no navigation and no network request

## 3. `ModalForm` content

- [x] 3.1 Create `src/pages/InvitePage/partials/ModalForm.tsx` as a presentational component taking
      `open`, `onOpenChange` and `onConfirm` props and holding no state of its own, built on shadcn's
      `Dialog` primitives
- [x] 3.2 Give `DialogContent` the `.carved-1` utility plus the `border-4 border-carved-black
  bg-bone-white` treatment established by `InviteHero`/`EventDetails`'s panels
- [x] 3.3 Render the fixed title "Cadastro do convidado" via `DialogTitle` (`font-title`) and the
      fixed body content "Em breve!" (`font-body`)
- [x] 3.4 Render a "Confirmar" `Button` (`variant="xilo"`, fixed label, not a placeholder) wired to
      `onConfirm`, and verify the modal renders identically regardless of route params, query string,
      or any guest-identifying state
- [x] 3.5 Render **no dismissal control**: pass `showCloseButton={false}` to `DialogContent` and leave
      `DialogFooter` holding "Confirmar" alone, per design.md's "No visible dismissal control, and
      what it costs". Backing out is Escape or a tap on the overlay — stock `Dialog` behavior, wired
      only through `onOpenChange`, and neither may be disabled

## 4. Confetti and feedback success state (on the page, in `RsvpForm`)

- [x] 4.1 Implement `onConfirm` so it sets the confirmed state and closes the modal in the same
      handler — the success state mounts in the same render, with no `setTimeout` or
      completion-callback orchestration, and with no programmatic scroll
- [x] 4.2 Render, when the guest is confirmed, the success state **in place of** the confirmation
      button inside the same section box; the button is not rendered again
- [x] 4.3 Render the Lottie player (`lottie-react`) playing `/assets/images/confetti.json` by its
      public URL, `loop={false}`, inside a `pointer-events-none absolute inset-0` wrapper marked
      `aria-hidden="true"`, with `rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}`
- [x] 4.4 Render the fixed feedback text "Tá confirmado {user_name}!" (`font-body`,
      `text-carved-black`, `text-2xl sm:text-3xl`, `relative z-10`) above the confetti layer, inside a
      region carrying `role="status"`; the `{user_name}` token is rendered **literally** — it is a
      staged placeholder for the future RSVP form, not an interpolation (design.md, "The feedback text
      and its `{user_name}` token")
- [x] 4.5 Move focus to the success region on a fresh confirmation (`tabIndex={-1}` plus a one-time
      `.focus()`), since Radix returns focus to the dialog trigger that has just been unmounted;
      verify with the keyboard that focus does not fall to `<body>` and that focus is not stolen on
      later renders
- [x] 4.6 Verify the confetti plays exactly once and does not restart, and that the feedback text is
      still visible after it finishes
- [ ] 4.7 Verify that on a fresh confirmation the section's height is unchanged and the surrounding
      page content does not move (superseded reload behavior now lives in section 7)
- [x] 4.8 Verify activating "Confirmar" any number of times makes no network request and creates no
      RSVP record — no `rsvpSchema` import, no Supabase call exists anywhere in `RsvpForm.tsx` or
      `ModalForm.tsx`; the `localStorage` flag from section 7 is the only thing written, and it is not
      an RSVP record

## 5. Reduced motion

- [x] 5.1 Call `useReducedMotion()` from `framer-motion` inside `RsvpForm` (same import
      `InviteHero.tsx`/`EventDetails.tsx` already use) and gate both the button's scroll reveal
      (task 2.3) and the button → success-state swap with the established
      `initial={reduceMotion ? false : 'hidden'}` pattern; the swap uses `animate="visible"`, not
      `whileInView`, because it is interaction-triggered rather than scroll-triggered
- [x] 5.2 Do not render the Lottie player at all when `reduceMotion` is `true`, while still rendering
      the feedback text immediately
- [ ] 5.3 Verify manually (toggling the OS/browser reduced-motion setting) that a reduced-motion
      guest sees the feedback text appear with no animated transition and no confetti, and that a
      default-motion guest sees the confetti play once (not looping)
- [ ] 5.4 Verify in both motion modes, and at 320px viewport width, that confirming does not shift
      the surrounding page content — the reserved section height from task 2.1 absorbs the swap

## 6. Integration and verification

- [x] 6.1 Compose `RsvpForm` into `src/pages/InvitePage/index.tsx` as the third section, after
      `<EventDetails />`, resolving the remaining `RsvpForm` half of the existing TODO comment
- [ ] 6.2 Run `yarn lint && yarn typecheck && yarn build` and verify all three succeed with no new
      warnings introduced by `RsvpForm.tsx`, `ModalForm.tsx`, `InvitePage/index.tsx`, or the
      CLI-generated `dialog.tsx` (excluded from lint/format per `AGENTS.md`, but must still typecheck
      and build cleanly)

## 7. Persisting the confirmation in the guest's browser

- [x] 7.1 Declare the storage key once as a module-level constant in `RsvpForm.tsx` —
      `const RSVP_CONFIRMED_STORAGE_KEY = 'digital-invite:rsvp-confirmed'` — and do not repeat the
      literal at the read or write site
- [x] 7.2 Add a `readConfirmedFlag()` helper that returns `true` **only** when
      `localStorage.getItem(RSVP_CONFIRMED_STORAGE_KEY)` is exactly the string `'true'`, and `false`
      for a missing, empty, or any other value — no `JSON.parse`, no schema
- [x] 7.3 Wrap that read in `try`/`catch` returning `false` on any throw (storage disabled, private
      mode, embedded webview), so a storage failure can never escape into React's render path or blank
      the page
- [x] 7.4 Initialize `hasConfirmed` with a **lazy** `useState` initializer —
      `useState(() => readConfirmedFlag())`, not `useState(readConfirmedFlag())` and **not** a
      `useEffect` — so a returning guest's first paint already shows the feedback text and the
      confirmation button never flashes
- [x] 7.5 Add a `writeConfirmedFlag()` helper that sets the key to `'true'`, wrapped in `try`/`catch`
      that swallows any throw, and call it from `onConfirm`; a failed write must still leave the
      modal closed, the confetti playing and the feedback text visible for the current session
- [x] 7.6 Keep both helpers as small named module-level functions so `RsvpForm` stays within ESLint's
      `complexity` (max 8) and `max-lines-per-function` (60) limits, with no `any` and no `as` cast on
      the storage value (`getItem` already returns `string | null`)
- [ ] 7.7 Verify a guest who confirms and then reloads `/` sees the feedback text from the first
      paint, with the confirmation button never rendered during the load
- [ ] 7.8 Verify a stored value that is not exactly `'true'` (e.g. set `"1"` or `"{}"` by hand in
      devtools) yields the default state with the confirmation button and no error
- [ ] 7.9 Verify with storage blocked (browser site-data setting, or a devtools override that makes
      `localStorage` throw) that the page loads normally with the confirmation button, that confirming
      still closes the modal and plays the celebration, and that no error reaches the guest
- [ ] 7.10 Verify that opening `/` in a different browser or device after confirming shows the
      confirmation button again — expected, documented per-device behavior, not a defect

## 8. Fresh confirmation vs. returning guest

- [x] 8.1 Add a separate `justConfirmed` state, `useState(false)`, set to `true` only inside
      `onConfirm` — deliberately **not** derived from `hasConfirmed`, which is true on both paths
- [x] 8.2 Gate the confetti layer on `justConfirmed && !reduceMotion` so a restored visit mounts no
      Lottie node at all — not a hidden one, not a paused one
- [x] 8.3 Gate the one-time focus move (task 4.5) on `justConfirmed` too, so a returning guest is
      never yanked to the bottom of the page on load
- [x] 8.4 Skip the success state's entry animation on the restored path (`initial={false}`), since
      nothing was revealed — the text was there from the start
- [ ] 8.5 Verify a fresh confirmation plays the confetti once alongside the feedback text
- [ ] 8.6 Verify a returning guest sees the feedback text with **no confetti** — confirm in devtools
      that no request for `/assets/images/confetti.json` is made on that load
- [ ] 8.7 Verify the reserved section height holds on the restored path too, at 320px width
