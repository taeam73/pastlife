# Result Screen Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the result screen header hierarchy and preserve a readable vertical story flow while evaluating, but not prematurely introducing, horizontal paging.

**Architecture:** Keep the global logo owned by `Screen`, add a result-specific header row for the record label, and refine `ResultExperience` spacing and action states without changing the result data model. The current content is narrative and variable-length, so detailed blocks remain vertically scrollable; horizontal paging is reserved for a future chapter-level reader if user testing supports it.

**Tech Stack:** Expo Router, React Native, TypeScript, existing theme tokens.

## Global Constraints

- Do not commit or push unless explicitly requested.
- Preserve existing result loading, sharing, archive, and navigation behavior.
- Keep disabled video actions visibly unavailable.

### Task 1: Result header hierarchy

**Files:**
- Modify: `apps/mobile/app/result.tsx`

- [ ] Add a header row below the global logo safe area; right-align the record label and reserve vertical space so it never overlaps the logo.
- [ ] Reduce headline size slightly and preserve a maximum two-line visual treatment through spacing and line height.
- [ ] Run mobile typecheck.

### Task 2: Result experience controls and spacing

**Files:**
- Modify: `apps/mobile/src/components/ResultExperience.tsx`

- [ ] Keep the text view as the primary selected mode.
- [ ] Make the disabled video mode lower contrast and clarify its unavailable state without changing behavior.
- [ ] Refine hero, story intro, and profile-card spacing while preserving existing content.
- [ ] Run mobile typecheck.

### Task 3: UX decision and verification

**Files:**
- No new files.

- [ ] Verify the result screen remains vertically scrollable and that all actions remain reachable.
- [ ] Keep vertical flow for now because the story blocks, highlights, profile facts, and variable text lengths are better suited to continuous reading than fixed-width pages.
- [ ] Record horizontal paging as a future option only for a chapter-focused reader with explicit next/previous affordances.
- [ ] Run `corepack pnpm --filter @pastlife/mobile typecheck`.
