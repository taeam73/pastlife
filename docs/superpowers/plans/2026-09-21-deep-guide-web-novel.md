# Deep and Present Guide Web-Novel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four short static cards in the deep result and present-day guide with deterministic, personalized, multi-paragraph web-novel chapters comparable in reading volume and flow to the basic record.

**Architecture:** Add focused extended-narrative builders that consume the existing `ResultCore` and `StoryProfile`, then have `ResultsService` select the deep or guide builder after unlock validation. Keep the existing four-block API contract and reuse the current `ResultExperience` renderer so no response migration is needed.

**Tech Stack:** TypeScript, NestJS, Zod contracts, React Native/Expo, Vitest

## Global Constraints

- Deep and guide responses must each keep exactly four blocks to preserve `ExtendedResultResponseSchema`.
- Each block must read as connected prose with multiple paragraphs, not as a short advice card.
- Generated text must remain deterministic for the same result and must use the existing fictional `StoryProfile`.
- Present-day guidance must be framed as optional reflection, not as a factual personality diagnosis or prediction.
- Korean copy must be direct and readable for teens and people in their twenties.

---

### Task 1: Extended narrative builders

**Files:**
- Create: `apps/api/src/providers/extended-narratives.ts`
- Create: `apps/api/test/extended-narratives.spec.ts`

**Interfaces:**
- Consumes: `ResultCore`, `StoryProfile`, and canonical era/location/occupation/relationship labels.
- Produces: `buildDeepNarrative(core: ResultCore, profile: StoryProfile): NarrativeBlock[]` and `buildPresentGuideNarrative(core: ResultCore, profile: StoryProfile): NarrativeBlock[]`.

- [x] **Step 1: Write failing deterministic narrative tests**

Test that each builder returns four stable blocks, every block has at least three paragraphs, combined text is at least 1,200 Korean characters, deep prose contains the character name and major relationship, and guide prose contains concrete present-day scenes plus non-diagnostic language such as `해볼 수 있어요`.

- [x] **Step 2: Run the focused test and confirm it fails**

Run: `corepack pnpm --filter @pastlife/api exec vitest run test/extended-narratives.spec.ts`

Expected: FAIL because `extended-narratives.ts` does not exist.

- [x] **Step 3: Implement four deep-story chapters**

Create chapters for the hidden inner conflict, the relationship that changed the character, the price of the decisive choice, and what remained after the character's life. Build each chapter from multiple `StoryProfile` fields and keep one idea per sentence.

- [x] **Step 4: Implement four present-guide chapters**

Create web-novel-like modern scenes covering pace, relationships, work/talent, and the next choice. Connect each scene to the fictional story with conditional language and end with a small action the reader can try.

- [x] **Step 5: Run focused tests**

Run: `corepack pnpm --filter @pastlife/api exec vitest run test/extended-narratives.spec.ts`

Expected: PASS with two narrative-builder tests.

### Task 2: Serve personalized long-form content

**Files:**
- Modify: `apps/api/src/results/results.service.ts`
- Modify: `apps/api/test/vertical-flow.e2e.spec.ts`

**Interfaces:**
- Consumes: `buildDeepNarrative` and `buildPresentGuideNarrative` from Task 1.
- Produces: Existing `/api/v1/results/:id/deep` and `/api/v1/results/:id/guide` payloads with four long narrative blocks.

- [x] **Step 1: Strengthen vertical-flow assertions**

Assert that both extended responses contain four blocks, at least 1,200 combined characters, and at least three paragraphs per block. Update the disclaimer assertion to the current `창작 콘텐츠` wording.

- [x] **Step 2: Replace static template mapping**

Change `ResultsService.extended` to load or rebuild `StoryProfile`, call the correct builder for `DEEP` or `GUIDE`, and return those blocks while retaining unlock checks, image delivery, and disclaimer behavior.

- [x] **Step 3: Run API unit and end-to-end tests**

Run: `corepack pnpm --filter @pastlife/api test`

Run: `corepack pnpm --filter @pastlife/api test:e2e`

Expected: all API unit and vertical-flow tests pass.

### Task 3: UI copy and live verification

**Files:**
- Modify: `apps/mobile/app/deep.tsx`
- Modify: `apps/mobile/app/present-guide.tsx`

**Interfaces:**
- Consumes: Existing `ResultExperience` component and long-form extended result blocks.
- Produces: Screen introductions that describe four connected chapters instead of four short tips/cards.

- [x] **Step 1: Update screen introductions**

Describe deep content as four additional chapters and the guide as four present-day story chapters, while preserving the existing navigation and unlock actions.

- [x] **Step 2: Run all relevant type checks**

Run: `corepack pnpm --filter @pastlife/api typecheck`

Run: `corepack pnpm --filter @pastlife/mobile typecheck`

Expected: both commands exit successfully.

- [x] **Step 3: Restart the local API and verify live responses**

Restart the local in-memory API, complete unlock slots through the normal endpoints, and verify that `http://localhost:8081/` remains `200 OK` while deep and guide API responses satisfy the four-block and long-form length requirements.
