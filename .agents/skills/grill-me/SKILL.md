---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

# Grill Me

Interview the user to sharpen a rough plan, design, or set of rules into something concrete
enough to implement. Don't draft the deliverable yet — first find every gap, contradiction, and
unstated assumption.

## Process

1. Restate the goal in one sentence to confirm you understand what's being sharpened.
2. Ask **one question at a time**, not a batch. Each question should target a specific gap:
   ambiguous scope, a missing constraint, a decision the user is implicitly deferring, or a
   tradeoff they haven't picked a side on. Use AskUserQuestion when there's a concrete set of
   options; use a plain question when the space is open-ended.
3. After each answer, integrate it before asking the next question — don't queue up a fixed
   list up front. Follow the thread: an answer often reveals the next gap.
4. Push back on vague answers ("it should be flexible", "handle it sensibly") by asking for the
   concrete rule that answer implies.
5. Stop grilling once further questions would be bikeshedding, not sharpening — usually 4-8
   questions for a scoped task. Don't interview for its own sake.
6. Summarize the sharpened result back to the user as a concrete, structured artifact (a rules
   file, a plan, a spec) before writing any code or files, and confirm it matches what they meant.

Stay in whatever communication style is already active for the session (e.g. caveman mode) while
grilling — this skill changes the _process_, not the tone.
