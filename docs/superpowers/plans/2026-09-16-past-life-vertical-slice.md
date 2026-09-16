# Past Life Archive First Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the PRD 2.0 first implementation scope so a user can start anonymously, answer one deterministic question per stage, complete scoring on the server, pass fake AD 1, and view the seven basic result blocks in the Expo app.

**Architecture:** Use a pnpm TypeScript monorepo with shared Zod contracts, generated content JSON, and a pure deterministic scoring package. NestJS owns session state, answer validation, result snapshots, and server-side unlocks in PostgreSQL through Prisma; Expo Router renders the single mobile path and never calculates scores. External providers are ports with local fake/template/library implementations, while Redis and the worker/admin apps are runnable scaffolds for the next phase.

**Tech Stack:** Node.js 24, pnpm workspaces, TypeScript, Expo + React Native + Expo Router, NestJS, PostgreSQL, Prisma, Redis, Zod, Vitest, Supertest, Docker Compose.

## Global Constraints

- Canonical specification: `전생록_Codex_개발_착수_명세.md`, PRD version `2.0`, content version default `2.0.0`.
- Preserve all 36 question IDs and 216 choice IDs from Appendix A; do not hard-code question, choice, or result copy in screen components.
- The client sends only `choiceId`; all tag, axis, compatibility, and result calculations execute on the server.
- Identical `answerHash` plus `contentVersion` must return an identical `resultCore`, `recordNo`, and existing `resultId` on retries.
- First-slice screens are `SCR 001`, `SCR 002`, `SCR 101`–`SCR 106`, `SCR 200`, and `SCR 300`.
- First-slice APIs are session creation, staged question lookup, answer upsert, idempotent completion, result status, fake AD 1 completion, and protected basic result lookup.
- Development must run without real ad, Google, text-AI, image-AI, S3, or Redis services by selecting fake/template/library or synchronous fallbacks.
- Keep the three-ad product model intact; implement only AD 1 in this slice and leave deep/guide endpoints out rather than silently unlocking them.
- Use a dark navy/charcoal, restrained gold accent, one-message-per-screen layout, 44pt minimum touch targets, WCAG AA contrast, accessibility labels, font scaling, and reduced-motion-safe transitions.
- The required result disclaimer is always visible at the bottom of `SCR 300`.

---

## Planned File Map

```text
apps/
  api/src/{main.ts,app.module.ts,prisma/,sessions/,results/,ads/,providers/}
  api/test/vertical-flow.e2e-spec.ts
  mobile/app/{_layout.tsx,index.tsx,guide.tsx,question/[stage].tsx,analysis.tsx,result.tsx}
  mobile/src/{api/client.ts,session/store.ts,theme/tokens.ts,components/}
  admin/{package.json,src/app/page.tsx}
  worker/{package.json,src/main.ts}
packages/
  contracts/src/{index.ts,session.ts,result.ts,error.ts}
  content/src/{index.ts,types.ts,generated/questions.ko.json,catalogs.ts}
  content/scripts/extract-questions.mjs
  content/test/content.test.ts
  scoring/src/{index.ts,hash.ts,prng.ts,score.ts,filter.ts,result.ts,types.ts}
  scoring/test/{score.test.ts,determinism.test.ts,fallback.test.ts}
  ui/src/index.ts
  config/{typescript/,vitest/}
prisma/{schema.prisma,seed.ts,migrations/...}
infra/docker-compose.yml
docs/openapi.yaml
.env.example
package.json
pnpm-workspace.yaml
```

## Task 1: Bootstrap the runnable monorepo and local services

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `infra/docker-compose.yml`
- Create: `apps/admin/package.json`
- Create: `apps/admin/src/app/page.tsx`
- Create: `apps/worker/package.json`
- Create: `apps/worker/src/main.ts`
- Create: `packages/config/typescript/base.json`
- Create: `packages/config/vitest/base.ts`

