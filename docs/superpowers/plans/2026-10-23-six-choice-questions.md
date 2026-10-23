# Six Choices for 3.0 Questions Implementation Plan

> **For agentic workers:** Execute inline in this task. The user authorized six choices per 3.0 question before manuscript production resumes. Do not dispatch subagents, commit, push, or deploy.

**Goal:** Give each of the 24 content 3.0 questions six clear, distinct actions while preserving the existing four choice IDs and their scoring routes.

**Architecture:** Append two authored choices to each `storyQuestions` scene, creating `_C5` and `_C6` with existing `StorySignal` values. Keep the six-stage flow, deterministic question selection, and 2.5 question data. The API contracts already accept six choices; the mobile question screen renders the returned list in a `ScrollView`.

**Tech Stack:** TypeScript, Vitest, NestJS E2E, Expo web, Playwright.

## Global Constraints

- 3.0 has 24 questions, four candidates per stage. The finished set must have 144 choices total.
- Preserve the first four texts, IDs, order, score tags and story signals of every scene.
- Each new choice must be a plausible, concrete action distinct from the other five and readable by a middle-school student.
- Keep the manuscript automation paused until type, unit, API, 320px and tablet question-screen verification passes.
- Preserve unrelated uncommitted files. No commit, push or deployment.

---

### Task 1: Content and scoring routes

**Files:** `packages/content/src/story-questions.ts`, `packages/content/test/story-questions.test.ts`

- [x] Expand the six-option tuple in `scene()`; append two authored `[text, signal]` entries to each of the 24 scenes.
- [x] Check all new choices for scene fit, distinct behavior, and mapping to existing story signals.
- [x] Change the content test to assert 24 questions, six choices each, 144 choices total, unique IDs, unchanged first-four routes, and valid fifth/sixth routes. Run the focused content test.

### Task 2: API and result verification

**Files:** `apps/api/test/content-reboot.e2e.spec.ts`

- [x] Change the 3.0 API test to expect 144 choices and six choices per returned question. Exercise a fifth and sixth answer in the six-stage result journey.
- [x] Run typecheck, unit tests, content checks, and API E2E. Verify that 2.5 still uses its existing six-choice set.

### Task 3: Question-screen and status verification

**Files:** `PROJECT_STATUS.md`, this plan.

- [x] Run a fresh 3.0 browser session at 320px and tablet width. Check that all six buttons can be read and tapped by scrolling, without horizontal overflow or clipped text. The repository Playwright runner used installed Edge because the CLI browser install was unavailable.
- [x] Update project status from 24/96 to 24/144 and record results and limitations. Recheck `git diff --check`.
- [x] After verification, resume the previously paused 120-story automation so remaining manuscripts follow the updated questions.
