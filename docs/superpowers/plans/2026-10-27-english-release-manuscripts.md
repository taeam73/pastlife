# English Release Manuscripts Implementation Plan

> **For agentic workers:** Implement inline in this task. Steps use checkbox syntax for tracking.

**Goal:** Ship a complete English 3.0 reading experience for all 120 stories, including each story's three signal paths and final moment.

**Architecture:** Keep Korean story IDs, choice IDs, signals, scoring, image URIs, and factual chronology stable. Store English text by story ID in a parallel catalog, validate every translated field against a hashed Korean source snapshot, and select copy by the session locale. Enable English in production only when the catalog and device checks are complete.

**Tech Stack:** TypeScript, `@pastlife/content`, NestJS, Expo Router, Vitest, Playwright, Android.

## Scope and constraints

- The source catalog has 120 cards, 120 manuscripts, 120 final moments, and 360 signal paths. The structured source is about 881,050 JSON characters as measured on 2026-10-27.
- Translate the card text, profile pages, episode introduction and ending, all three signal moments, timeline, memories, final scene, afterword, and illustration alt text. Preserve names consistently across all sections of a story.
- Keep `storyId`, signal names, asset URIs, numeric ages, answer IDs, scoring, and ordering unchanged. Preserve the source distinction between invented settings and real historical settings.
- The existing 24 English questions, 144 English choices, and active UI copy form the base. Audit PDF, share image, archive, error messages, and Android native behavior before enabling English in production.
- Automatic text checks detect omissions and accidental Korean. They do not establish literary fidelity; compare source and translation for names, dates, relationships, events, and ending for every story.

---

### Task 1: Freeze and inventory the source

**Files:** `scripts/export-story-translation-source.ts`, `package.json`, `output/english-source/*.json`.

**Interface:** `corepack pnpm translation:source` writes one source snapshot per story plus `manifest.json` with SHA-256 hashes and signal names.

- [x] Export the 120 live stories from `storyCards`, `storyManuscripts`, and `storyFinalMoments`.
- [x] Fail export when a manuscript, final moment, or selected signal is missing.
- [x] Compare every saved draft with its frozen source hash and verify all 120 frozen hashes against the live Korean catalog before packaging.

### Task 2: Make an English translation catalog

**Files:** `packages/content/src/translations/en/<STORY_ID>.ts`, `packages/content/src/translations/en/coverage.ts`, `packages/content/test/story-translation-coverage-en.test.ts`.

**Interface:** Look up English card, manuscript, and final-moment text by the stable story ID. Readiness means all three signal paths and the final moment are present.

- [ ] Store complete English text for each story in a focused file or generated catalog entry with the source SHA-256 hash.
- [ ] Validate exact story IDs, signal names, profile-page count, timeline-entry count, memory-entry count, and final-moment presence against the Korean source.
- [ ] Reject empty text and Hangul in English text fields. Keep asset URIs and numeric ages unchanged.
- [ ] Report ready story count and ready signal-path count from the real catalog; require 120/120 and 360/360 for production.

### Task 3: Translate and review all 120 manuscripts

**Files:** `packages/content/src/translations/en/<STORY_ID>.ts`; `docs/translation-review/en/*.md` for source comparison notes.

- [ ] Translate the remaining 119 stories in bounded batches while preserving paragraph breaks and every selectable signal moment. CLOWN is the existing pilot; its three paths and final moment already have English copy.
- [ ] For each story, compare names, date and age expressions, family and other relationships, decisions, consequences, and cause of death against the Korean source. Record any intentional editorial change; otherwise correct divergences.
- [ ] Check that the English reads naturally to an English-speaking teen and retains the story's curiosity, fun, and empathy without changing the Korean scoring meaning.
- [ ] Mark a story ready only after its profile, episode variants, timeline, memories, final moment, and alt text pass both automated and source comparison checks.

### Task 4: Serve the catalog consistently

**Files:** `apps/api/src/results/story-result.ts`, `apps/api/src/results/results.service.ts`, `apps/api/src/auth/auth.service.ts`, `apps/api/src/sessions/sessions.service.ts`, `apps/mobile/app/settings.tsx`.

- [ ] Replace the CLOWN-specific result and archive code with lookup by story ID and selected signal.
- [ ] Keep locale on the session and on archived results. Return `TRANSLATION_NOT_READY` instead of Korean prose for any incomplete English entry.
- [ ] Enable English session creation and the English language option in production only after Task 2 reports 120 stories and 360 paths ready.
- [ ] Render localized title, profile, selected episode, chronology, memories, last moment, image alt text, PDF, and share image for every result.

### Task 5: Release checks

**Files:** `packages/content/test/*en*.test.ts`, `apps/api/test/english-preview.spec.ts`, `e2e/mobile-localization-preview.spec.ts`, `e2e/mobile-english-pagination.spec.ts`.

- [ ] Run `corepack pnpm typecheck`, `corepack pnpm test`, and `corepack pnpm content:check` after catalog integration.
- [ ] Test English questions and choices for all 24 IDs and 144 choice IDs; test API results for every story and each selected signal with no Korean in the payload.
- [ ] Run representative 320px and tablet browser flows, checking paragraph completeness, page bounds, no horizontal overflow, PDF, sharing, login, and archive.
- [ ] On an Android device, check English typography, automatic parchment pagination, final-moment unlock, PDF save/share, and ad flow. Record device and build details.
- [ ] Recheck production configuration before removing the English preview gate.

## Current status

The 120 Korean stories were exported with source hashes. A resumable `gpt-5.6-sol` translation batch is creating English drafts in `output/english-translations/`, recording token usage and validating the text shape. The app now reads packaged draft translations by story ID in development preview. English remains unavailable in production until 120/120 stories, 360/360 signal paths, source comparison, and device checks pass. The API key is stored in the user's environment, not in this repository.