**Interfaces:**
- Consumes: Node.js `v24.19.0` already installed in the workspace.
- Produces: root commands `dev`, `lint`, `typecheck`, `test`, `test:e2e`, `db:migrate`, and `db:seed`; local ports admin `3000`, API `4000`, mobile `8081`, PostgreSQL `5432`, Redis `6379`, and MinIO `9000`.

- [ ] **Step 1: Initialize Git and pnpm, then pin the package manager**

  Run:

  ```powershell
  git init
  corepack enable
  corepack prepare pnpm@latest --activate
  pnpm --version
  ```

  Expected: a new Git repository and a printable stable pnpm version. Copy that exact version into `package.json` as `"packageManager": "pnpm@<printed-version>"`.

- [ ] **Step 2: Create the root workspace scripts and shared TypeScript settings**

  Use `pnpm-workspace.yaml` packages `apps/*` and `packages/*`. Root scripts must use `pnpm -r --if-present` for `dev`, `lint`, `typecheck`, and `test`; `test:e2e` targets API and mobile packages; `db:migrate` runs `prisma migrate dev`; `db:seed` runs `prisma db seed`. Set `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `moduleResolution: Bundler`, and `target: ES2022` in `tsconfig.base.json`.

- [ ] **Step 3: Add the local infrastructure contract**

  Create Docker Compose services named `postgres`, `redis`, and `minio`, with health checks and named volumes. Set PostgreSQL database/user/password to `pastlife`, Redis URL to `redis://localhost:6379`, and MinIO credentials only to explicit local-development values.

  `.env.example` must contain:

  ```dotenv
  DATABASE_URL=postgresql://pastlife:pastlife@localhost:5432/pastlife?schema=public
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=replace-in-non-local-environments
  GOOGLE_CLIENT_ID=
  ADMOB_APP_ID=test
  ADMOB_SLOT_1=test-slot-1
  ADMOB_SLOT_2=test-slot-2
  ADMOB_SLOT_3=test-slot-3
  AI_TEXT_API_KEY=
  AI_IMAGE_API_KEY=
  S3_ENDPOINT=http://localhost:9000
  S3_BUCKET=pastlife-private
  S3_ACCESS_KEY=pastlife-local
  S3_SECRET_KEY=pastlife-local-secret
  CONTENT_VERSION=2.0.0
  EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
  ```

- [ ] **Step 4: Add minimal admin and worker processes**

  The admin page renders `전생록 관리자 — 다음 구현 단계에서 활성화됩니다.` and the worker prints one startup line stating synchronous provider fallbacks are active. Do not add content editing, queue processing, or authentication in this slice.

- [ ] **Step 5: Install and verify workspace tooling**

  Run:

  ```powershell
  pnpm install
  pnpm typecheck
  ```

  Expected: installation completes with a lockfile and typecheck exits `0` for the scaffolded packages.

- [ ] **Step 6: Commit the independently runnable scaffold**

  ```powershell
  git add package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json .gitignore .env.example infra apps/admin apps/worker packages/config
  git commit -m "chore: bootstrap past life archive monorepo"
  ```

## Task 2: Convert the canonical questions into validated content data

**Files:**
- Create: `packages/content/package.json`
- Create: `packages/content/src/types.ts`
- Create: `packages/content/src/index.ts`
- Create: `packages/content/src/catalogs.ts`
- Create: `packages/content/src/generated/questions.ko.json`
- Create: `packages/content/scripts/extract-questions.mjs`
- Create: `packages/content/test/content.test.ts`

**Interfaces:**
- Consumes: Appendix A headings and tables from `전생록_Codex_개발_착수_명세.md`.
- Produces: `questions: Question[]`, `questionsByStage(stage, sessionSeed, contentVersion): Question`, `tags`, `axes`, and starter compatible result catalogs.

