# Sections

General rules for every agent working in this repository, regardless of which task or subagent
is running. Unlike the rules under `.agents/skills/*/rules/`, these are not gated behind a skill
trigger — an agent is expected to know them before touching the repo. The section ID (in
parentheses) is the filename prefix used to group rules.

---

## 1. Tooling Authorization (tooling)

**Impact:** CRITICAL
**Description:** Commands that change repository state or start a long-running process must be
confirmed with the user first, even when the change is easy to undo.

## 2. Type Safety (types)

**Impact:** HIGH
**Description:** TypeScript is strict in this project. `any` defeats that; `unknown` and explicit
casting have narrow, legitimate uses that these rules define precisely.

## 3. Code Style (style)

**Impact:** MEDIUM
**Description:** Keep code self-documenting and let the existing ESLint configuration be the
single source of truth for style, instead of layering ad hoc conventions on top of it.
