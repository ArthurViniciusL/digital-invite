---
title: Confirm Before State-Changing Git Commands
impact: CRITICAL
impactDescription: prevents unreviewed history/branch changes
tags: git, authorization, safety
---

## Confirm Before State-Changing Git Commands

Any git command that changes repository state — commits, pushes, or rewrites history or
branches — needs explicit user authorization before it runs. Read-only commands never need
authorization: run them freely to gather context.

**Needs authorization:** `git commit`, `git push`, `git checkout`, `git switch`, `git reset`,
`git rebase`, `git merge`, `git branch -D`, `git stash pop` (when it can conflict), `git clean`,
`git cherry-pick`, `git tag` (when pushed).

**Free to run, no authorization needed:** `git status`, `git diff`, `git log`, `git show`,
`git blame`, `git branch` (listing), `git stash list`.

**Incorrect (running a state change without asking):**

```bash
git add src/lib/schemas/rsvpSchema.ts
git commit -m "Fix RSVP schema validation"
```

**Correct (state the intent, wait for a yes):**

```
I'll commit the schema fix with message "Fix RSVP schema validation". OK to proceed?
```

then, only after the user confirms:

```bash
git add src/lib/schemas/rsvpSchema.ts
git commit -m "Fix RSVP schema validation"
```
