# Direct Readable Result Prose Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve story diversity while rewriting visible result paragraphs into short, direct, causally connected Korean.

**Architecture:** Keep the large event catalog as selection data, but add stage-specific presentation functions that show only the problem, the character's response, and the meaningful result. Simplify all six choice-outcome structures and occupation explanations so unrelated randomly selected facts no longer appear together.

**Tech Stack:** TypeScript, Vitest, existing deterministic story catalogs.

## Global Constraints

- Preserve 24 childhood, 24 occupation, 32×12 turning, 16 relationship, 16 cost, and 16 aftermath candidate targets.
- Each visible event passage must follow `문제 → 직접 행동 → 이해하기 쉬운 결과`.
- Do not display an unrelated relationship reaction merely to increase sentence count.
- Prefer two or three connected sentences over five or more loosely related sentences.
- Keep exact-answer determinism and the six choice-outcome structures.

---

### Task 1: Readability regression tests

**Files:**
- Modify: `apps/api/test/story-narrative.spec.ts`
- Modify: `apps/api/test/choice-outcome-catalog.spec.ts`

**Interfaces:**
- Consumes: `buildStoryNarrative()` and `selectChoiceOutcome()`.
- Produces: limits on sentence count, duplicate facts, and disconnected stock phrases.

- [ ] Add assertions that work and turning passages omit unrelated reaction chains and repeated outcomes.
- [ ] Run focused tests and verify they fail before the prose rewrite.

### Task 2: Stage-specific concise presentation

**Files:**
- Modify: `apps/api/src/providers/story-narrative.ts`
- Modify: `apps/api/src/providers/choice-outcome-catalog.ts`
- Modify: `apps/api/src/providers/occupation-narrative.ts`

**Interfaces:**
- Produces: concise childhood, work, occupation, and turning passages using already-selected event facts.

- [ ] Reduce childhood presentation to event, action, and direct consequence.
- [ ] Reduce work presentation to problem, honest/direct action, and earned trust or concrete improvement.
- [ ] Rewrite six outcome structures to three causally connected sentences without duplicating later results.
- [ ] Reduce occupation description to duties, tools, and social responsibility.

### Task 3: Generated-sample and full regression review

**Files:**
- Modify only if sample review reveals concrete grammar defects.

**Interfaces:**
- Consumes: generated stories across multiple settings and answer hashes.
- Produces: verified readable stories and a restarted local API.

- [ ] Generate several complete stories and inspect work/turning passages.
- [ ] Run all API tests, typechecks, diversity checks, and `git diff --check`.
- [ ] Restart the API and verify ports 8081 and 4000.
