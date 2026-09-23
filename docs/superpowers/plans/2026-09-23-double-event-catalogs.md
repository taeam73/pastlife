# Double Event Catalogs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Double all user-facing life-event catalogs while making every displayed paragraph direct, coherent, and naturally centered on “당신은”.

**Architecture:** Extend the existing authored pattern arrays rather than multiplying sentence fragments. Each new childhood item owns its consequence, each new work item owns a concrete action, each new turning point owns a fitting decision, and each relationship type gains eight complete relationship episodes.

**Tech Stack:** TypeScript, Vitest, deterministic hash selection, existing content catalogs.

## Global Constraints

- Childhood event definitions: exactly 48.
- Work event definitions: exactly 48.
- Turning-point definitions: exactly 64, each retaining 12 scene variants.
- Relationship stories: exactly 16 per relationship type, 64 total.
- Internal work-event titles must not be displayed as `‘제목’ 사건을 겪었습니다`.
- Each visible action paragraph must naturally identify the character with `당신은` without repeating it in every sentence.
- Every added event must have a matching problem, action, and consequence or legacy.

---

### Task 1: Count and prose contract tests

**Files:**
- Modify: `apps/api/test/story-diversity-catalog.spec.ts`
- Modify: `apps/api/test/story-event-catalog.spec.ts`
- Modify: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Produces: exact count assertions and visible-copy assertions rejecting internal event-title syntax.

- [ ] Update count assertions to 48/48/64 and relationship counts to 16 per type.
- [ ] Add assertions that work paragraphs contain `당신은` and omit `사건을 겪었습니다`.
- [ ] Run focused tests and confirm count failures.

### Task 2: Childhood, work, and turning expansion

**Files:**
- Modify: `apps/api/src/providers/story-diversity-catalog.ts`

**Interfaces:**
- Produces: 24 additional childhood patterns with direct outcomes, 24 additional work patterns, and 32 additional turning types with fitting choices.

- [ ] Add typed pattern tuples so optional direct outcomes and choices are validated.
- [ ] Add all new authored patterns using plain Korean and active actions.
- [ ] Prefer each pattern's direct consequence/choice over generic fallback fragments.
- [ ] Run diversity distribution tests across 1,000 hashes and all settings.

### Task 3: Relationship story expansion

**Files:**
- Modify: `apps/api/src/providers/story-event-catalog.ts`

**Interfaces:**
- Produces: eight additional complete episodes for each of `REL_COMPANION`, `REL_FAMILY`, `REL_LOST_LOVE`, and `REL_STUDENT`.

- [ ] Add 32 complete episodes with setup, other action, and aftermath.
- [ ] Include the new pool in deterministic selection and count reporting.
- [ ] Run relationship catalog tests.

### Task 4: Direct subject-centered presentation

**Files:**
- Modify: `apps/api/src/providers/story-narrative.ts`
- Modify: `apps/api/src/providers/choice-outcome-catalog.ts`

**Interfaces:**
- Produces: visible paragraphs following `상황 → 당신은 행동 → 결과`.

- [ ] Add a helper that prefixes `당신은` only when the sentence has no explicit user subject.
- [ ] Remove internal work-event titles from visible prose.
- [ ] Apply subject-aware rendering to childhood, work, and turning decisions.
- [ ] Generate samples for all 48 work events and scan for awkward endings or disconnected outcomes.

### Task 5: Full verification and runtime

**Files:**
- Modify only for defects found by generated samples.

**Interfaces:**
- Produces: tested catalogs and restarted local API.

- [ ] Run all API tests, API/mobile typechecks, diversity checker, and `git diff --check`.
- [ ] Restart the API and verify localhost ports 8081 and 4000.
