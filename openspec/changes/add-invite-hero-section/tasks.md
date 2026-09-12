## 1. Prerequisites

- [x] 1.1 Bring `src/components/typograph/Title.tsx` into project convention (named export, no
      semicolons, single quotes) before or alongside reusing it in `InviteHero`, and verify
      `yarn lint` and `yarn format:check` pass on the file
- [x] 1.2 Confirm the four target assets referenced by design.md
      (`broom.svg`, `cactus_001.svg`, `cactus_003.svg`, `straw_hat_002.svg`, `sun.svg`,
      `flags.png`) load with no console 404 when referenced from `public/assets/images/`

## 2. Centerpiece and title line

- [x] 2.1 Implement the cordel title line (Element 1) above the centerpiece, wired to the
      `{{copy: hero_title}}` placeholder from design.md, styled per design.md (font-body,
      sertao-brown, centered) and verify it renders with placeholder text with no layout shift once
      real copy of a similar length is substituted
- [x] 2.2 Implement the "Muricarliton" + "50" centerpiece panel (Element 2): panel with `.carved-1`,
      "Muricarliton" in `font-title`, and the "50" medallion in `.carved-3` overlapping the panel's
      bottom-right corner, and verify the panel and medallion never share the same `.carved-*` class
      per `GUIDELINES.md` §5.3
- [x] 2.3 Verify "Muricarliton" and "50" render identically regardless of route params, query
      string, or any guest-identifying state (no per-guest branch exists in the component)

## 3. Subtitle

- [x] 3.1 Implement the one-line event subtitle (Element 3) beneath the centerpiece, wired to the
      `{{copy: hero_subtitle}}` placeholder, and verify it stays on one line at the project's
      supported breakpoints with placeholder text at the target length budget from design.md

## 4. Illustrated composition

- [x] 4.1 Place `flags.png` as top bunting spanning the section width, with alt text wired to the
      `{{copy: hero_illustration_alt}}` placeholder, and verify it renders with no missing-alt lint
      warning
- [x] 4.2 Place `sun.svg` behind/above the centerpiece panel per design.md's layout diagram
- [x] 4.3 Place `broom.svg` and `cactus_001.svg` flanking the centerpiece panel (left and right
      edges respectively) and verify both remain visible (not hidden) at the smallest supported
      breakpoint, per design.md's responsive-behavior decision
- [x] 4.4 Place `cactus_003.svg` and `straw_hat_002.svg` at the section base and verify
      `cactus_002.svg` and `straw_hat.svg` are intentionally not referenced in this component

## 5. Animation

- [x] 5.1 Implement the three-step Framer Motion load-in sequence (bunting settle → panel stamp-in
      → subtitle fade-up) from design.md, running once on mount, and verify the steps play in order
      with no overlap between step 1 and step 2
- [x] 5.2 Add a `prefers-reduced-motion` check that renders the hero's final state immediately with
      no animation, and verify it manually by toggling the OS/browser reduced-motion setting

## 6. Integration and verification

- [x] 6.1 Compose the completed `InviteHero` into `src/pages/InvitePage/index.tsx` in place of the
      current placeholder `Title` + "Invite Page — under construction" content
- [x] 6.2 Run `yarn lint && yarn typecheck && yarn build` and verify all three succeed with no new
      warnings introduced by `InviteHero.tsx` or `InvitePage/index.tsx`