- [ ] **Step 1: Write the failing content integrity test**

  Define these assertions in `content.test.ts`:

  ```ts
  expect(questions).toHaveLength(36);
  expect(new Set(questions.map((q) => q.id)).size).toBe(36);
  expect(questions.every((q) => q.choices.length === 6)).toBe(true);
  expect(new Set(questions.flatMap((q) => q.choices.map((c) => c.id))).size).toBe(216);
  expect(questions.every((q) => q.choices.every((c) => c.tagScores.length >= 2))).toBe(true);
  expect(questions.every((q) => q.choices.every((c) => c.tagScores.every((s) => s.score >= 1 && s.score <= 3)))).toBe(true);
  expect(questions.every((q) => q.choices.every((c) => c.axisScores.every((s) => s.score >= -2 && s.score <= 2)))).toBe(true);
  ```

  Run: `pnpm --filter @pastlife/content test`

  Expected: FAIL because the content module and generated JSON do not exist.

- [ ] **Step 2: Define the content types and the 18-tag/six-axis allowlists**

  `Choice` has `id`, `text`, `displayOrder`, `tagScores: { tag: CoreTag; score: 1 | 2 | 3 }[]`, and `axisScores: { axis: AxisCode; score: -2 | -1 | 0 | 1 | 2 }[]`. `Question` has `id`, `stage: 1 | 2 | 3 | 4 | 5 | 6`, `text`, and exactly six ordered choices at runtime validation.

- [ ] **Step 3: Implement the deterministic Appendix A extractor**

  The script must read UTF-8, start at `## 부록 A`, parse `#### Qn_nn` headings and subsequent `Qn_nn_Cn` table rows, split score tokens inside the final parentheses, classify the 18 named core tags versus the six named axes, preserve Korean text, and reject unknown tokens or duplicate IDs. It writes only `src/generated/questions.ko.json` with stable two-space formatting.

  Run: `node packages/content/scripts/extract-questions.mjs 전생록_Codex_개발_착수_명세.md`

  Expected: `36 questions and 216 choices written`.

- [ ] **Step 4: Add minimum compatible result catalogs**

  In `catalogs.ts`, define all eight era IDs, eight region IDs, at least one historically valid location and occupation path per era/region fallback branch, personality, relationship, event, last-memory, and seven basic narrative templates. Every candidate has an immutable ID and explicit compatibility fields; no catalog copy lives in mobile screens.

- [ ] **Step 5: Make seeded question selection deterministic**

  `questionsByStage` filters six candidates for the stage, hashes `${sessionSeed}:${contentVersion}:stage:${stage}`, and indexes the stable ID-sorted array. The same inputs must always return the same question.

- [ ] **Step 6: Run content validation and commit**

  Run:

  ```powershell
  pnpm --filter @pastlife/content test
  pnpm --filter @pastlife/content typecheck
  ```

  Expected: all integrity and deterministic-selection tests pass.

  ```powershell
  git add packages/content
  git commit -m "feat: add canonical question and result content"
  ```

## Task 3: Implement the pure deterministic scoring engine

**Files:**
- Create: `packages/scoring/package.json`
- Create: `packages/scoring/src/types.ts`
- Create: `packages/scoring/src/hash.ts`
- Create: `packages/scoring/src/prng.ts`
- Create: `packages/scoring/src/score.ts`
- Create: `packages/scoring/src/filter.ts`
- Create: `packages/scoring/src/result.ts`
- Create: `packages/scoring/src/index.ts`
- Create: `packages/scoring/test/score.test.ts`
- Create: `packages/scoring/test/determinism.test.ts`
- Create: `packages/scoring/test/fallback.test.ts`

**Interfaces:**
- Consumes: `Question[]`, six `{ stage, questionId, choiceId }` answers, `sessionSeed`, `contentVersion`, and compatible catalogs.
- Produces: `answerHash(answers): string`, `calculateResult(input): ResultCore`, and `selectQuestionForStage(...)` re-export.

