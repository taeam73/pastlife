# PRD 2.5 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Preserve the working 2.0 vertical slice while adding PRD 2.5 question variety, durable viewing state, single-image reuse, dual result presentation, sharing choices, recovery, and re-exploration.

**Architecture:** Extend the repository boundary first so the in-memory and Prisma implementations share the same durable session/question/image semantics. Keep scoring server-owned and deterministic, expose only validated 2.5 state through contracts, then compose all result screens from one mobile renderer. Provider names, fallback inventory, sound assets, store URL, and deep-link domain remain environment-driven operating data.

**Tech Stack:** TypeScript 5.9, NestJS 11, Prisma 6/PostgreSQL, Zod 4, Expo Router 57, React Native 0.86, Vitest 3, Supertest.

## Global Constraints

- Existing 2.0 question, scoring, ads, account, and archive behavior must remain compatible.
- One session may create at most one logical AI source image; the first failure is retried once and the second failure uses a library fallback.
- Question, answer, scoring, and content identifiers remain server-owned and versioned.
- `view_mode` is `VIDEO | TEXT`, defaults to `VIDEO`, and persists for the session.
- AI video generation is out of scope; cinematic presentation uses the one source image plus timed text and restrained motion.
- Provider selection, fallback-image inventory, sound assets, deep-link domain, Google Play URL, and locale priority stay configurable.

---

### Task 1: Versioned 2.5 contracts and repository state

**Files:**
- Modify: `packages/contracts/src/session.ts`
- Modify: `packages/contracts/src/result.ts`
- Modify: `apps/api/src/repositories/assessment.repository.ts`
- Modify: `apps/api/src/repositories/memory-assessment.repository.ts`
- Modify: `apps/api/src/repositories/prisma-assessment.repository.ts`
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/202609170001_prd_2_5/migration.sql`

**Interfaces:**
- Consumes: existing `StoredSession`, `StoredResult`, and public Zod contracts.
- Produces: `ViewMode`, fixed `session.questions`, `getQuestionHistory()`, `lockQuestion()`, `setViewMode()`, and one stored result image.

- [x] **Step 1: Write failing repository/API tests**

```ts
expect(first.body.id).toBe(second.body.id);
expect(patched.body.viewMode).toBe('TEXT');
expect(status.body.viewMode).toBe('TEXT');
```

- [x] **Step 2: Run the focused API test**

Run: `corepack pnpm --filter @pastlife/api test:e2e`
Expected: FAIL because view-mode routes and durable question locks do not exist.

- [x] **Step 3: Add schema and repository methods**

```ts
export type ViewMode = 'VIDEO' | 'TEXT';
lockQuestion(sessionId: string, stage: number, questionId: string): Promise<string>;
getQuestionHistory(subjectKey: string, limit: number): Promise<string[]>;
setViewMode(sessionId: string, viewMode: ViewMode): Promise<ViewMode>;
```

Persist the fields with additive SQL only. Do not rewrite or delete existing results.

- [x] **Step 4: Regenerate Prisma and run typecheck**

Run: `corepack pnpm exec prisma generate --schema prisma/schema.prisma; corepack pnpm typecheck`
Expected: PASS.

### Task 2: Server-selected questions and session recovery

**Files:**
- Modify: `packages/content/src/index.ts`
- Modify: `apps/api/src/sessions/sessions.service.ts`
- Modify: `apps/api/src/sessions/sessions.controller.ts`
- Modify: `apps/api/test/vertical-flow.e2e.spec.ts`
- Create: `apps/api/test/question-selection.spec.ts`

**Interfaces:**
- Consumes: Task 1 repository methods and the existing six-question stage pools.
- Produces: deterministic weighted selection per session, prior-session exclusion, retry-stable locks, and `PATCH /sessions/:id/view-mode`.

- [x] **Step 1: Add selection tests**

```ts
expect(retry.id).toBe(first.id);
expect(secondSessionQuestions).not.toEqual(firstSessionQuestions);
```

- [x] **Step 2: Run tests to verify failure**

Run: `corepack pnpm --filter @pastlife/api test`
Expected: FAIL on missing history-aware selection.

- [x] **Step 3: Implement server-owned selection**

```ts
selectQuestion({ stage, seed, contentVersion, excludedQuestionIds, biasTags }): Question
```

Sort candidates by permanent ID before applying a stable seeded choice, exclude current/prior questions when possible, and lock the selected ID before returning it.

- [x] **Step 4: Run API tests**

Run: `corepack pnpm --filter @pastlife/api test; corepack pnpm --filter @pastlife/api test:e2e`
Expected: PASS.

### Task 3: Single image lifecycle and share assets

**Files:**
- Modify: `apps/api/src/providers/image.provider.ts`
- Modify: `apps/api/src/providers/ai-image.provider.ts`
- Modify: `apps/api/src/results/results.service.ts`
- Modify: `apps/api/src/results/results.controller.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`
- Modify: `apps/api/test/vertical-flow.e2e.spec.ts`

**Interfaces:**
- Consumes: stored result image and environment-based provider configuration.
- Produces: one cached image per result, exactly one automatic retry, `POST /results/:id/share-assets`, separate `VIDEO | IMAGE` formats, and stable public share IDs.

- [x] **Step 1: Add provider and endpoint tests**

```ts
expect(fetchMock).toHaveBeenCalledTimes(2);
expect(asset.body.type).toBe('IMAGE');
expect(asset.body.sourceImageUri).toBe(basic.body.image.uri);
```

- [x] **Step 2: Verify tests fail**

Run: `corepack pnpm --filter @pastlife/api test`
Expected: FAIL because retry and typed share assets are absent.

- [x] **Step 3: Implement retry and reusable template assets**

```ts
for (let attempt = 1; attempt <= 2; attempt += 1) {
  const generated = await requestImage(core);
  if (generated) return generated;
}
return fallback.getImage(core);
```

Return environment-derived deep links and Google Play fallback metadata; do not claim that a binary MP4 exists until a renderer is configured.

- [x] **Step 4: Run focused tests**

Run: `corepack pnpm --filter @pastlife/api test; corepack pnpm --filter @pastlife/api test:e2e`
Expected: PASS.

### Task 4: Shared cinematic and text result UI

**Files:**
- Create: `apps/mobile/src/components/ResultExperience.tsx`
- Modify: `apps/mobile/src/api/client.ts`
- Modify: `apps/mobile/src/session/store.ts`
- Modify: `apps/mobile/app/result.tsx`
- Modify: `apps/mobile/app/deep.tsx`
- Modify: `apps/mobile/app/present-guide.tsx`
- Modify: `apps/mobile/app/analysis.tsx`

**Interfaces:**
- Consumes: Task 1 view-mode API and existing result blocks/image.
- Produces: one accessible renderer with immediate `VIDEO`/`TEXT` switching, play/pause/replay/skip/mute controls, reduced-motion behavior, and mode reuse across all result tiers.

- [x] **Step 1: Add pure timing tests**

```ts
expect(buildTimeline(blocks, 15000)).toHaveLength(blocks.length);
expect(buildTimeline(blocks, 15000).at(-1)?.endMs).toBe(15000);
```

- [x] **Step 2: Implement the shared component**

```tsx
<ResultExperience image={image} blocks={blocks} viewMode={viewMode}
  onViewModeChange={setViewMode} durationMs={durationMs} />
