# Coherent Result Narrative Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every result chapter easy to follow by keeping one central event per paragraph and connecting only consequences that arise from that event.

**Architecture:** Keep the existing deterministic catalogs, but stop combining unrelated childhood events, wounds, stress responses, and personality labels in one chapter. Introduce small prose helpers in the narrative provider, reshape the basic and deep narratives around event → action → result → lasting trait, and enforce the structure with regression and broad-sample tests.

**Tech Stack:** TypeScript, Vitest, pnpm workspace

## Global Constraints

- Preserve deterministic output for the same scored result.
- Preserve six basic chapters, four deep chapters, and existing result contracts.
- Use direct Korean sentences and avoid sentence fragments.
- Keep one central event per paragraph; move unrelated wounds or habits to their own chapter context.
- Do not reintroduce factual-certainty or immersion-breaking disclaimer text.

---

### Task 1: Lock the readable chapter structure with tests

**Files:**
- Modify: `apps/api/test/story-narrative.spec.ts`
- Modify: `apps/api/test/extended-narratives.spec.ts`

**Interfaces:**
- Consumes: `buildStoryNarrative(core)`, `buildDeepNarrative(core, profile)`
- Produces: Regression rules for event-focused childhood prose and complete Korean sentences.

- [x] Add assertions that the childhood chapter uses a direct heading and contains one event, its action, result, and resulting attitude without injecting `formativeWound` or `stressResponse`.
- [x] Add broad-sample assertions that narrative paragraphs do not contain noun fragments such as `경험.` or `두려움.` and do not use the former mechanical transition phrases.
- [x] Run the focused tests and confirm they fail before implementation.

### Task 2: Rebuild basic chapters around one event at a time

**Files:**
- Modify: `apps/api/src/providers/story-narrative.ts`
- Modify: `packages/content/src/catalogs.ts`

**Interfaces:**
- Consumes: `DiverseStoryEvent`, `StoryProfile`
- Produces: Direct chapter prose in the order setup → action → result → meaning.

- [x] Replace the childhood chapter title with the direct title `어린 시절 · 책임감을 배운 순간`.
- [x] Remove unrelated wound, fear, stress response, and personality exposition from the childhood event.
- [x] Give education its own setup sentence and close the event with one concrete trait derived from the selected childhood legacy.
- [x] Separate work, relationship, turning-point, later-life, and death paragraphs so each paragraph has one clear subject and purpose.
- [x] Run focused API tests and confirm they pass.

### Task 3: Simplify deep narrative transitions

**Files:**
- Modify: `apps/api/src/providers/extended-narratives.ts`
- Test: `apps/api/test/extended-narratives.spec.ts`

**Interfaces:**
- Consumes: coherent `StoryProfile` fields
- Produces: complete sentences that introduce one wound, explain its effect, and then show later change without stacking unrelated abstractions.

- [x] Rewrite the inner-self chapter into separate wound, response, and realization paragraphs.
- [x] Rewrite relationship and decision chapters to eliminate repeated generic fear and sacrifice language.
- [x] Run extended narrative tests.

### Task 4: Audit generated samples and the complete suite

**Files:**
- Modify: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Consumes: 500 deterministic generated stories
- Produces: automated evidence that malformed transitions and mixed childhood motifs are absent.

- [x] Generate broad result samples in the test and scan for banned fragments and transitions.
- [x] Run API tests, content checks, API typecheck, and mobile typecheck.
- [x] Review representative generated stories for childhood, work, relationship, turning point, later years, and ending continuity.