- [ ] **Step 1: Write failing weighted-score tests**

  Assert answers are sorted by stage before hashing, stages use weights `{1:1.3,2:1.3,3:1.4,4:1.4,5:1.3,6:1.5}`, tag/axis totals are numeric and stable, and the four top tags use score descending then tag-code ascending for ties.

  Run: `pnpm --filter @pastlife/scoring test -- score.test.ts`

  Expected: FAIL because score functions are absent.

- [ ] **Step 2: Implement canonical hashing and seeded weighted choice**

  Serialize only stable ordered IDs and version, hash with SHA-256, seed a small deterministic PRNG from the first 32 hash bits, and select candidates after sorting by immutable ID. Never use `Math.random`, timestamps, locale ordering, or database row order.

- [ ] **Step 3: Implement score aggregation and compatibility filters**

  Reject fewer/more than six answers, duplicate stages, question/choice mismatches, or choices outside the published version. Narrow eras and regions to at most three, intersect historical locations, then filter occupations by era/location/class before filtering personality, relationship, event, and last memory.

- [ ] **Step 4: Implement the explicit fallback hierarchy**

  If a candidate level is empty: keep era and relax region score threshold; then keep region and relax secondary tag thresholds; then choose the catalog's explicit `fallback: true` candidate. Never produce an era/location/occupation mismatch, and never return an empty candidate set.

- [ ] **Step 5: Assemble immutable `ResultCore`**

  Include `contentVersion`, sorted score summaries, `eraId`, `regionId`, `locationId`, `classId`, `occupationId`, `personalityId`, `relationshipId`, `eventId`, `lastMemoryId`, seven `basicBlockIds`, library image attributes, and a stable anonymous `recordNo` from `01` to `99` derived from `answerHash`.

- [ ] **Step 6: Prove determinism and fallback behavior**

  Run the same input 100 times and deep-equal every `ResultCore`; reorder answers and expect the same hash/result; change one choice and expect a different hash; run extreme all-risk and all-calm fixtures and assert valid compatible outputs.

  Run: `pnpm --filter @pastlife/scoring test`

  Expected: all score, determinism, and fallback tests pass.

- [ ] **Step 7: Commit the scoring boundary**

  ```powershell
  git add packages/scoring
  git commit -m "feat: add deterministic past life scoring engine"
  ```

## Task 4: Add Prisma persistence, migration, and canonical seed

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `prisma/migrations/<timestamp>_initial/migration.sql`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/test/database-constraints.e2e-spec.ts`

**Interfaces:**
- Consumes: `@pastlife/content` generated data and catalogs.
- Produces: Prisma models for `ContentVersion`, `Question`, `Choice`, `Tag`, `ChoiceTagScore`, `ChoiceAxisScore`, `Era`, `Region`, `HistoricalLocation`, `SocialClass`, `Occupation`, `OccupationRule`, `Personality`, `Relationship`, `LifeEvent`, `LastMemory`, `Session`, `SessionAnswer`, `Result`, `ResultText`, `ResultImage`, `AdEvent`, and `SessionUnlock`.

- [ ] **Step 1: Write failing database constraint tests**

  Test uniqueness of `(sessionId, stage)`, `(answerHash, contentVersion)`, `(sessionId, unlockType)`, and `providerEventId`; test cascade/restrict behavior so a published content row cannot be silently removed.

- [ ] **Step 2: Define enums and relational constraints**

  Include all state names from section 13 needed by the slice: `CREATED`, `QUESTION_IN_PROGRESS`, `QUESTION_COMPLETE`, `CALCULATING`, `NARRATIVE_GENERATING`, `RESULT_READY`, `BASIC_UNLOCKED`, and `FAILED`. Store `coreJson` as JSON only after relational candidate validation, and index `answerHash, contentVersion`.

- [ ] **Step 3: Create and inspect the initial migration**

  Run:

  ```powershell
  docker compose -f infra/docker-compose.yml up -d postgres redis minio
  Copy-Item .env.example .env
  pnpm db:migrate --name initial
  ```

  Expected: migration succeeds and the SQL contains all named unique constraints.

- [ ] **Step 4: Seed transactionally and idempotently**

  Upsert content version `2.0.0`, 18 tags, 36 questions, 216 choices, their tag/axis scores, and starter result catalogs in one transaction. Refuse to mutate a published version whose generated content digest changed; require a new version instead.

- [ ] **Step 5: Verify exact seed counts and constraints**

  Run:

  ```powershell
  pnpm db:seed
  pnpm --filter @pastlife/api test:e2e -- database-constraints.e2e-spec.ts
  ```

  Expected: counts are exactly `36` and `216`, a second seed is a no-op success, and all uniqueness tests pass.

- [ ] **Step 6: Commit schema and seed**

  ```powershell
  git add prisma apps/api/src/prisma apps/api/test/database-constraints.e2e-spec.ts
  git commit -m "feat: persist versioned content and session data"
  ```

## Task 5: Implement shared contracts, provider fallbacks, and the NestJS vertical API

**Files:**
- Create: `packages/contracts/src/{index.ts,session.ts,result.ts,error.ts}`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/providers/{ad.provider.ts,fake-ad.provider.ts,narrative.provider.ts,template-narrative.provider.ts,image.provider.ts,library-image.provider.ts}`
- Create: `apps/api/src/sessions/{sessions.module.ts,sessions.controller.ts,sessions.service.ts}`
- Create: `apps/api/src/results/{results.module.ts,results.controller.ts,results.service.ts}`
- Create: `apps/api/src/ads/{ads.module.ts,ads.controller.ts,ads.service.ts}`
- Create: `apps/api/test/vertical-flow.e2e-spec.ts`
- Create: `docs/openapi.yaml`

