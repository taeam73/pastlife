# Railway API Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the existing NestJS API to an always-on Railway service, expose a verified HTTPS health endpoint, and connect the Android app and AdMob SSV callback to that service.

**Architecture:** Railway builds the repository root with a Dockerfile so pnpm workspace packages, Prisma, and the NestJS API remain in one reproducible image. Neon remains the PostgreSQL provider. Railway runs Prisma migrations before starting the API and exposes the service through a generated HTTPS domain; Expo and AdMob use that same domain.

**Tech Stack:** Node.js 24, pnpm 12, NestJS 11, Prisma 6, PostgreSQL/Neon, Docker, Railway, Expo EAS, Google AdMob SSV

## Global Constraints

- Deploy only `apps/api`; the Expo application remains on EAS and the admin UI is not deployed in this plan.
- Keep development and preview Android builds on Google test ads.
- Require `NODE_ENV=production`, `USE_IN_MEMORY_DB=false`, a Neon pooled `DATABASE_URL`, a Neon direct `DIRECT_URL`, a 32-character-or-longer `JWT_SECRET`, and the real `ADMOB_REWARDED_UNIT_ID` in Railway.
- Never commit database credentials, JWT secrets, admin tokens, OAuth credentials, or service access keys.
- Use `https://<railway-domain>/api/v1/ads/admob/ssv` as the AdMob callback only after the health and signature tests pass against the deployed API.

---

### Task 1: Add a production health endpoint

**Files:**
- Create: `apps/api/src/health/health.controller.ts`
- Create: `apps/api/src/health/health.module.ts`
- Create: `apps/api/test/health.spec.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: NestJS global prefix `api/v1` from `apps/api/src/main.ts`.
- Produces: unauthenticated `GET /api/v1/health` returning `{ "status": "ok", "contentVersion": "3.0.0" }` without credentials or infrastructure details.

- [x] **Step 1: Write the failing controller test**

```ts
import { describe, expect, it } from 'vitest';
import { HealthController } from '../src/health/health.controller.js';

describe('HealthController', () => {
  it('returns a sanitized liveness response', () => {
    process.env.CONTENT_VERSION = '3.0.0';
    expect(new HealthController().get()).toEqual({ status: 'ok', contentVersion: '3.0.0' });
  });
});
```

- [x] **Step 2: Run the test and verify it fails because the controller does not exist**

Run: `corepack pnpm --filter @pastlife/api test -- health.spec.ts`

Expected: FAIL with a module resolution error for `health.controller.js`.

- [x] **Step 3: Implement the controller and module**

```ts
// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  get() {
    return { status: 'ok' as const, contentVersion: process.env.CONTENT_VERSION ?? '3.0.0' };
  }
}
```

```ts
// apps/api/src/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';

@Module({ controllers: [HealthController] })
export class HealthModule {}
```

Add `HealthModule` to `AppModule.imports`.

- [x] **Step 4: Run focused and API tests**

Run: `corepack pnpm --filter @pastlife/api test -- health.spec.ts ads-config.spec.ts admob-ssv.spec.ts`

Expected: all API test files pass, including the health and AdMob checks.

- [x] **Step 5: Run the API typecheck**

Run: `corepack pnpm --filter @pastlife/api typecheck`

Expected: exit code 0.

### Task 2: Add a reproducible Railway container

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Modify: `README.md`

**Interfaces:**
- Consumes: root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `apps/api`, shared `packages`, `prisma`, and `scripts/tsx-cli.mjs`.
- Produces: a Node 24 container whose default command starts `@pastlife/api` and binds to Railway's injected `PORT`.

- [x] **Step 1: Add the Dockerfile**

```dockerfile
FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

RUN corepack enable
COPY . .
RUN corepack pnpm install --frozen-lockfile
RUN corepack pnpm exec prisma generate --schema prisma/schema.prisma

