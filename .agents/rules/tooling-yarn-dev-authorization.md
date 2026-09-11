---
title: Confirm Before Starting yarn dev
impact: HIGH
impactDescription: avoids leaving an unrequested long-running process on the user's machine
tags: yarn, dev-server, authorization
---

## Confirm Before Starting yarn dev

`yarn dev` starts a long-running Vite dev server and needs explicit user authorization before it
runs. `yarn build`, `yarn lint`, and `yarn typecheck` are free to run without asking — they are
the project's standard verification cycle (`yarn lint && yarn typecheck && yarn build`, per
AGENTS.md) and terminate on their own.

**Needs authorization:** `yarn dev`.

**Free to run, no authorization needed:** `yarn build`, `yarn lint`, `yarn lint:fix`,
`yarn typecheck`, `yarn format`, `yarn format:check`, `yarn preview` (also a server, but only used
transiently to eyeball a build — ask if it is left running).

**Incorrect (starting the dev server unasked):**

```bash
yarn dev
```

**Correct (verify with the build pipeline, ask before starting a server):**

```bash
yarn lint && yarn typecheck && yarn build
```

```
Want me to start `yarn dev` to preview this in the browser?
```
