# English Localization Preview Implementation Plan

> **For agentic workers:** Implement inline in this task; the user already requested the test build. Steps use checkbox syntax for tracking.

**Goal:** Make a Korean and English localization path, then verify one complete English question-to-story experience without changing answer IDs or scoring.

**Architecture:** Persist a `ko | en` locale on the client and session. Serve question and choice translations by stable IDs. Keep story translations keyed by story ID and signal; translate UI copy through a small typed catalog. Gate incomplete English story coverage to preview so it cannot silently show Korean as English in release.

**Tech Stack:** Expo Router, React Native, NestJS, TypeScript, Vitest, Playwright.

## Global Constraints

- Keep question IDs, choice IDs, signals, and scoring unchanged.
- Preserve the 3.0 Korean experience.
- The English story preview covers CLOWN only; 120-story English release requires complete translations.
- Test at 320px and tablet width, including navigation and no horizontal overflow.

---

### Task 1: Locale and UI catalog

**Files:** `apps/mobile/src/i18n/locale.tsx`, `apps/mobile/src/session/store.ts`, `apps/mobile/app/_layout.tsx`, `apps/mobile/app/settings.tsx`, user-facing routes/components.

**Interfaces:** `Locale = 'ko' | 'en'`; `useLocale()` returns locale and setter; `t(locale, key)` returns UI copy. Session creation reads the selected locale.

- [x] Add locale persistence and context with Korean fallback.
- [x] Replace visible Korean copy in the active start, guide, question, analysis, result, final moment, archive, login, settings and shared components.
- [x] Check the visible route tree for untranslated Korean strings.
- [x] Run mobile typecheck and UI tests.

### Task 2: Stable content translations

**Files:** `packages/content/src/story-questions.en.ts`, `packages/content/src/index.ts`, `apps/api/src/sessions/sessions.service.ts`, `apps/api/src/results/story-result.ts`, `apps/api/src/results/results.service.ts`.

**Interfaces:** `localizeStoryQuestion(question, locale)` retains IDs/metadata and replaces text; `localizeStoryResult(result, storyId, locale)` replaces prose from an English translation catalog.

- [x] Translate all 24 question texts and 144 choice texts by stable ID.
- [x] Return English question text for English sessions without touching saved answers.
- [x] Move CLOWN English preview into the content catalog and render it for CLOWN English sessions.
- [x] Refuse an English story response when no English manuscript exists, rather than return Korean prose.
- [x] Test ID and scoring invariance and English response output.

### Task 3: End-to-end preview and layout

**Files:** `e2e/mobile-localization.spec.ts`, `apps/mobile/src/results/exportRecordPdf.ts`, `apps/mobile/src/results/shareProfileImage.ts`.

- [x] Start an English session, answer six stages, display the English CLOWN sample, and visit settings/share/archive.
- [x] Check for Korean text and clipping at 320px and tablet width.
- [x] Verify image and PDF export language or keep English export unavailable with explicit English copy until translated.
- [x] Run `corepack pnpm typecheck`, `corepack pnpm test`, targeted browser E2E, and `git diff --check`.

## Preview boundary

English selection is available in development builds only. The server rejects English session creation in production until all 120 stories and signal variants have translations. In the preview, all three CLOWN signals (`speak`, `connect`, `release`) have distinct English episodes, a full English result, and a final moment. The coverage check reports 1 of 120 stories and 3 of 360 result paths ready. Other outcomes return `TRANSLATION_NOT_READY` with an English message in the app. Android native layout, native PDF sharing, and live ads still require device testing before a public English release.

