# RSVP insert failures — test cases

Spec file: `cypress/e2e/rsvp-insert-failures.cy.ts`

Source for every case: `src/lib/api/rsvp.ts` (`23505` → `duplicate_email`, anything else → `unknown`) and `src/pages/InvitePage/partials/ModalForm.tsx` (sonner toast). No OpenSpec requirement covers these.

A toast is located by Sonner's `[data-sonner-toast]` item; the `Notifications` landmark around it has no height and never counts as visible.

## TC-FAIL-01 — Unique violation shows the duplicate e-mail toast

- Source: src/lib/api/rsvp.ts; ModalForm.tsx
- Priority: medium
- Preconditions: insert stubbed with 409 and body `code: "23505"`
- Given a valid form
- When the guest activates "Confirmar"
- Then a toast reads "Esse e-mail já confirmou presença.", the modal stays on "Convidado" with "Confirmar" enabled, the typed values remain, no success region exists and storage is untouched
- Status: automated

## TC-FAIL-02 — Server error shows the generic toast

- Source: src/lib/api/rsvp.ts; ModalForm.tsx
- Priority: medium
- Preconditions: insert stubbed with 500 and body `code: "XX000"`
- Given a valid form
- When the guest activates "Confirmar"
- Then a toast reads "Não deu pra confirmar agora. Tente de novo." and the rest matches TC-FAIL-01
- Status: automated

## TC-FAIL-03 — Network failure shows the generic toast

- Source: src/lib/api/rsvp.ts; ModalForm.tsx
- Priority: medium
- Preconditions: insert stubbed with `forceNetworkError`
- Given a valid form
- When the guest activates "Confirmar"
- Then a toast reads "Não deu pra confirmar agora. Tente de novo." and the rest matches TC-FAIL-01
- Status: automated

## TC-FAIL-04 — Real duplicate e-mail keeps one row

- Source: src/lib/api/rsvp.ts (`UNIQUE_VIOLATION_CODE`)
- Priority: medium
- Preconditions: local Supabase running with a unique constraint on `rsvp.email`
- Given a guest confirmed once, then localStorage was cleared and the page reloaded
- When the same guest submits the same e-mail again
- Then the duplicate e-mail toast is shown and the database still holds exactly one row for that e-mail
- Status: automated
