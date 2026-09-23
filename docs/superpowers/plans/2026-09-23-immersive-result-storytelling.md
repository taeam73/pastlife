# Immersive Result Storytelling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make basic, deep, and present-guide results read as one believable life record with direct language, six deterministic choice-outcome structures, concrete occupation explanations, and a story-led character introduction.

**Architecture:** Add small narrative catalogs for occupation descriptions and choice-outcome variants instead of expanding the main story builder further. Select one of six outcome structures from stable result identifiers so reopening the same result never changes it. Expose a composed character introduction through the existing result contract and let all three narrative views reuse the same `StoryProfile` facts.

**Tech Stack:** TypeScript, NestJS, Zod, React Native, Vitest.

## Global Constraints

- Preserve the current result-screen layout and image behavior.
- Use easy, direct Korean without reducing every paragraph to short fragments.
- Every choice context provides exactly six deterministic outcome structures.
- The same result input always produces the same prose.
- Occupation copy states duties, tools, beneficiaries, daily work, and responsibility directly.
- Character introduction includes appearance, manner, temperament, taste, favorite place, food, talent, and dream as connected prose.
- Remove the visible creation disclaimer and do not add a new factual-certainty claim.
- Basic, deep, and guide narratives use the same name, relationship, decisive event, wounds, and legacy.

---

### Task 1: Six choice-outcome structures

**Files:**
- Create: `apps/api/src/providers/choice-outcome-catalog.ts`
- Modify: `apps/api/src/providers/story-narrative.ts`
- Test: `apps/api/test/choice-outcome-catalog.spec.ts`

**Interfaces:**
- Consumes: stable `ResultCore` identifiers and concrete event facts.
- Produces: `selectChoiceOutcome(core, facts): string` and `choiceOutcomeVariantCount(): number`.

- [ ] Add a failing test requiring six structures, deterministic output, and variation across seeds.
- [ ] Implement direct, relationship, community, time-later, personal-change, and legacy structures.
- [ ] Replace the single basic-story outcome paragraph with the selected structure.
- [ ] Run focused tests and require all assertions to pass.

### Task 2: Direct occupation and character introductions

**Files:**
- Create: `apps/api/src/providers/occupation-narrative.ts`
- Modify: `packages/contracts/src/result.ts`
- Modify: `apps/api/src/results/results.service.ts`
- Modify: `apps/api/src/providers/story-narrative.ts`
- Modify: `apps/mobile/src/components/ResultExperience.tsx`
- Test: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Produces: `describeOccupation(core)` and `buildCharacterIntroduction(profile, occupationDescription)`.

- [ ] Add tests requiring duties, tools, users, responsibility, appearance, temperament, taste, and dream.
- [ ] Build occupation descriptions from the selected setting and occupation catalog.
- [ ] Add `introduction` and `occupationDescription` to the character response.
- [ ] Render connected prose instead of disconnected profile labels.
- [ ] Run API and mobile typechecks.

### Task 3: One continuous life across result types

**Files:**
- Modify: `apps/api/src/providers/extended-narratives.ts`
- Modify: `apps/api/src/providers/story-narrative.ts`
- Test: `apps/api/test/extended-narratives.spec.ts`

**Interfaces:**
- Consumes: one `StoryProfile` and the occupation description from Task 2.
- Produces: four deep chapters and four present-guide chapters that explicitly continue the same life.

- [ ] Add continuity assertions for name, occupation, decisive choice, relationship, and legacy.
- [ ] Rewrite deep prose with direct actions and clear consequences.
- [ ] Rewrite guide openings as present-day echoes of specific scenes from that life.
- [ ] Generate samples across all settings and reject malformed joins or unsupported internal numbers.

### Task 4: Remove visible disclaimer and verify

**Files:**
- Modify: `apps/api/src/results/results.service.ts`
- Modify: `apps/mobile/app/result.tsx`
- Modify: `apps/mobile/app/deep.tsx`
- Modify: `apps/mobile/app/present-guide.tsx`
- Modify: `apps/mobile/app/archive/[resultId].tsx`
- Test: `apps/api/test/vertical-flow.e2e.spec.ts`

**Interfaces:**
- Produces: empty compatibility `disclaimer` values that are not rendered by clients.

- [ ] Remove the visible disclaimer while keeping response compatibility.
- [ ] Update tests to reject the removed sentence.
- [ ] Run content, API, mobile, and E2E checks.
- [ ] Review generated samples before restarting the local API.
