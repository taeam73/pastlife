# Result Portrait and Reader Implementation Plan

**2026-10-21 verification:** The 01 portrait/identity layout and distinct 02–04 parchment reader are implemented and browser-tested at 320, 390, 768, 1024, and 1440 pixels. A loopback-only PostgreSQL 17 development cluster on port 5433 has all seven migrations; a real API flow stored presentation version 2 with four chapters. The ignored local `.env` now selects Prisma and this cluster. The older 5432 cluster is not used. Asset-catalog coverage and deployment DB migration remain separate release gates; unverified legacy portraits are no longer labelled exact.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make chapter 01 visibly identify the pictured person, make chapters 02–04 readable on a large overlaid parchment, and make presentation persistence usable in a real database.

**Architecture:** Keep the existing scoring and six-question flow unchanged. Resolve the chapter-01 portrait from a verified setting/occupation/gender asset; never silently insert an unrelated character. Persist a versioned presentation snapshot and render its portrait/copy and the three reading chapters through separate hero layouts.

**Tech Stack:** NestJS, Prisma/PostgreSQL, Expo React Native Web, Vitest, Playwright.

## Global Constraints

- Do not change questions, scoring, or result selection.
- Keep one background for all four chapters; the four navigation cards are crops of that background.
- Verify 320px mobile, 390px mobile, 768px and 1024px tablet, and 1440px desktop without horizontal overflow.
- Preserve user changes and do not commit or push unless specifically requested.

---

### Task 1: Portrait and identity copy

**Files:** `apps/api/src/providers/library-image.provider.ts`, `apps/api/src/results/build-result-presentation.ts`, `apps/mobile/src/results/libraryImages.ts`, `apps/mobile/assets/characters/v2/`, `apps/api/test/result-presentation.spec.ts`.

**Interfaces:** `buildResultPresentation(core, profile, image, matchedCharacter)` produces `hero.characterUri` and `hero.tagline`; `ResultHero` consumes them.

- [ ] Add a failing test for an Andean female farmer: the exact portrait URI must be returned and the tagline must describe a distinct life choice rather than concatenate temperament and social-mask prose.
- [ ] Generate and inspect a period-appropriate transparent upper-body portrait for this uncovered case; save it as a new versioned project asset, add the mobile require mapping, and add the exact setting/occupation mapping.
- [ ] Replace the present long psychological sentence with a brief, result-specific, story-like interpretation derived from the matched episode and profile. Keep the 01 identity and life summary separate.
- [ ] Run `corepack pnpm --filter @pastlife/api test` and `corepack pnpm --filter @pastlife/mobile typecheck`; ensure the new portrait is not substituted for other cultures or genders.

### Task 2: Distinct 01 versus 02–04 parchment layouts

**Files:** `apps/mobile/src/components/ResultHero.tsx`, `apps/mobile/src/components/ParchmentReader.tsx`, `apps/mobile/src/results/paginate.ts`, `e2e/mobile-result-chapters.spec.ts`.

**Interfaces:** `ResultHero` uses `index === 0` for the portrait-led introduction; indices 1–3 render a larger top-weighted parchment. `ParchmentReader` preserves all text across horizontal pages.

- [ ] Extend the browser test to assert a visible portrait on 01 when an exact asset exists, and the larger reader above the background on 02–04.
- [ ] Make the 01 portrait visually prominent without blocking the identity copy; make 02–04 parchment occupy most of the safe upper scene, with title, text, arrows, and page count.
- [ ] Run mobile typecheck/unit tests and browser screenshots at 320, 390, 768, 1024, and 1440 pixels. Check text clipping, image cover, and horizontal overflow.

### Task 3: Persistence and production-readiness audit

**Files:** `prisma/schema.prisma`, `prisma/migrations/202610210001_result_presentation/migration.sql`, `apps/api/src/repositories/prisma-assessment.repository.ts`, `apps/api/test/vertical-flow.e2e.spec.ts`, deployment notes as applicable.

**Interfaces:** `saveResultPresentation` stores the versioned payload idempotently; basic results return it on subsequent reads.

- [ ] Check whether a reachable local or configured PostgreSQL server exists without printing credentials. If available, apply the additive migration and verify the columns and a result round-trip.
- [ ] If no server exists, try an approved, recoverable local setup using an official package path; do not invent credentials or claim the migration was applied when it was not.
- [ ] Run Prisma validation, API typecheck/e2e, content checks, `git diff --check`, and the focused browser result test. Record any environment or catalog coverage limits precisely.
