---
title: No Redundant Comments — Let Code Read Itself
impact: MEDIUM
impactDescription: keeps comments from rotting alongside the code they describe
tags: comments, clean-code, readability
---

## No Redundant Comments — Let Code Read Itself

Name functions, variables, and modules declaratively enough that they don't need a comment
restating what they do. This supersedes any older convention requiring a JSDoc block at the top
of every module — that convention is retired in this project.

The one exception is a genuinely non-obvious _why_: a workaround for a specific bug, a hidden
constraint, or a business rule that the code alone can't convey. Write that comment only when
removing it would leave a future reader confused, and keep it to the why, never the what.

**Incorrect (comment restates the code):**

```typescript
// Loop through guests and count confirmed ones
function countConfirmed(guests: Guest[]) {
  return guests.filter((guest) => guest.status === 'confirmed').length
}
```

**Correct (the name already says it):**

```typescript
function countConfirmedGuests(guests: Guest[]) {
  return guests.filter((guest) => guest.status === 'confirmed').length
}
```

**Correct (comment earns its place — a non-obvious why):**

```typescript
// Supabase RLS rejects an empty `numero_pessoas` filter with a generic 400;
// send the literal `is.null` operator instead of omitting the clause.
const query = guestCount === null ? 'numero_pessoas.is.null' : `numero_pessoas.eq.${guestCount}`
```
