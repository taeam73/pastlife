# Staging Migration Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely validate and deploy the pending PRD 2.5 database migrations to a confirmed staging PostgreSQL target without exposing connection credentials.

**Architecture:** Add a pure environment inspector and a thin CLI that validates runtime/direct PostgreSQL separation before Prisma is allowed to deploy. Keep read-only status inspection separate from the state-changing deploy command, then verify schema status and application tests after deployment.

**Tech Stack:** Node.js 24, built-in Node test runner, pnpm, Prisma 6, PostgreSQL/Neon, PowerShell.

## Global Constraints

- Never print database usernames, passwords, query tokens, or complete connection URLs.
- `DATABASE_URL` is the API runtime connection and `DIRECT_URL` is the migration connection.
- Neon runtime traffic must use the pooler host; migrations must use the non-pooler host; both require `sslmode=require`.
- Staging must use `USE_IN_MEMORY_DB=false` and `CONTENT_VERSION=2.5.0`.
- `prisma migrate deploy` may run only after the target is positively identified as staging and a backup/recovery point is confirmed.

---

### Task 1: Staging environment preflight

**Files:**
- Create: `scripts/staging-env.mjs`
- Create: `scripts/check-staging-env.mjs`
- Create: `scripts/staging-env.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `DATABASE_URL`, `DIRECT_URL`, `USE_IN_MEMORY_DB`, and `CONTENT_VERSION` from `process.env`.
- Produces: `inspectStagingEnv(env): { runtimeHost: string; migrationHost: string; provider: 'neon' | 'postgresql'; contentVersion: string }`.

- [x] **Step 1: Write failing tests for valid Neon separation and rejected unsafe configurations**

```js
test('accepts pooled runtime and direct migration Neon endpoints', () => {
  assert.deepEqual(inspectStagingEnv(validEnv), {
    runtimeHost: 'ep-demo-pooler.ap-northeast-2.aws.neon.tech',
    migrationHost: 'ep-demo.ap-northeast-2.aws.neon.tech',
    provider: 'neon',
    contentVersion: '2.5.0',
  });
});

test('rejects memory mode, pooler migrations, missing SSL, and wrong content version', () => {
  assert.throws(() => inspectStagingEnv({ ...validEnv, USE_IN_MEMORY_DB: 'true' }));
  assert.throws(() => inspectStagingEnv({ ...validEnv, DIRECT_URL: validEnv.DATABASE_URL }));
  assert.throws(() => inspectStagingEnv({ ...validEnv, CONTENT_VERSION: '2.0.0' }));
});
```

- [x] **Step 2: Run `node --test scripts/staging-env.test.mjs` and verify it fails because the module does not exist**

- [x] **Step 3: Implement URL parsing and validation in `scripts/staging-env.mjs` without returning credentials**

```js
export function inspectStagingEnv(env) {
  if (env.USE_IN_MEMORY_DB !== 'false') throw new Error('USE_IN_MEMORY_DB must be false for staging');
  if (env.CONTENT_VERSION !== '2.5.0') throw new Error('CONTENT_VERSION must be 2.5.0');
  const runtime = parsePostgresUrl(env.DATABASE_URL, 'DATABASE_URL');
  const direct = parsePostgresUrl(env.DIRECT_URL, 'DIRECT_URL');
  // Validate Neon pooler/direct host roles and sslmode=require, then return host names only.
}
```

- [x] **Step 4: Add `scripts/check-staging-env.mjs` that prints only the validated provider and host names**

```js
import { inspectStagingEnv } from './staging-env.mjs';
const result = inspectStagingEnv(process.env);
console.log(`Staging database preflight passed: ${result.provider}`);
console.log(`Runtime host: ${result.runtimeHost}`);
console.log(`Migration host: ${result.migrationHost}`);
console.log(`Content version: ${result.contentVersion}`);
```

- [x] **Step 5: Add and run the non-mutating `staging:preflight`, `test:staging-config`, and `db:migrate:status` scripts; add `db:migrate:deploy` for the confirmed deployment checkpoint**

```json
{
  "staging:preflight": "node --env-file=.env scripts/check-staging-env.mjs",
  "test:staging-config": "node --test scripts/staging-env.test.mjs",
  "db:migrate:status": "corepack pnpm exec prisma migrate status --schema prisma/schema.prisma",
  "db:migrate:deploy": "corepack pnpm exec prisma migrate deploy --schema prisma/schema.prisma"
}
```

Expected: tests pass; preflight prints hosts but no credentials.

### Task 2: Inspect and deploy pending migrations

**Files:**
- Verify: `prisma/migrations/202609170001_prd_2_5/migration.sql`
- Verify: `prisma/migrations/202609170002_analytics_events/migration.sql`

**Interfaces:**
- Consumes: the validated direct staging connection from Task 1.
- Produces: a staging schema with all four repository migrations applied.

- [x] **Step 1: Run `corepack pnpm staging:preflight` and record only the provider and sanitized hosts**

- [x] **Step 2: Run `corepack pnpm db:migrate:status` as a read-only inspection**

Expected: Prisma lists the two 2026-09-17 migrations as pending or reports the schema current.

- [x] **Step 3: Confirm that the sanitized host is the intended staging target and that a recovery point exists**

Expected: positive staging identification before any schema write.

- [x] **Step 4: Run `corepack pnpm db:migrate:deploy`**

Expected: both pending migrations apply successfully; already-applied migrations remain unchanged.

- [x] **Step 5: Run `corepack pnpm db:migrate:status` again**

Expected: `Database schema is up to date!` and all four migrations are applied.

### Task 3: Regression verification and handoff

**Files:**
- Modify: `docs/staging-runbook.md`
- Create: `docs/thirteenth-stage-report.md`

**Interfaces:**
- Consumes: preflight and migration outcomes from Tasks 1–2.
- Produces: repeatable staging deployment instructions and an evidence-backed stage report.

- [x] **Step 1: Document the preflight, status, deploy, and post-deploy status sequence in the runbook**

- [x] **Step 2: Run `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm test:e2e`, Prisma validation, and `git diff --check`**

Expected: all commands pass.

- [x] **Step 3: Record whether deployment completed or stopped at the target-confirmation boundary in `docs/thirteenth-stage-report.md`**

- [x] **Step 4: Review the plan for unchecked work and mark only completed steps**
