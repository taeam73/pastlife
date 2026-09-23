# Fourfold Story Diversity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fixed childhood and turning-point scenes with historically grounded compositional catalogs meeting four-times the previously recommended diversity targets.

**Architecture:** Add one deterministic event composer that combines setting facts, occupation facts, answer-derived result dimensions, relationship reactions, costs, and aftermaths. The visible six-chapter narrative will consume these selected events directly; automated distribution tests will enforce candidate counts, determinism, grounding, and repetition limits.

**Tech Stack:** TypeScript, Vitest, pnpm workspace, existing `@pastlife/content` and `@pastlife/scoring` packages.

## Global Constraints

- Childhood events: at least 24 candidates per historical setting.
- Occupation events: at least 24 candidates per occupation.
- Turning-point event types: at least 32, with at least 12 variants per type.
- Relationship reactions: at least 16 per relationship type.
- Costs and aftermaths: at least 16 each.
- Exact answer sets remain deterministic; differing answer hashes must produce broad event variation.
- Visible prose must remain direct Korean and historically grounded in the selected setting and occupation.
- A single result must not reuse the same event theme across childhood, work, and turning point.

---

### Task 1: Diversity contract tests

**Files:**
- Create: `apps/api/test/story-diversity-catalog.spec.ts`

**Interfaces:**
- Consumes: `historicalSettings`, `historicalOccupations` from `@pastlife/content`.
- Produces: executable requirements for `storyDiversityCounts()` and `selectDiverseLifeEvents(core)`.

- [ ] **Step 1: Write failing tests for minimum counts, deterministic selection, historical grounding, and at least 20 distinct turning scenes over 200 answer hashes.**
- [ ] **Step 2: Run `node_modules\.bin\vitest.cmd run apps/api/test/story-diversity-catalog.spec.ts` and verify missing-module failure.**

### Task 2: Compositional event catalog

**Files:**
- Create: `apps/api/src/providers/story-diversity-catalog.ts`
- Test: `apps/api/test/story-diversity-catalog.spec.ts`

**Interfaces:**
- Produces: `storyDiversityCounts(): { childhoodPerSetting: number; workPerOccupation: number; turningTypes: number; variantsPerTurningType: number; relationshipPerType: number; costs: number; aftermaths: number }`.
- Produces: `selectDiverseLifeEvents(core: ResultCore): { childhood; work; turning }`, where every event contains `id`, `theme`, `title`, `setup`, `choice`, `cost`, and `consequence`.

- [ ] **Step 1: Define 24 childhood patterns, 24 work patterns, 32 turning types, 12 scene variants, 16 relationship actions, 16 costs, and 16 aftermaths.**
- [ ] **Step 2: Compose candidates with selected setting notes and occupation actions/objects rather than duplicating complete stories.**
- [ ] **Step 3: Use independent salted hashes and exclude already-used themes when selecting later life stages.**
- [ ] **Step 4: Run the focused test and verify all count and distribution assertions pass.**

### Task 3: Visible narrative integration

**Files:**
- Modify: `apps/api/src/providers/story-narrative.ts`
- Modify: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Consumes: `selectDiverseLifeEvents(core)`.
- Produces: six visible chapters whose childhood, work, and turning-point paragraphs use three distinct selected events.

- [ ] **Step 1: Add a regression test rejecting the globally fixed childhood sentence and requiring selected event IDs/content to vary across hashes.**
- [ ] **Step 2: Remove the fixed childhood distribution-list paragraph and location-only turning scene from visible prose.**
- [ ] **Step 3: Feed the selected turning event facts into the existing six choice-outcome sentence structures.**
- [ ] **Step 4: Run story and vertical-flow tests and update only assertions tied to intentionally removed fixed copy.**

### Task 4: Distribution and quality gate

**Files:**
- Create: `scripts/check-story-diversity.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `content:check` failure when catalog counts regress or generated samples contain repeated stage themes.

- [ ] **Step 1: Generate deterministic samples across settings, occupations, relationships, and 1,000 answer hashes.**
- [ ] **Step 2: Assert minimum catalog counts, no duplicate stage theme, no fixed distribution-list sentence, and no undefined/empty interpolation.**
- [ ] **Step 3: Add the checker to `pnpm content:check`.**
- [ ] **Step 4: Run full API tests, all typechecks, content checks, and `git diff --check`.**

### Task 5: Runtime verification

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: local API and Expo web runtime.
- Produces: running app with the new event selection active.

- [ ] **Step 1: Restart the API to clear in-memory results and load the new catalog.**
- [ ] **Step 2: Verify web and API HTTP status and create several distinct result samples.**
- [ ] **Step 3: Confirm repeated exact answers remain stable while changed answers vary the childhood, work, and turning event.**
