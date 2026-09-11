---
title: Avoid Explicit Casting Unless the Alternative Is Excessively Verbose
impact: MEDIUM
impactDescription: keeps type assertions from hiding real type errors
tags: typescript, casting, type-assertions, as
---

## Avoid Explicit Casting Unless the Alternative Is Excessively Verbose

An `as` assertion tells the compiler to trust you instead of checking, so a wrong assertion fails
silently at runtime instead of at compile time. Prefer narrowing (type guards, `zod` parsing,
discriminated unions) so the compiler keeps verifying the value. Reach for `as` only when writing
out the real type would be excessively verbose relative to the benefit — typically a one-off,
already-validated shape coming from a third-party response that has no generated types.

**Incorrect (asserting away a shape you could have narrowed):**

```typescript
const guestCount = (formValues as RsvpFormValues).guestCount
```

**Correct (narrow with the schema you already have):**

```typescript
const parsed = rsvpSchema.parse(formValues)
const guestCount = parsed.guestCount
```

**Acceptable (full typing would be disproportionate to one call site):**

```typescript
// Supabase's generated types don't cover this ad hoc RPC's return shape.
const { data } = await supabase.rpc('rsvp_summary')
const summary = data as { totalGuests: number; confirmed: number }
```