EXPOSE 4000
CMD ["corepack", "pnpm", "--filter", "@pastlife/api", "start"]
```

- [x] **Step 2: Add the Docker build context exclusions**

```dockerignore
.git
.env
.env.*
!.env.example
node_modules
.pnpm-store
.expo
.next
coverage
output
*.log
*.tsbuildinfo
```

- [x] **Step 3: Verify the Dockerfile contains no secret values and the required workspace inputs remain in the build context**

Run: `rg -n "DATABASE_URL=|DIRECT_URL=|JWT_SECRET=|ADMIN_TOKEN=" Dockerfile .dockerignore`

Expected: no matches.

- [x] **Step 4: Document the Railway service commands**

Add these exact Railway settings to `README.md`:

```text
Builder: Dockerfile (auto-detected at repository root)
Pre-deploy command: corepack pnpm db:migrate:deploy
Start command: use Dockerfile CMD
Healthcheck path: /api/v1/health
Healthcheck timeout: 300 seconds
Restart policy: Always
```

- [x] **Step 5: Re-run typecheck and deployment configuration tests**

Run: `corepack pnpm typecheck && corepack pnpm test:staging-config`

Expected: both commands exit 0.

### Task 3: Create the Railway service and configure production variables

**Files:**
- Read: `.env.example`
- Read: `.env.neon.example`
- Read: `docs/staging-runbook.md`

**Interfaces:**
- Consumes: GitHub repository `taeam73/pastlife`, the current release branch, Neon pooled/direct URLs, and the real AdMob rewarded unit ID.
- Produces: one Railway service with a generated HTTPS domain and successful `/api/v1/health` response.

- [ ] **Step 1: Push the verified release branch to GitHub**

Run: `git push -u origin feat/stage-7-runtime-readiness`

Expected: GitHub reports the branch was created or updated without rejected commits.

- [ ] **Step 2: Create a Railway project from the GitHub repository**

In Railway, choose `New Project` → `Deploy from GitHub repo` → `taeam73/pastlife`, select branch `feat/stage-7-runtime-readiness`, and create one service named `pastlife-api`.

- [ ] **Step 3: Configure the deployment settings**

Set the pre-deploy command to `corepack pnpm db:migrate:deploy`, healthcheck path to `/api/v1/health`, healthcheck timeout to `300`, and restart policy to `Always`. Keep the Dockerfile start command.

- [ ] **Step 4: Add production variables without copying them into source control**

Set `NODE_ENV=production`, `USE_IN_MEMORY_DB=false`, `CONTENT_VERSION=3.0.0`, the Neon pooled `DATABASE_URL`, Neon direct `DIRECT_URL`, a newly generated 32-character-or-longer `JWT_SECRET`, a separate `ADMIN_TOKEN`, the real `ADMOB_REWARDED_UNIT_ID`, `USE_MOCK_GOOGLE=true` for the first ad-only smoke test, and the current `GOOGLE_PLAY_URL`.

- [ ] **Step 5: Generate a Railway HTTPS domain and deploy**

Expected: deployment status is `Success` and `https://<generated-domain>/api/v1/health` returns HTTP 200 with `{ "status": "ok", "contentVersion": "3.0.0" }`.

- [ ] **Step 6: Verify the database migration state**

Run from Railway's service shell: `corepack pnpm db:migrate:status`

Expected: Prisma reports the database schema is up to date.

### Task 4: Connect Expo preview and AdMob SSV

**Files:**
- Modify: `apps/mobile/eas.json`
- Read: `apps/mobile/app.config.js`
- Read: `apps/mobile/src/ads/admob.ts`

**Interfaces:**
- Consumes: the verified Railway HTTPS domain and existing AdMob app/interstitial/rewarded unit IDs.
- Produces: an Android preview APK that uses Google test ads and the Railway API, followed by a production environment that uses real ad IDs.

- [ ] **Step 1: Add the Railway API URL to the preview build profile**

Set `EXPO_PUBLIC_API_URL` in `build.preview.env` to `https://<generated-domain>/api/v1` while retaining `EXPO_PUBLIC_ADMOB_TEST_ADS=true`.

- [ ] **Step 2: Configure EAS production environment variables**

Create EAS production variables for `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_ADMOB_APP_ID`, `EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID`, `EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID`, and `EXPO_PUBLIC_ADMOB_TEST_ADS=false`.

- [ ] **Step 3: Register the AdMob SSV callback**

In the rewarded ad unit settings, set the callback URL to `https://<generated-domain>/api/v1/ads/admob/ssv`, then run AdMob's SSV test tool.

Expected: the Railway API returns a verified response for a valid Google test callback and rejects altered signatures or mismatched ad units.

- [ ] **Step 4: Build the preview APK**

Run: `npx --yes eas-cli@latest build --platform android --profile preview`

Expected: EAS completes an installable Android APK.

- [ ] **Step 5: Verify the device flow**

On an Android device, complete one Korean assessment, confirm the transition test ad appears, watch the rewarded test ad, confirm `마지막 순간` unlocks only after server confirmation, then repeat app relaunch and archive reopening.

- [ ] **Step 6: Build the production AAB only after AdMob account review and device verification pass**

Run: `npx --yes eas-cli@latest build --platform android --profile production`

Expected: EAS completes an Android App Bundle that passes the production AdMob ID guard.

## Self-Review

- Spec coverage: the plan covers container build, Neon migration, Railway HTTPS deployment, health verification, Expo API wiring, AdMob SSV, test APK, and production AAB.
- Placeholder scan: angle-bracket domain markers occur only where Railway must first generate the value; no code or secret value is left undefined.
- Type consistency: all paths use the existing `api/v1` global prefix, `EXPO_PUBLIC_API_URL`, and `ADMOB_REWARDED_UNIT_ID` names from the current source.