```

Use React Native primitives only; movement is optional presentation and all text remains available to accessibility services.

- [x] **Step 3: Replace duplicated result layouts**

Basic uses 18 seconds, each deep story uses 12 seconds, and the guide uses 18 seconds. No playback completion triggers an unlock or navigation.

- [x] **Step 4: Run mobile typecheck and tests**

Run: `corepack pnpm --filter @pastlife/mobile typecheck; corepack pnpm --filter @pastlife/mobile test`
Expected: PASS.

### Task 5: Onboarding, re-exploration, settings, and release documentation

**Files:**
- Modify: `apps/mobile/app/index.tsx`
- Modify: `apps/mobile/app/guide.tsx`
- Modify: `apps/mobile/app/result.tsx`
- Modify: `apps/mobile/app/deep.tsx`
- Modify: `apps/mobile/app/present-guide.tsx`
- Create: `apps/mobile/app/settings.tsx`
- Modify: `apps/mobile/app.json`
- Modify: `README.md`
- Create: `docs/prd-2.5-implementation-report.md`

**Interfaces:**
- Consumes: session creation, persisted install ID/preferences, and share-asset API.
- Produces: 2.5 copy, first-session intuition guidance, BGM/effect/reduced-motion preferences, immersive routes without bottom navigation, and a new-session CTA at every stopping point.

- [x] **Step 1: Implement persistent operating preferences**

```ts
type Preferences = { bgmEnabled: boolean; effectsEnabled: boolean; reduceMotion: boolean };
```

- [x] **Step 2: Add re-exploration and explicit share choices**

`또 다른 전생 기록 찾아보기` creates a fresh session and routes to stage 1 without modifying the prior result. Sharing asks for video or image and uses the same result image.

- [x] **Step 3: Configure Android link inputs without hard-coding unknown policy**

Read package name, host, and Play URL from Expo/environment configuration and document their required release values.

- [x] **Step 4: Run the full verification suite**

Run: `corepack pnpm typecheck; corepack pnpm test; corepack pnpm test:e2e`
Expected: PASS.

- [x] **Step 5: Record delivered scope and configurable release inputs**

The report maps CHG 01 through CHG 10 to files and tests, and explicitly lists any infrastructure-dependent capability such as production MP4 encoding or licensed audio binaries.
