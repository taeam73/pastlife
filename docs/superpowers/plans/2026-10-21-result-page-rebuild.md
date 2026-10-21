# Result Page Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the result page around a dedicated full-viewport hero and centered content sections so the background, character, parchment overlay, chapters, and actions share predictable responsive boundaries.

**Architecture:** The result route uses a full-width page shell. `CinematicChapterPager` measures its rendered width and applies it to every page, while `ResultHero` fills its page. `ChapterFilmstrip`, result details, and route actions use centered content rails. Existing question, scoring, and result data contracts remain unchanged.

**Tech Stack:** React Native, Expo Router, React Native Web, TypeScript, Vitest.

## Global Constraints

- Preserve existing question and result evaluation logic.
- Keep mobile (0–767px), tablet (768–1199px), and desktop (1200px+) responsive behavior.
- Use `resizeMode="cover"` only inside a viewport-sized hero frame.
- Never mix the global logo mark with the title logo in the result hero.
- Validate typecheck and mobile tests after structural changes.

### Task 1: Establish result page layout boundaries

**Files:**
- Modify: `apps/mobile/app/result.tsx`
- Modify: `apps/mobile/src/components/Screen.tsx`
- Modify: `apps/mobile/src/components/ResultExperience.tsx`

- [x] Add a dedicated full-width result page root and centered content rails.
- [x] Keep the route-level actions inside a centered content rail.
- [x] Confirm existing result data props are passed unchanged.
- [x] Run typecheck and tests.

### Task 2: Extract the viewport-wide hero

**Files:**
- Create: `apps/mobile/src/components/ResultHero.tsx`
- Modify: `apps/mobile/src/components/CinematicChapterPager.tsx`

- [x] Move scene image, character layer, hero copy, and parchment overlay into `ResultHero`.
- [x] Measure the pager's actual width and apply it to every page; let the hero fill that page.
- [x] Render the parchment inside the hero with a bounded width and no horizontal overflow.
- [x] Remove viewport compensation through chained negative margins and mixed `100vw` widths.
- [x] Run typecheck and tests.

### Task 3: Rebuild the centered chapter section

**Files:**
- Modify: `apps/mobile/src/components/ResultExperience.tsx`
- Modify: `apps/mobile/src/components/ChapterFilmstrip.tsx`

- [x] Place the chapter heading, four cards, and timeline inside one centered rail.
- [x] Use the same rail width for cards and timeline.
- [x] Preserve chapter swipe and selection behavior.
- [x] Run typecheck and tests.

### Task 4: Responsive verification

**Files:**
- Modify: `docs/superpowers/plans/2026-10-21-result-page-rebuild.md`

- [x] Verify 320×844, 390×844, 686×844, 768×1024, 1024×1366, and 1440×900 layouts in a browser.
- [x] Check no horizontal overflow, no right-side background gap, no clipped parchment text, and centered chapter cards.
- [x] Verify selecting chapter 3 at 1440px and resizing to 686px keeps its scroll offset at exactly two page widths.
- [x] Run repository typecheck and tests; both passed on 2026-10-21. Leave commit and push for explicit user request.
