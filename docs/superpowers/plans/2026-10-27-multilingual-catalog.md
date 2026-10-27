# Multilingual Catalog Implementation Plan

> **For agentic workers:** Implement inline in this task. Steps use checkbox syntax for tracking.

**Goal:** Let the app and API share one locale registry so more translated languages can be added without changing story IDs or scoring, while incomplete languages remain unavailable.

**Architecture:** Korean remains the source catalog. Each translation has a language folder under `packages/content/src/translations/<locale>/`, keyed by the same question and story IDs. A shared registry describes which locales are ready or in preview. The app stores a locale code; the API rejects unsupported or unavailable codes and refuses missing translated content instead of falling back silently.

**Tech Stack:** TypeScript, Expo Router, NestJS, Vitest, Playwright.

## Constraints

- Korean release remains unchanged; English stays a development preview until all 120 stories and 360 signal paths are translated.
- Do not expose Japanese until its question, UI, story, export, and Android checks are complete.
- Keep IDs, scoring, signals, ages, and image URIs stable across languages.

---

### Task 1: Locale registry

**Files:** `packages/content/src/locales.ts`, `packages/content/src/index.ts`, `packages/content/test/locales.test.ts`.

- [x] Define locale codes and metadata for `ko` and `en`, including BCP 47 language tags, UI name keys, and production readiness.
- [x] Parse locale codes centrally and reject unknown values such as `ja` while no Japanese catalog exists.
- [x] Make test expectations explicit: Korean is enabled in production; English is preview only.

### Task 2: App locale catalog

**Files:** `apps/mobile/src/i18n/locale.tsx`, `apps/mobile/src/i18n/en.ts`, `apps/mobile/app/settings.tsx`.

- [x] Move English UI copy to an English resource file and look it up by the shared locale code.
- [x] Build the language choices from the shared registry, store the selected locale, and ignore invalid or unavailable stored values.
- [x] Keep untranslated UI keys as an error for non-Korean locales, avoiding silent Korean text in another language.

### Task 3: API locale gate

**Files:** `apps/api/src/sessions/sessions.service.ts`, `apps/api/src/results/story-result.ts`, `apps/api/src/results/results.service.ts`.

- [x] Use the shared locale parser for new sessions and keep preview locales disabled in production.
- [x] Keep result and final-moment localization keyed by story ID and signal. Return `TRANSLATION_NOT_READY` for any untranslated path.
- [x] Keep archived result titles aligned with the session locale, omitting unready English results.
- [ ] Check the remaining export and sharing paths for locale persistence and mixed-language responses.

### Task 4: Checks and extension instructions

**Files:** `packages/content/src/translations/README.md`, `docs/superpowers/plans/2026-10-27-english-release-manuscripts.md`.

- [x] Run `corepack pnpm typecheck` and targeted content/API tests.
- [ ] Run `corepack pnpm test` and the English browser flow.
- [x] Document the exact addition path for `ja/` and other locales, including Chinese script variants, completeness checks, and the release gate.
