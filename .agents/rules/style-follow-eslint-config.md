---
title: Follow the Existing ESLint Config — Don't Work Around It
impact: MEDIUM
impactDescription: keeps one source of truth for style instead of two
tags: eslint, lint, conventions
---

## Follow the Existing ESLint Config — Don't Work Around It

The project's ESLint config is already strict and type-aware: `no-explicit-any`, `no-unused-vars`,
`camelcase`, `id-length` (min 3, exceptions `id, to, db, fn, on`), `complexity` max 8, `max-depth`
3, `max-lines-per-function` 60, `max-params` 3, `eqeqeq`, `no-else-return`, `prefer-const`,
`react-hooks/exhaustive-deps: error`. Treat a lint failure as a signal to restructure the code —
extract a function, shrink a parameter list, add the missing dependency — not as a signal to
suppress the rule. `yarn lint` must pass clean before work is considered done.

**Incorrect (silencing the rule instead of fixing the shape):**

```typescript
// eslint-disable-next-line complexity
function validateAndSubmitRsvp(values: RsvpFormValues) {
  // 12 branches crammed into one function
}
```

**Correct (split the function so it satisfies the rule on its own):**

```typescript
function validateRsvp(values: RsvpFormValues) {
  return rsvpSchema.safeParse(values)
}

function submitRsvp(values: RsvpFormValues) {
  return supabase.from('rsvp').insert(values)
}
```
