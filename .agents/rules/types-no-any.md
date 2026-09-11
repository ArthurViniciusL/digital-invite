---
title: Never Use any
impact: HIGH
impactDescription: preserves the value of strict TypeScript
tags: typescript, any, unknown, type-safety
---

## Never Use any

`any` disables type checking for every value it touches and silently propagates to everything
derived from it, which defeats the point of running TypeScript in strict mode. `unknown` stays
allowed: it forces a narrowing step before the value can be used, which is exactly what a value of
genuinely unknown shape should require.

**Incorrect:**

```typescript
function parseRsvp(payload: any) {
  return payload.name.trim()
}
```

**Correct:**

```typescript
function parseRsvp(payload: unknown) {
  if (typeof payload !== 'object' || payload === null || !('name' in payload)) {
    throw new Error('Invalid RSVP payload')
  }
  return String(payload.name).trim()
}
```

```typescript
try {
  await submitRsvp(values)
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  toast.error(message)
}
```