**Interfaces:**
- Consumes: Prisma service, `calculateResult`, content selectors, `CONTENT_VERSION`.
- Produces: exact `/api/v1` endpoints and Zod-validated request/response types used by mobile.

- [ ] **Step 1: Write the failing vertical API test**

  Cover this exact sequence: create anonymous session; retrieve stages 1–6; PUT a matching choice for each stage; call complete three times and receive one `resultId`; observe `RESULT_READY`; GET basic and receive `403 UNLOCK_REQUIRED`; POST fake AD 1 completion twice using one `providerEventId`; GET basic and receive seven blocks plus the required disclaimer.

  Run: `pnpm --filter @pastlife/api test:e2e -- vertical-flow.e2e-spec.ts`

  Expected: FAIL because routes do not exist.

- [ ] **Step 2: Define shared Zod contracts and errors**

  Export schemas for `CreateSessionResponse`, `QuestionResponse`, `SaveAnswerRequest`, `ProgressResponse`, `CompleteResponse`, `ResultStatusResponse`, `AdCompletionRequest`, `UnlockResponse`, and `BasicResultResponse`. Export error codes `VALIDATION_ERROR`, `SESSION_EXPIRED`, `INVALID_STATE`, `UNLOCK_REQUIRED`, `AD_NOT_VERIFIED`, `RESULT_NOT_READY`, `RATE_LIMITED`, and `GENERATION_FAILED`.

- [ ] **Step 3: Implement session creation, question retrieval, and answer upsert**

  Create cryptographically random `anonymousId` and `seed`, default locale `ko`, expiry, and `CREATED` status. Question lookup returns only public IDs/text/order. Answer PUT validates that the supplied question is the deterministic stage question and the choice belongs to it, upserts before completion, and returns answered stages.

- [ ] **Step 4: Implement idempotent completion and result status**

  In one transaction, lock six answers, compute canonical `answerHash`, reuse an existing `(answerHash, contentVersion)` snapshot when allowed by the schema, otherwise calculate and save one result, generate seven template narrative blocks, attach the library image, and transition to `RESULT_READY`. Repeated completion for the same session always returns its original `resultId`.

