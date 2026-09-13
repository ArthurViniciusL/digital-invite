# Digital Invite — Muricarliton's 50th Birthday

Interactive digital invitation for **Muricarliton Antônio Figueredo da Silva**'s 50th birthday
party, on 09/27/2026, at 11:30 AM, at Alto da Serra Recepções, in Cuité.

The application has two fronts:

1. **Public invite page** (`/`) — event information and an RSVP form, open until 09/26/2026.
2. **Admin dashboard** (`/admin`) — login-protected area where the organizer tracks the
   confirmations received.

The visual identity follows the **"Cordel Arcade"** concept: Northeastern Brazilian woodcut
(carved outline, hatching, grainy texture) fused with a retro video game aesthetic, in a warm,
sober tone.

> **Code language:** all source code, including variable names, components, files, and comments,
> is written in English. Only the documentation and the text shown to the end user are in
> Portuguese.

## Stack

| Layer           | Technology                                          |
| --------------- | --------------------------------------------------- |
| Package manager | Yarn                                                |
| Build           | Vite 8                                              |
| Framework       | React 19 + TypeScript 6 (`strict`)                  |
| Styling         | Tailwind CSS v4 (official Vite plugin)              |
| Components      | shadcn/ui (Radix base, Nova preset)                 |
| Routing         | React Router v7                                     |
| Forms           | React Hook Form + Zod (`@hookform/resolvers`)       |
| Icons           | Lucide                                              |
| Animation       | Framer Motion                                       |
| Data and auth   | Supabase (Postgres + Auth), consumed in the browser |
| Quality         | ESLint (flat config, type-aware) + Prettier         |

There is no dedicated backend. Data security is guaranteed by Row Level Security on Supabase's
Postgres.

## Running locally

```bash
yarn install
```

```bash
cp .env.example .env.local
```

Fill in the two variables in `.env.local` with the values from the Supabase dashboard
(Project Settings → API):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The `anon key` is public by nature — the real data protection comes from the Postgres RLS
policies. The `service role` key must never appear on the client.

```bash
yarn dev
```

## Scripts

| Script              | What it does                             |
| ------------------- | ---------------------------------------- |
| `yarn dev`          | Development server                       |
| `yarn build`        | Project type-check and production build  |
| `yarn preview`      | Serves the production build locally      |
| `yarn lint`         | ESLint across the whole project          |
| `yarn lint:fix`     | ESLint with automatic fixes              |
| `yarn typecheck`    | Type-check only                          |
| `yarn format`       | Prettier across the whole project        |
| `yarn format:check` | Checks formatting without changing files |

## Design tokens

The tokens live in two complementary files:

- `src/styles/globals.css` — the palette's CSS variables, the typographic stacks, and the carved
  outline utility classes (`.carved-1`, `.carved-2`, `.carved-3`).
- `tailwind.config.ts` — the Tailwind theme extension (`colors`, `fontFamily`), which just points
  to those variables. The file is loaded via the `@config` directive at the top of `globals.css`.

The identifiers are in English and correspond to the Portuguese names in the design system:

| Token          | Design system | Value     |
| -------------- | ------------- | --------- |
| `carved-black` | Preto Entalhe | `#1C1410` |
| `bone-white`   | Branco Osso   | `#F4EEDD` |
| `sertao-brown` | Marrom Sertão | `#6B4226` |

The type families are available as `font-title` (Xilosa) and `font-body` (Caveat).

Visual rules that apply to every component built on this foundation: shadows are always hatching,
never a gradient or soft drop shadow; no glow, shine, or transparency; thick, slightly irregular
strokes, avoiding uniform radius.

## Known pending items

- **Xilosa font**: the files have not yet been delivered by the designer. The title stack falls
  back to a generic serif until the `@font-face` is added in `src/styles/globals.css` — there is a
  `TODO` in the file with the snippet ready to use. Caveat is already self-hosted via Fontsource.
- **Visual assets**: illustrations, iconography, and paper texture will be created from scratch by
  the designer within the "Cordel Arcade" style.
- **Palette**: the HEX values come from an earlier style guide and still need to be revalidated by
  the designer.

## Current project state

This is the **setup** stage. The folder structure, routing, and tokens are ready, and the
components exist as stubs marked with `TODO`. The following will still be implemented in later
stages:

- the functional RSVP form and the real insertion into Supabase;
- admin authentication (`supabase.auth.signInWithPassword`) and the `ProtectedRoute` redirect;
- the dashboard with the total-confirmations card and the RSVP table;
- the tables and policies in the Supabase dashboard;
- deployment on Vercel.
