# Question Diversity and Play Build Implementation Plan

> **For agentic workers:** Execute inline in this session. The user approved the selection change and requested a reviewable Android build.

**Goal:** Broaden six-question routes without weakening answer-to-story fit, then produce an installable APK and assess the Play upload artifact.

**Architecture:** Keep question and choice IDs unchanged. Improve stage hash mixing while preserving locked questions and recent-question exclusion. If a result repeats, select a different story only from equal highest-affinity candidates. Store the recent-result lookup in the assessment repository.

**Tech Stack:** TypeScript, Vitest, NestJS, Prisma, Expo, Gradle, Android.

## Global Constraints

- Preserve 3.0 question text, choices, scoring signals, rare-story gate, existing session results, and released translations.
- Use existing recent-question history (10 sessions), and consider only the latest 3 completed results for repeat avoidance.
- Verify typecheck, tests, distribution simulation, Android package identity and signing before delivery.
- An APK is for direct installation; a new Play listing requires an Android App Bundle.

---

### Task 1: Independent question routes

**Files:** `packages/content/src/index.ts`, `packages/content/test/story-questions.test.ts`

- [x] Add a test requiring broad first-session path coverage across 4,096 deterministic seeds and unchanged recent-question exclusion.
- [x] Mix the stage hash so low bits no longer couple the six stages.
- [x] Run content tests and inspect the path count.

### Task 2: Conservative repeat avoidance

**Files:** `packages/scoring/src/types.ts`, `packages/scoring/src/result.ts`, `packages/scoring/test/story-results.test.ts`, `apps/api/src/repositories/assessment.repository.ts`, `apps/api/src/repositories/memory-assessment.repository.ts`, `apps/api/src/repositories/prisma-assessment.repository.ts`, `apps/api/src/sessions/sessions.service.ts`

- [x] Test that a repeated result changes only when a fresh card ties for highest affinity, while a unique best and rare result stay unchanged.
- [x] Add recent story IDs to the scoring input and fetch the previous three results for the same device at completion.
- [x] Run scoring and API tests, then typecheck.

### Task 3: Android artifacts

**Files:** `apps/mobile/app.json`, `scripts/build-android-local.ps1` (only if required)

- [x] Increment version code and run complete checks.
- [ ] Commit the reviewed source.
- [ ] Deploy the server-side change to development, then build and verify an installable APK.
- [x] Inspect production environment readiness: production API and live AdMob build settings are missing, so public release is blocked.
- [ ] Generate a signed AAB for the Play internal testing track, with development API and test ads, and verify target SDK.
- [ ] Report artifact links and any unmet Play Console prerequisites.