- [ ] **Step 5: Implement AD 1 verification and server unlock**

  `AdProvider` exposes `load(slot)`, `show(slot)`, and `verifyCompletion(event)`. `FakeAdProvider` accepts only configured test provider event IDs, records `AdEvent` uniquely, upserts one `BASIC` unlock, and transitions the session to `BASIC_UNLOCKED`; duplicate callbacks return the existing unlock.

- [ ] **Step 6: Protect and assemble the seven basic blocks**

  Before BASIC unlock, return HTTP `403` with `{ code: "UNLOCK_REQUIRED", slot: 1 }`. After unlock, map immutable IDs in `ResultCore` through `TemplateNarrativeProvider`, return a library image descriptor from `LibraryImageProvider`, seven ordered blocks, record number, and the exact required disclaimer from section 2.2.

- [ ] **Step 7: Generate OpenAPI and run API checks**

  Run:

  ```powershell
  pnpm --filter @pastlife/api lint
  pnpm --filter @pastlife/api typecheck
  pnpm --filter @pastlife/api test
  pnpm --filter @pastlife/api test:e2e
  ```

  Expected: all checks pass; the vertical test proves T01, T02, and T05 for the implemented slice.

- [ ] **Step 8: Commit the server vertical slice**

  ```powershell
  git add packages/contracts apps/api docs/openapi.yaml
  git commit -m "feat: add anonymous assessment and basic result API"
  ```

