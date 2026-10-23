# Rewrite Existing Stories Implementation Plan

> **For agentic workers:** Execute inline in this shared workspace. The user requested uninterrupted continuation; do not dispatch subagents or stop for routine review choices. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace every currently selectable 3.0 result manuscript with the agreed 01~04 experience, preserving result selection and 2.5 history.

**Architecture:** Keep existing `StoryCard` IDs, scoring signals, and old prose fields for legacy extended/guide paths until those paths are migrated. Add a dedicated four-section manuscript per selectable card. The API maps those sections to the four presentation chapters; the mobile reader preserves episode paragraphs and timeline/memory line breaks. Audit all 33 manuscripts against the editorial standard before considering the rewrite complete.

**Tech Stack:** TypeScript content package, NestJS result builder, Zod contract, Expo React Native reader, Vitest, Playwright.

## Global Constraints

- Source standard: `docs/story-authoring-standard.md`; `docs/story-authoring-orr-pilot.md` is a reference, not a production-ready setting.
- Cover every ID in `storyCards`, including the rare nonhuman result. Exclude unpromoted candidates and version 2.5 results.
- 02 must read as a complete short story. Preserve the warm, consistent voice of 전생록 in the opening and closing.
- 03 covers birth to death across the whole life. 04 describes lifelong values, relationships, remembered speech, and surrounding opinions.
- Keep selected answer signals causally visible in the rendered 02 without breaking the story.
- Do not conflate AI self-review or automated checks with actual reader validation.
- Preserve the dirty shared worktree; do not reset, commit, push, or deploy.

---

### Task 1: Inventory and architecture

**Files:** `packages/content/src/story-catalog*.ts`, `apps/api/src/results/story-result.ts`, `packages/contracts/src/result.ts`, `apps/mobile/src/components/ParchmentReader.tsx`, `apps/mobile/src/results/paginate.ts`, `docs/story-authoring-standard.md`.

**Interfaces:** `storyCards` remains the selectable 3.0 ID list. Four-section manuscripts are keyed by existing `StoryCard.id`.

- [x] Record every selectable ID and its existing setting, genre, signal moments, and known continuity risks.
- [x] Add a manuscript type and completeness checks to the content package. Ensure no selectable ID silently uses the old split-story presentation once migration is complete.
- [x] Map the new four sections into the existing four-chapter presentation contract without changing 2.5 result handling.
- [x] Preserve intentional paragraph and list breaks through the mobile text pagination path.

### Task 2: Rewrite all selectable manuscripts

**Files:** New focused 3.0 manuscript modules under `packages/content/src/`, `docs/story-setting-register.md` for missing world/lifespan facts, and editorial review records under `docs/`.

**Interfaces:** Each manuscript supplies 01 identity, 02 episode, 03 chronology, and 04 memory items to the Task 1 presentation mapper.

- [x] Draft and independently review the original 12 stories, including Orr and the exceptional rock life.
- [x] Draft and independently review the 12 promoted group-2 stories.
- [x] Draft and independently review the 9 promoted group-3 stories.
- [x] Verify name, year, age, location, relationships, world rules, scene logic, speech register, answer-linked variation, and distinction from neighboring stories in every manuscript.

### Task 3: Integrate and verify

**Files:** `apps/api/src/results/story-result.ts`, `apps/api/test/content-reboot.e2e.spec.ts`, `packages/content/test/`, `apps/mobile/src/results/paginate.test.ts`, browser result tests and relevant docs.

**Interfaces:** The API still returns presentation version 3 and the same four chapter IDs; chapter titles and bodies become 01~04. Existing saved 2.5 results remain on their prior path.

- [x] Run content completeness and continuity checks over all selectable 3.0 IDs.
- [x] Run `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm content:check`, and `corepack pnpm test:e2e`.
- [x] Inspect mobile and tablet rendering of the longest episode, timeline, and memory page. Fix pagination or clipping found there.
- [x] Record the exact completed IDs, editorial findings, remaining reader-validation limits, and commands in `PROJECT_STATUS.md`.
