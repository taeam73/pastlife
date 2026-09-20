# Immersive Story Text-First Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the seven basic result categories into one vivid, coherent short story, make image-plus-text the default result experience, and lock video viewing and video sharing for the first release.

**Architecture:** Build deterministic Korean story chapters from the existing result core so the no-AI fallback is already release-quality. Keep the seven-block API shape for compatibility, but enforce richer AI responses and render one hero image followed by continuous chapters. Preserve `VIDEO` in contracts for future compatibility while defaulting all new sessions to `TEXT`, disabling the video tab, and rejecting video share generation server-side.

**Tech Stack:** NestJS, TypeScript, Zod, Expo React Native, Vitest, Playwright

## Global Constraints

- Exactly seven basic story chapters must remain in the API response.
- The seven chapters must read as one continuous past-life story and total at least 1,100 Korean characters.
- Use only the selected era, location, social class, occupation, personality, relationship, event, last memory, record number, and controlled scene details.
- Do not invent gender, real-person identity, ethnicity, religion, explicit violence, diagnosis, or factual reincarnation claims.
- Default first-release presentation is one image followed by text; video controls are visible only as disabled “출시 예정” UI.
- Video share generation must be unavailable in both UI and API for the first release; image sharing remains available.
- Do not commit until the user explicitly requests it.

---

### Task 1: Release-quality deterministic short story

**Files:**
- Create: `apps/api/src/providers/story-narrative.ts`
- Modify: `apps/api/src/providers/template-narrative.provider.ts`
- Modify: `apps/api/src/providers/ai-narrative.provider.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`

**Interfaces:**
- Consumes: `ResultCore` and the content catalogs.
- Produces: `buildStoryNarrative(core): NarrativeBlock[]`, exactly seven ordered chapters with stable IDs.

- [x] Add failing tests asserting seven stable IDs, record number and selected labels, a minimum total body length of 1,100 characters, deterministic output, and no gender assertion.
- [x] Run the provider test and verify the new richness assertions fail against the current seven sentences.
- [x] Implement controlled scene dictionaries and seven connected chapters: beginning, identity, daily life, relationship, turning point, final memory, and present-day trace.
- [x] Replace the short template provider bodies with `buildStoryNarrative(core)`.
- [x] Validate AI narrative responses for matching IDs, bounded chapter body length, and minimum total length; fall back on any mismatch.
- [x] Run provider tests and verify the deterministic and AI fallback behavior passes.

### Task 2: Image-plus-text default and video lock

**Files:**
- Modify: `apps/api/src/sessions/sessions.service.ts`
- Modify: `apps/api/src/results/results.service.ts`
- Modify: `apps/mobile/src/session/store.ts`
- Modify: `apps/mobile/src/session/start.ts`
- Modify: `apps/mobile/src/components/ResultExperience.tsx`
- Modify: `apps/mobile/app/result.tsx`
- Modify: `apps/mobile/app/deep.tsx`
- Modify: `apps/mobile/app/present-guide.tsx`
- Modify: `apps/mobile/app/archive/[resultId].tsx`

**Interfaces:**
- Consumes: existing `TEXT | VIDEO` compatibility types and result image/blocks.
- Produces: `TEXT` defaults, a hero image plus chapter list, a disabled `영상으로 보기 · 출시 예정` tab, and no active video controls.

- [ ] Change server and persisted-session fallbacks from `VIDEO` to `TEXT` and start every new first-release session in `TEXT`.
- [ ] Refactor `ResultExperience` to always render the image hero and all text blocks, while exposing a disabled video tab with accessible disabled state.
- [ ] Remove active video state, playback controls, mute controls, and view-mode mutation calls from result, deep, guide, and archive screens.
- [ ] Disable the result screen’s video-share button with first-release explanatory copy while retaining image share.
- [ ] Reject `VIDEO` in `ResultsService.createShareAsset` with `FEATURE_UNAVAILABLE` and leave `IMAGE` behavior unchanged.

### Task 3: Contracts, tests, documentation, and live preview

**Files:**
- Modify: `apps/api/test/vertical-flow.e2e.spec.ts`
- Modify: `e2e/mobile-journey.spec.ts`
- Modify: `docs/openapi.yaml`
- Modify: `README.md`
- Modify: `docs/prd-2.5-implementation-report.md`
- Create: `docs/fifteenth-stage-report.md`

**Interfaces:**
- Consumes: Tasks 1 and 2 behavior.
- Produces: verified release policy and a browser-visible text-first result.

- [ ] Update API E2E expectations to require `TEXT`, rich seven-block copy, successful image share, and rejected video share.
- [ ] Update browser E2E to require the hero image region, story chapters without a mode switch, and disabled video controls.
- [ ] Update OpenAPI and release documentation to describe text-first results and the first-release video lock.
- [ ] Run workspace typecheck, all unit tests, API E2E, browser E2E, and `git diff --check`.
- [ ] Restart the active development API and Expo server, complete a fresh result journey, and verify the new story screen is visible at `http://localhost:8081`.
- [ ] Mark completed steps without committing.