## Task 6: Implement the Expo mobile flow from SCR 001 through SCR 300

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/index.tsx`
- Create: `apps/mobile/app/guide.tsx`
- Create: `apps/mobile/app/question/[stage].tsx`
- Create: `apps/mobile/app/analysis.tsx`
- Create: `apps/mobile/app/result.tsx`
- Create: `apps/mobile/src/api/client.ts`
- Create: `apps/mobile/src/session/store.ts`
- Create: `apps/mobile/src/theme/tokens.ts`
- Create: `apps/mobile/src/components/{Screen.tsx,PrimaryButton.tsx,ProgressBar.tsx,ChoiceButton.tsx,ResultBlock.tsx}`
- Create: `apps/mobile/src/__tests__/vertical-flow.test.tsx`

**Interfaces:**
- Consumes: `@pastlife/contracts`, `EXPO_PUBLIC_API_URL`, and the API endpoints from Task 5.
- Produces: accessible navigation `SCR 001 → SCR 002 → SCR 101…106 → SCR 200 → fake AD 1 → SCR 300` with resumable IDs stored locally.

- [ ] **Step 1: Write the failing screen-flow test**

  Mock only HTTP at the network boundary. Assert the start CTA creates a session, the guide CTA opens stage 1, each question renders exactly six accessible buttons, selection saves before navigation, analysis completes once and polls status, fake AD 1 completes, and result renders seven blocks and disclaimer.

  Run: `pnpm --filter @pastlife/mobile test -- vertical-flow.test.tsx`

  Expected: FAIL because screens do not exist.

- [ ] **Step 2: Add theme tokens and reusable accessible controls**

  Use charcoal/navy backgrounds, one gold accent, AA text colors, spacing tokens, `minHeight: 44`, `accessibilityRole`, descriptive labels, unrestricted font scaling, visible focus/pressed states, and reduced-motion checks before any transition animation.

- [ ] **Step 3: Build SCR 001 and SCR 002**

  `SCR 001` shows `전생록`, the canonical main copy, and `내 전생 찾아보기`; it creates a session and stores `sessionId`, `seed`, and `contentVersion`. `SCR 002` shows the canonical intuition guidance and one `질문 시작하기` CTA.

- [ ] **Step 4: Build SCR 101–SCR 106 as one parameterized route**

  Fetch the server-selected question for the numeric stage, show `stage/6`, render six ordered choices, disable repeat taps while PUT is pending, persist pending `{stage, choiceId}` locally, and move forward only after success. Permit backward navigation before completion without computing or exposing scores.

- [ ] **Step 5: Build SCR 200 with recovery-safe completion**

  Show `당신의 전생 기록을 복원하고 있습니다`, call complete once per stored session, persist `resultId` immediately, poll status with bounded exponential backoff, offer retry without creating a new session/result, then invoke the fake AD 1 flow.

- [ ] **Step 6: Build SCR 300 basic result**

  Fetch protected basic data, render library image metadata, record number, seven ordered result cards, the deep-content CTA in a disabled `다음 단계에서 제공` state, and the exact disclaimer. Do not implement deep results, guide, AI image, login, archive, save, or share controls in this slice.

- [ ] **Step 7: Verify tests, types, and Expo exportability**

  Run:

  ```powershell
  pnpm --filter @pastlife/mobile test
  pnpm --filter @pastlife/mobile typecheck
  pnpm --filter @pastlife/mobile exec expo export --platform web
  ```

  Expected: the component flow passes, typecheck exits `0`, and Expo produces a web export without missing routes or assets.

- [ ] **Step 8: Commit the mobile vertical slice**

  ```powershell
  git add apps/mobile
  git commit -m "feat: add mobile assessment to basic result flow"
  ```

## Task 7: Run whole-repository verification and document the handoff

**Files:**
- Create: `README.md`
- Create: `docs/first-slice-report.md`
- Modify: `.env.example`

**Interfaces:**
- Consumes: all runnable applications, packages, migrations, and tests from Tasks 1–6.
- Produces: reproducible setup/run instructions and the exact D.7 completion report.

- [ ] **Step 1: Run clean setup from documented commands**

  Run:

  ```powershell
  pnpm install --frozen-lockfile
  docker compose -f infra/docker-compose.yml up -d
  pnpm db:migrate
  pnpm db:seed
  ```

  Expected: services become healthy, migrations apply, and the seed reports 36 questions and 216 choices.

- [ ] **Step 2: Run all static and automated checks**

  Run:

  ```powershell
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm test:e2e
  ```

  Expected: every command exits `0`; record exact test counts and durations in `docs/first-slice-report.md`.

- [ ] **Step 3: Smoke-test the real local process boundary**

  Start `pnpm dev`, open Expo web/mobile, complete six selections, verify the analysis state, fake AD 1, seven basic blocks, record number, library image, and disclaimer. Restart mobile and verify stored `resultId` returns to the same basic result.

- [ ] **Step 4: Write the implementation report**

  List implemented screens (`SCR 001`, `SCR 002`, `SCR 101`–`106`, `SCR 200`, `SCR 300`), endpoints, tables, requirements, commands, required environment variables, exact test results, and providers (`FakeAdProvider`, `TemplateNarrativeProvider`, `LibraryImageProvider`). Clearly separate remaining AD 2/3, deep results, guide, AI image, auth/archive, sharing, production providers, admin functionality, worker queues, full catalog expansion, and release validation.

- [ ] **Step 5: Commit the verified handoff**

  ```powershell
  git add README.md docs/first-slice-report.md .env.example
  git commit -m "docs: add first vertical slice runbook and report"
  ```

## Self-Review Results

- Spec coverage: all Appendix D.5 items map to Tasks 1–7; AD 1 is included because SCR 200 to SCR 300 requires the server unlock boundary. Later-scope AD 2/3, deep/guide, auth/archive, generated images, sharing, full admin, and real providers are explicitly excluded.
- Content coverage: Appendix A remains the canonical source; extraction preserves all IDs, produces exactly 36/216 records, and validates scores before database seed.
- Reproducibility: question selection, answer hashing, candidate order, fallback selection, result core, result ID reuse, and record number each have an explicit deterministic rule and test.
- Type consistency: `Question`, `Choice`, `ResultCore`, shared Zod schemas, Prisma JSON snapshots, and mobile API consumption follow one direction: content → scoring → API → mobile.
- Placeholder scan: the plan contains no `TBD`, `TODO`, or unspecified error/test steps; deliberately deferred product features are named as out of scope rather than implementation placeholders.
