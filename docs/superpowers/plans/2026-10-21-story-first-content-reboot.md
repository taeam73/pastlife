# Story First Content Reboot Implementation Plan

> **For agentic workers:** Execute inline in the existing feature branch. Preserve unrelated working-tree changes. Use tests and review after each task; do not stage or commit unrelated files.

**Goal:** Replace the app's new-session questions and results with an interest, fun, and empathy-led story collection while preserving already-created 2.5.0 results.

**Architecture:** Keep the legacy six-stage catalog and historical result builder for stored sessions. Add a versioned question catalog and a curated story catalog for 3.0.0; choose a story from answer signals, then render every new result field from that story so no historical metadata leaks into fantasy or cosmic stories. Keep six answers per run until content tests demonstrate a need for more.

**Tech Stack:** TypeScript, pnpm workspace, Vitest, NestJS, React Native.

## Global Constraints

- The product purpose is 흥미·재미·공감; questions are understandable to younger readers and usable by all ages.
- Most stories follow human lives. Alien and nonliving stories remain a rare special candidate, not the default tone.
- Past lives are imaginative entertainment, not facts, diagnosis, or causes of present-day health and trauma.
- Preserve old question IDs, scoring behavior, and result display for 2.5.0 sessions and saved results.
- Preserve unrelated dirty files. Do not commit or push unless requested; this working tree already contains unrelated user changes.
- Verify `corepack pnpm typecheck`, `corepack pnpm test`, and a new-session end-to-end journey.

---

### Task 1: Versioned questions and selection

**Files:**
- Create: `packages/content/src/story-questions.ts`
- Modify: `packages/content/src/index.ts`
- Modify: `apps/api/src/sessions/sessions.service.ts`
- Test: `packages/content/test/story-questions.test.ts`

**Interfaces:**
- `storyQuestions: Question[]` contains four candidates at each of the existing six stages, with four distinct choices each.
- `questionsForVersion(contentVersion: string): Question[]` returns `storyQuestions` for `3.0.0`, otherwise legacy `questions`.
- `selectQuestion` selects from the version-specific pool deterministically, honoring excluded IDs.

- [x] Add a failing test that new sessions see only story questions and legacy versions see exactly 36 legacy questions.
- [x] Run `corepack pnpm --filter @pastlife/content test`; the new import failed first.
- [x] Write 24 short, universal question scenes with four distinct actions; export the versioned selector.
- [x] Update session question lookup and default version to `3.0.0`, without changing the six-stage mobile flow.
- [x] Run content and API session tests; existing 2.5.0 assertions remain green.

### Task 2: Story catalog and deterministic answer matching

**Files:**
- Create: `packages/content/src/story-catalog.ts`
- Modify: `packages/content/src/index.ts`
- Modify: `packages/scoring/src/types.ts`
- Modify: `packages/scoring/src/score.ts`
- Modify: `packages/scoring/src/result.ts`
- Test: `packages/scoring/test/story-results.test.ts`

**Interfaces:**
- Each story has an ID, world, human or special classification, title, role, hook, conflict, turn, choice, cost, and present-day mirror; all text is explicitly fictional.
- New choices carry editorial signals such as `notice`, `connect`, `rest`, `explore`, `repair`, and `speak`.
- New `ResultCore.storyId?: string` selects one compatible story with deterministic tie-breaking; old results have no `storyId`.

- [x] Add tests for stable selection, different answer patterns producing varied stories, and special stories not appearing as a default fallback.
- [x] Write and self-review twelve distinct story entries, including market clown, innkeeper, royal scribe, mystery, fantasy, human-in-space, and one special-world slot.
- [x] Score the selected actions for editorial motifs. Use the hash only to break close compatible choices; never attach unchosen health or personality traits.
- [x] Keep old score and historical-field behavior for legacy cores; run scoring and content tests.

### Task 3: Story-specific result rendering and images

**Files:**
- Create: `apps/api/src/results/story-result.ts`
- Modify: `apps/api/src/results/results.service.ts`
- Modify: `apps/api/src/providers/template-narrative.provider.ts`
- Modify: `apps/api/src/providers/ai-narrative.provider.ts`
- Modify: `apps/api/src/providers/library-image.provider.ts`
- Modify: `apps/api/src/providers/image-compatibility.ts`
- Test: `apps/api/test/content-reboot.e2e.spec.ts`

**Interfaces:**
- `buildStoryResult(core, image)` returns the existing basic-result response shape with six narrative blocks, four presentation chapters, eight highlights, and a story-consistent identity.
- For a core without `storyId`, the existing historical result path is unchanged.
- For a core with `storyId`, no era, region, profession, chapter, character, or image text from the historical fallback reaches the response.

- [x] Add an API journey test for a 3.0 result; assert coherent hero, chapters, highlights, and disclaimer without historical leakage.
- [x] Implement story-specific result composition and route the basic endpoint through it for 3.0.0 cores.
- [x] Store curated story blocks through the template provider; bypass the historical AI prompt for those cores.
- [x] Use a neutral archive background when a matching visual is absent, not an unrelated historical portrait; validate compatibility.
- [x] Run API result tests, typecheck, and all workspace tests.

### Task 4: Quality audit and complete new-session journey

**Files:**
- Extend: `packages/content/test/story-questions.test.ts`
- Create: `apps/api/test/content-reboot.e2e.spec.ts`
- Modify: `docs/content-guide.md` only after reconciling its existing dirty changes.

**Interfaces:**
- The audit checks complete catalog coverage, distinct hooks, teen-readable copy, no diagnosis or past-life causation claims, and one special slot at most in the initial collection.
- The journey requests and answers six questions, completes, unlocks the basic result, and reads a coherent story response.

- [x] Write tests for missing narrative beats, all human cards being reachable, and the special card remaining scarce.
- [x] Run a mocked new-session journey and inspect story response, deep result, and present guide.
- [x] Rewrite weak entries and questions found by self-review; keep the audit findings in the implementation record.
- [x] Run `corepack pnpm typecheck`, `corepack pnpm test`, and API E2E checks. Report any remaining mismatch rather than claiming full readiness.

## Self review

This plan covers versioned questions, story selection, full result rendering, historical preservation, and content verification. The number of questions per run remains six; the new candidate pool is 24 scenes rather than an appendix to the 36 legacy candidates.
