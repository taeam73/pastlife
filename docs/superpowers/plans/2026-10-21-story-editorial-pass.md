# Story Editorial Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 12 implemented stories more distinct, coherent, and rewarding to read while preserving the approved question and selection structure.

**Architecture:** Edit the authored `StoryCard` fields rather than changing result IDs or scoring. Review the six-block/ four-chapter assembly for each card with its selected signal, and add tests for editorial invariants that code can verify.

**Tech Stack:** TypeScript, Vitest, pnpm workspace.

## Global Constraints

- 흥미·재미·공감 are the acceptance criteria, with broad kinds of fun rather than only humor.
- 11 human stories and one rare non-human surprise remain; the clown story remains in the deck.
- Language stays understandable to younger readers without assuming school life.
- Do not assert that a fictional past life caused a reader's present body, personality, or trauma.
- Preserve existing 2.5.0 sessions and the current 3.0.0 question, result ID, and response contracts.
- Preserve unrelated dirty worktree changes. No automatic commit, push, or deployment in this pass.

---

### Task 1: Read all paths and repair story logic

**Files:**
- Modify: `packages/content/src/story-catalog.ts`
- Modify: `docs/content-reboot-implementation.md`

**Interfaces:**
- Consumes: `StoryCard` fields and `signalMoments` from `packages/content/src/story-catalog.ts`.
- Produces: the same `StoryCard` interface and IDs, with coherent moments for each allowed signal.

- [x] **Step 1: Record the 12-card audit.** A dated, explicitly AI-only card-by-card table is in `docs/content-reboot-implementation.md`.
- [x] **Step 2: Revise the four weakest story turns.** `SILENT_BELL` now reveals the baby's note after the search; `NIGHT_GUIDE` weighs a swaying bridge against a fading lamp; `MIRROR` uses a real window behind the mirror; `HERBALIST` reveals the red-thread meaning after rain and the note.
- [x] **Step 3: Re-read each story in displayed order.** The appended moment and the following decision were checked for all 12 cards; `MIRROR` and `SILENT_BELL` duplicate or contradictory actions were rewritten. `presentEcho` is now unique to each story.
- [x] **Step 4: Verify the content package.** Both `corepack pnpm --filter @pastlife/content test` and `corepack pnpm --filter @pastlife/content typecheck` exited 0.

### Task 2: Guard the result assembly and verify full flow

**Files:**
- Modify: `apps/api/test/content-reboot.e2e.spec.ts`
- Modify: `packages/content/test/story-questions.test.ts`
- Modify: `docs/content-reboot-implementation.md`

**Interfaces:**
- Consumes: existing `storyCards` and v3 API response.
- Produces: regression checks for card signal moments and reader-facing result completeness.

- [x] **Step 1: Add a card invariant test.** The content test checks unique IDs, distinct signals, matching nonempty moments, and required story fields.
- [x] **Step 2: Add a result-flow assertion.** The v3 API E2E test checks four nonempty chapters, six nonempty blocks, and the imagined-story disclaimer through the shared contract.
- [x] **Step 3: Run full checks.** `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm content:check`, `corepack pnpm test:e2e`, and `git diff --check` exited 0. Git reported existing LF/CRLF conversion warnings, not whitespace errors.
- [x] **Step 4: Complete the record.** The dated audit states changes, simulated-route caveats, and remaining reader-validation questions.

## Self-review

- This plan covers authored story logic, visible result assembly, and regression checks. It intentionally does not alter UI, scoring weights, question count, or deployment.
- All target IDs and fields exist in the current code. There are no new runtime interfaces.
- The revised phrases and guard rails are visible in `packages/content/src/story-catalog.ts`, `apps/api/src/results/story-result.ts`, and their tests; no runtime contracts were changed.
