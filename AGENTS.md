# AGENTS.md

Active project: **digital-invite** at `/home/arthur/Coding/muri-birthday/digital-invite` (the git
repo; `/home/arthur` itself is not a repo). It is an interactive digital invitation for a 50th
birthday party (27/09/2026) with two fronts: a public invite + RSVP page at `/` and a
login-protected admin dashboard at `/admin`. React 19 + TypeScript 6 (strict) on Vite 8, Tailwind
v4, shadcn/ui (Radix "radix-nova" preset), React Router v7, React Hook Form + Zod, Framer Motion,
Supabase (Postgres + Auth) called directly from the browser. There is no backend — data safety
comes from Postgres Row Level Security.

## Dev environment

Package manager is **Yarn** (`yarn.lock`; no npm/pnpm lockfile).

```bash
yarn install
cp .env.example .env.local   # fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
yarn dev                     # Vite dev server
```

Both env vars are typed in `src/env.d.ts` and read in `src/lib/supabaseClient.ts`; without them the
client is constructed with `undefined` and every Supabase call fails. The anon key is public by
design — never put a `service_role` key in this repo.

## Build & test

```bash
yarn typecheck     # tsc -b --noEmit
yarn lint          # eslint . --ext ts,tsx
yarn lint:fix
yarn format        # prettier --write .
yarn format:check
yarn build         # tsc -b && vite build
yarn preview       # serve the production build
```

E2E tests use **Cypress** against a **local Supabase stack** (Supabase CLI + Docker). There is no
unit test framework — no vitest/jest. Don't invent a `yarn test`.

```bash
yarn db:start      # supabase start: local Postgres + Auth, applies supabase/migrations + seed.sql
yarn db:reset      # reapply migrations and seed
yarn db:stop
yarn e2e           # build with .env.test, serve on :4173, cypress run
yarn e2e:open      # same, interactive runner
```

Specs live in `cypress/e2e/*.cy.ts` with their own `cypress/tsconfig.json`. The seeded admin is
`e2e-admin` / `e2e-admin-password` (`supabase/seed.sql`). CI runs the same flow in
`.github/workflows/e2e.yml`. Verification = `yarn lint && yarn typecheck && yarn build`, plus
`yarn e2e` when tests are touched.

The `qa` agent (`.agents/agents/qa.md`) writes test cases (`cypress/cases/*.md` scenarios and
`cypress/e2e/*.cy.ts` specs), runs these checks, and writes failure reports to `qa-reports/`
(git-ignored). The pipeline is: run QA → run the tests → on failure, write the report → failures
caused by the test implementation are resolved by `qa` → the rest go to the `dev` agent, which
writes a correction plan and then implements it. Subagents cannot call each other, so the main
session passes the report path from `qa` to `dev`.

## Layout

```
src/main.tsx, src/App.tsx        entry + RouterProvider
src/routes/router.tsx            createBrowserRouter route table
src/routes/ProtectedRoute.tsx    admin session guard
src/pages/                       InvitePage, AdminLoginPage, AdminDashboardPage
src/components/{invite,admin,layout}/
src/components/ui/               shadcn CLI output — do NOT hand-edit (eslint- and prettier-ignored)
src/hooks/                       useSession, useRsvpList
src/lib/supabaseClient.ts, src/lib/utils.ts (re-exports `cn`), src/lib/schemas/rsvpSchema.ts
src/styles/globals.css           CSS vars, font stacks, .carved-1/2/3 utilities, `@config` → tailwind.config.ts
```

## Agent rules

Read `.agents/rules/*.md` before making changes: git commands that change state and `yarn dev`
need authorization first; `any` is forbidden (`unknown` is fine); explicit casting (`as`) is a
last resort; comments should be rare; ESLint's existing config is not to be worked around.

## Conventions

- **Code is English, UI text and docs are Portuguese.** Zod messages, labels, copy → pt-BR;
  identifiers, filenames, comments → English. Supabase columns are Portuguese
  (`nome`, `email`, `numero_pessoas`); the mapping lives only in `src/lib/schemas/rsvpSchema.ts`.
- Components/pages: `PascalCase.tsx`, **named** exports (`export function InvitePage()`), no default
  exports. Hooks: `useThing.ts`. Props typed with a local `interface XProps`.
- Imports use the `@/` alias (configured in both `vite.config.ts` and `tsconfig.app.json`), not
  relative `../..` paths. Inline type imports: `import { type ReactNode } from 'react'`.
- Prettier: semicolons, single quotes, trailing commas, printWidth 100, 2 spaces.
- No comment explains what code already says through naming — see `.agents/rules/`. Reserve a
  comment for a genuinely non-obvious _why_.
- ESLint is type-aware and strict: `no-explicit-any`, `no-unused-vars`, `camelcase`,
  `id-length` min 3 (exceptions `id, to, db, fn, on`), `complexity` max 8, `max-depth` 3,
  `max-lines-per-function` 60, `max-params` 3, `eqeqeq`, `no-else-return`, `prefer-const`,
  `react-hooks/exhaustive-deps: error`. Write small functions or lint fails.
- Design rules (from README): shadows are hatching only — no gradients, soft drop shadows, glow, or
  transparency; thick, irregular strokes. Tokens: `carved-black #1C1410`, `bone-white #F4EEDD`,
  `sertao-brown #6B4226`; families `font-title` (Xilosa) and `font-body` (Caveat).

## Pitfalls

- Project is at the **setup** stage: most components, `useSession`, `useRsvpList`, and `RsvpForm`
  are deliberate stubs. `ProtectedRoute` intentionally does **not** redirect yet — adding
  `<Navigate>` before `useSession` is real would lock `/admin` for everyone.
- The Xilosa title font has not been delivered; `globals.css` has a `TODO` with the `@font-face`
  snippet and falls back to a generic serif. Don't "fix" it with a substitute font.
- Tailwind v4 has no `content` array — the theme extension in `tailwind.config.ts` is picked up via
  the `@config` directive inside `src/styles/globals.css`. Edit tokens in both places as documented
  there.
- `dist/` is committed-looking build output; regenerate with `yarn build`, never hand-edit.
- Add shadcn components with the CLI (`shadcn`, devDependency) so they land in
  `src/components/ui/`; that directory is excluded from lint and format on purpose.
