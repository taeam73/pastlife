# Browser E2E and Admin Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the complete mobile result journey and the administrator draft/publish/rollback journey repeatable in Chromium locally and in CI.

**Architecture:** Keep the Nest API as the single behavior boundary and run browser tests against isolated in-memory API state. Add token-aware admin fetch helpers and expose publish history, rollback, and audit state in the Next.js console. A root Playwright configuration starts API, Expo web, and Next.js together and separates mobile and admin projects.

**Tech Stack:** TypeScript, NestJS 11, Expo Router 57 web, Next.js 15, Playwright Test, GitHub Actions.

## Global Constraints

- Browser E2E must never read or mutate the configured Neon database.
- E2E API always runs with `USE_IN_MEMORY_DB=true` and a fixed test-only `ADMIN_TOKEN`.
- Selectors use accessible roles and Korean visible labels rather than CSS implementation details.
- Failure artifacts live under `output/playwright/`; generated reports and artifacts are ignored by Git.
- Existing unit, API E2E, typecheck, Prisma validation, and Expo export checks must continue to pass.

---

### Task 1: Complete the token-aware admin console

**Files:**
- Create: `apps/admin/src/lib/admin-api.ts`
- Modify: `apps/admin/src/app/page.tsx`
- Test: `e2e/admin-console.spec.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_API_URL`, user-entered `ADMIN_TOKEN`, existing `/admin/content/*` routes.
- Produces: `createAdminClient(token)` with summary, questions, draft, publish, history, rollback, and audit methods.

- [ ] **Step 1: Write the browser expectations**

Assert that the console initially shows `관리자 토큰`, accepts the fixed E2E token, renders `질문 36`, saves `Q1_01`, publishes one draft, rolls the matching digest back, and displays `DRAFT_SAVED`, `PUBLISHED`, and `ROLLBACK_PREPARED` audit actions.

- [ ] **Step 2: Verify the test fails**

Run: `corepack pnpm exec playwright test e2e/admin-console.spec.ts --project=admin`

Expected: FAIL because the authenticated login and rollback/audit controls do not exist.

- [ ] **Step 3: Implement the API client and console states**

`createAdminClient(token)` adds `x-admin-token` and JSON headers, throws the API message for non-2xx responses, and exposes typed methods. The page stores the token only in `sessionStorage`, renders a login form before loading protected data, refreshes history/audit after mutations, and supplies labeled draft, publish, rollback, refresh, and logout controls.

- [ ] **Step 4: Run admin typecheck and browser test**

Run: `corepack pnpm --filter @pastlife/admin typecheck` and the Task 1 Playwright command.

Expected: both exit `0`.

- [ ] **Step 5: Commit**

Commit message: `feat: complete authenticated admin content console`.

### Task 2: Add the Playwright browser harness and mobile journey

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/mobile-journey.spec.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: API port `4000`, Expo web port `8081`, admin port `3000`.
- Produces: root `test:e2e:browser` script and Playwright projects named `mobile` and `admin`.

- [ ] **Step 1: Add Playwright Test and configuration**

Add `@playwright/test` as a root dev dependency. Configure Chromium, failure-only screenshots, retained failure traces, `output/playwright/test-results`, and three `webServer` processes. Pass `USE_IN_MEMORY_DB=true`, `ADMIN_TOKEN=e2e-admin-token`, and local API URLs through process environments.

- [ ] **Step 2: Write the mobile journey test**

Navigate from `/` through `내 전생 찾아보기`, `질문 시작하기`, six first-choice answers, result restoration, archive save/list, deep unlock, and present-guide unlock. Assert the seven basic blocks indirectly through the stable result heading/disclaimer, then assert `심화 내용`, `현생 가이드`, and the archive record.

- [ ] **Step 3: Run the mobile browser test**

Run: `corepack pnpm exec playwright test e2e/mobile-journey.spec.ts --project=mobile`.

Expected: one Chromium test passes.

- [ ] **Step 4: Run both Playwright projects**

Run: `corepack pnpm test:e2e:browser`.

Expected: mobile and admin tests both pass.

- [ ] **Step 5: Commit**

Commit message: `test: add mobile and admin browser journeys`.

### Task 3: Add CI and stage documentation

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `docs/eighth-stage-report.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: root typecheck/test/API E2E/browser E2E scripts.
- Produces: a pull-request/push workflow with Chromium installation and failure artifacts.

- [ ] **Step 1: Add the workflow**

On pushes and pull requests, install Node 24 and pnpm through Corepack, run `pnpm install --frozen-lockfile`, typecheck, unit tests, API E2E, install Chromium with dependencies, and run browser E2E. Upload `output/playwright/` only on failure.

- [ ] **Step 2: Document local commands and results**

Add `corepack pnpm test:e2e:browser` to the README and record implemented flows, verification results, limitations, and next external-provider work in `docs/eighth-stage-report.md`.

- [ ] **Step 3: Run the full repository verification**

Run: `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm test:e2e`, `corepack pnpm test:e2e:browser`, Prisma validate using `.env`, and Expo web export.

Expected: every command exits `0`; browser E2E reports two passing tests.

- [ ] **Step 4: Commit and push the stage branch**

Commit message: `ci: verify browser journeys` and push `feat/stage-7-runtime-readiness`.

## Self-Review Results

- Spec coverage: mobile full journey, admin authentication/draft/publish/rollback/audit, local repeatability, and CI execution are assigned to explicit tasks.
- Placeholder scan: no implementation placeholders remain; external real providers are intentionally outside this stage.
- Type consistency: admin client method names and Playwright project names are used consistently across tasks.
