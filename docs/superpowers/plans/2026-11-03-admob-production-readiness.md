# AdMob Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Past Life Archive for production AdMob, publish seller authorization, verify rewarded-ad SSV, and produce a store-signed build that can be safely exercised on a registered Android test device.

**Architecture:** Keep Google demo units in the existing preview/internal-test build, while adding a separate production-candidate build path that injects the three real AdMob identifiers and an explicit test-device identifier. Publish `app-ads.txt` through the existing Cloudflare static-assets pipeline. Deploy the production API only after all required external configuration is present, then use its public `/api/v1/ads/admob/ssv` endpoint as the rewarded-ad callback.

**Tech Stack:** Expo 57, React Native 0.86, `react-native-google-mobile-ads` 17.4, NestJS, Google Cloud Run, Cloudflare Pages, AdMob, Google Play closed testing.

## Global Constraints

- AdMob account verification is currently pending; Google says this normally completes within 24 hours and may take up to two weeks.
- Google Play store linking cannot complete while `com.pastlife.archive` is unavailable in public Play search; retry immediately after production publication.
- Never click a live ad during development or testing.
- Preview and existing Play internal builds must continue using Google demo ad units and the development API.
- The production-candidate build must use real AdMob IDs but must register the physical Android device as a test device before any ad request.
- Real rewarded unlocks must be granted only after the production API verifies AdMob SSV; client-side fake completion remains disabled in production.
- Production deployment must fail closed until `PASTLIFE_PROD_GOOGLE_CLIENT_IDS` is supplied with a real Google OAuth client ID already owned by this project.
- Existing untracked `marketing/` files must not be added, changed, or deleted.

---

### Task 1: Publish AdMob seller authorization

**Files:**
- Create: `scripts/static-pages/app-ads.txt`
- Modify: `scripts/build-static-assets.mjs`
- Modify: `scripts/build-static-assets.test.mjs`
- Modify: `docs/staging-runbook.md`

**Interfaces:**
- Consumes: AdMob publisher ID `pub-4438190626695994`.
- Produces: public `https://pastlife-assets.pages.dev/app-ads.txt` with HTTP 200 and plain-text seller declaration.

- [ ] **Step 1: Add the failing static-assets assertions**

Add these assertions to `scripts/build-static-assets.test.mjs` after the privacy-page assertion:

```js
assert.equal(
  await readFile(path.join(output, 'app-ads.txt'), 'utf8'),
  'google.com, pub-4438190626695994, DIRECT, f08c47fec0942fa0\n',
);
assert.match(await readFile(path.join(output, '_headers'), 'utf8'), /\/app-ads\.txt[\s\S]*text\/plain/u);
```

- [ ] **Step 2: Run the asset test and verify it fails**

Run: `corepack pnpm assets:test`

Expected: FAIL because `output/app-ads.txt` does not exist.

- [ ] **Step 3: Add the seller file and copy rule**

Create `scripts/static-pages/app-ads.txt` with exactly:

```text
google.com, pub-4438190626695994, DIRECT, f08c47fec0942fa0
```

In `buildStaticAssets()`, copy that file to `dist/static/app-ads.txt` and add this `_headers` entry:

```text
/app-ads.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=300
```

- [ ] **Step 4: Run focused and full verification**

Run:

```powershell
corepack pnpm assets:test
corepack pnpm assets:build
corepack pnpm typecheck
corepack pnpm test
```

Expected: all commands PASS; `dist/static/app-ads.txt` contains one valid Google DIRECT record.

- [ ] **Step 5: Commit and deploy static assets only**

```powershell
git add scripts/static-pages/app-ads.txt scripts/build-static-assets.mjs scripts/build-static-assets.test.mjs docs/staging-runbook.md
git commit -m "feat: publish AdMob seller authorization"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment dev -AssetsOnly
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -AssetsOnly -ConfirmProduction
```

Expected: both deployments pass; `Invoke-WebRequest https://pastlife-assets.pages.dev/app-ads.txt` returns HTTP 200 and the exact seller line.

### Task 2: Add a fail-closed AdMob test-device configuration

**Files:**
- Create: `apps/mobile/src/ads/config.ts`
- Create: `apps/mobile/src/ads/config.test.ts`
- Modify: `apps/mobile/src/ads/admob.ts`
- Modify: `apps/mobile/app.config.js`

**Interfaces:**
- Consumes: `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS`, a comma-separated list of device hashes supplied only to a QA build.
- Produces: `resolveAdMobRequestConfiguration(env)` returning `{ maxAdContentRating, testDeviceIdentifiers }`, and a production-build guard that rejects demo IDs or unregistered production-candidate testing.

- [ ] **Step 1: Write configuration tests**

Create `apps/mobile/src/ads/config.test.ts` with cases that assert:

```ts
expect(parseTestDeviceIds('ABC, DEF,ABC')).toEqual(['ABC', 'DEF']);
expect(parseTestDeviceIds('')).toEqual([]);
expect(() => assertAdMobBuildConfig({ profile: 'production-candidate', appId: 'ca-app-pub-4438190626695994~5289298698', interstitialId: 'ca-app-pub-4438190626695994/3054017591', rewardedId: 'ca-app-pub-4438190626695994/3884717688', testDeviceIds: '' })).toThrow(/test device/u);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `corepack pnpm --filter @pastlife/mobile test -- src/ads/config.test.ts`

Expected: FAIL because the configuration module does not exist.

- [ ] **Step 3: Implement deterministic parsing and validation**

Create `config.ts` with pure functions that trim, de-duplicate, and reject whitespace-containing device hashes. Export `parseTestDeviceIds(value?: string): string[]` and `assertAdMobBuildConfig(input): void`. Keep all three existing AdMob IDs unchanged.

Update `admob.ts` to call:

```ts
await mobileAds().setRequestConfiguration({
  maxAdContentRating: MaxAdContentRating.T,
  testDeviceIdentifiers: parseTestDeviceIds(process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS),
});
```

Update `app.config.js` so profile `production-candidate` requires the three real IDs, `EXPO_PUBLIC_ADMOB_TEST_ADS !== 'true'`, and at least one test-device ID. The existing `production` profile requires real IDs but must not require a test-device ID.

- [ ] **Step 4: Verify mobile and repository tests**

Run:

```powershell
corepack pnpm --filter @pastlife/mobile test
corepack pnpm --filter @pastlife/mobile typecheck
corepack pnpm typecheck
corepack pnpm test
```

Expected: all commands PASS.

- [ ] **Step 5: Commit**

```powershell
git add apps/mobile/src/ads/config.ts apps/mobile/src/ads/config.test.ts apps/mobile/src/ads/admob.ts apps/mobile/app.config.js
git commit -m "feat: add safe AdMob test-device mode"
```

### Task 3: Add a signed production-candidate Android build

**Files:**
- Create: `scripts/build-android-admob-candidate-local.ps1`
- Create: `scripts/build-android-admob-candidate.test.mjs`
- Modify: `package.json`
- Modify: `docs/android-local-build.md`

**Interfaces:**
- Consumes: user-scoped environment variables `PASTLIFE_PROD_API_URL`, `PASTLIFE_PROD_ADMOB_APP_ID`, `PASTLIFE_PROD_ADMOB_INTERSTITIAL_UNIT_ID`, `PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID`, and `PASTLIFE_ADMOB_TEST_DEVICE_IDS`.
- Produces: `output/pastlife-admob-candidate-<version>-build<versionCode>.apk`, signed with the existing Play upload keystore and restricted to configured test devices.

- [ ] **Step 1: Write script-source tests**

Assert that the new script rejects missing variables, rejects Google demo IDs, sets `EAS_BUILD_PROFILE=production-candidate`, maps the five user variables to their `EXPO_PUBLIC_*` equivalents, and never sets `EXPO_PUBLIC_ADMOB_TEST_ADS=true`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test scripts/build-android-admob-candidate.test.mjs`

Expected: FAIL because the build script does not exist.

- [ ] **Step 3: Implement the candidate build wrapper**

Reuse the short-path, JDK, Android SDK, and signing flow from `build-android-play-internal-local.ps1`. Stop before Gradle when any required variable is absent or malformed. Build an APK, not an AAB, because this artifact is for direct installation on one registered test device.

- [ ] **Step 4: Add and run verification commands**

Add `admob:candidate:test` to the root scripts and run:

```powershell
corepack pnpm admob:candidate:test
corepack pnpm typecheck
corepack pnpm test
```

Expected: all commands PASS without exposing environment-variable values.

- [ ] **Step 5: Commit**

```powershell
git add scripts/build-android-admob-candidate-local.ps1 scripts/build-android-admob-candidate.test.mjs package.json docs/android-local-build.md
git commit -m "build: add AdMob production candidate APK"
```

### Task 4: Deploy and verify the production API for AdMob SSV

**Files:**
- Modify only if preflight exposes a defect: `scripts/deploy-cloud-run.ps1`
- Modify only if preflight exposes a defect: `scripts/deploy.ps1`
- Test: `apps/api/test/admob-ssv.spec.ts`
- Test: `apps/api/test/ads-config.spec.ts`

**Interfaces:**
- Consumes: existing Secret Manager entries `pastlife-prod-database-url`, `pastlife-prod-direct-url`, `pastlife-prod-jwt-secret`, and `pastlife-prod-admin-token`; real rewarded unit `ca-app-pub-4438190626695994/3884717688`; user-supplied real `PASTLIFE_PROD_GOOGLE_CLIENT_IDS`.
- Produces: `https://<Cloud Run production host>/api/v1/health` and `https://<Cloud Run production host>/api/v1/ads/admob/ssv`.

- [ ] **Step 1: Run read-only production preflight**

Verify that the four Secret Manager names exist and that `PASTLIFE_PROD_GOOGLE_CLIENT_IDS` is set. Never print secret values. If the Google client ID is absent, stop this task and request the real existing ID; do not invent or create one silently.

- [ ] **Step 2: Store the rewarded unit ID as user-scoped deployment configuration**

```powershell
[Environment]::SetEnvironmentVariable('PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID', 'ca-app-pub-4438190626695994/3884717688', 'User')
```

- [ ] **Step 3: Run tests and dry-run deployment**

```powershell
corepack pnpm typecheck
corepack pnpm test
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -DryRun -SkipChecks -ConfirmProduction
```

Expected: PASS and the dry run names `pastlife-api-prod` without printing secret contents.

- [ ] **Step 4: Deploy production API and migrations**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -ConfirmProduction
```

Expected: migration job succeeds, `pastlife-api-prod` becomes Ready, API health returns `{"status":"ok","contentVersion":"3.0.0"}`, and the resolved health URL is saved to `PASTLIFE_PROD_API_HEALTH_URL`.

- [ ] **Step 5: Verify SSV fail-closed behavior before AdMob setup**

Call the SSV URL without a signed query. Expected: HTTP 403 with `AD_NOT_VERIFIED`, proving the public route exists but unsigned rewards are rejected.

### Task 5: Complete AdMob console setup and real-device verification

**Files:**
- Modify: `docs/staging-runbook.md`
- Create: `docs/qa/2026-11-03-admob-device-verification.md`

**Interfaces:**
- Consumes: production API SSV URL, three AdMob IDs, Android test-device hash, signed candidate APK.
- Produces: verified AdMob callback, device test evidence, and a release gate for the next Play build.

- [ ] **Step 1: Configure and verify rewarded SSV in AdMob**

In the existing rewarded unit `마지막 순간 해제 보상형 광고`, set the callback URL to the production `/api/v1/ads/admob/ssv` endpoint. Use AdMob's URL verification, then select `Use verified URL` and save. Do not set fixed custom data in the console; the app supplies signed per-session `customData`.

- [ ] **Step 2: Obtain and register the Android test-device hash**

Install a demo-ad APK first, run one ad request, and capture the Mobile Ads SDK log line that recommends `testDeviceIdentifiers`. Store only the hash in `PASTLIFE_ADMOB_TEST_DEVICE_IDS`; do not store advertising IDs or other device data in Git.

- [ ] **Step 3: Build and install the production-candidate APK**

Set the four non-secret AdMob/API variables and run `scripts/build-android-admob-candidate-local.ps1`. Verify the APK signature, install it with ADB, and confirm every displayed ad is labeled `Test Ad`.

- [ ] **Step 4: Exercise the complete Android path**

Record PASS/FAIL for: six answers; transition interstitial; basic result; completed rewarded ad; SSV unlock of the final moment; early close; no-fill/offline; SSV delay; retry; app restart; Korean/English/Thai/Japanese consent and error text. Never click the ad creative.

- [ ] **Step 5: Publish the QA report and commit**

Document app version, build code, device model/Android version, UTC and Korea timestamps, test-device hash truncated to its final six characters, each scenario result, API health URL host, and any AdMob error codes. Commit only the report and runbook changes:

```powershell
git add docs/staging-runbook.md docs/qa/2026-11-03-admob-device-verification.md
git commit -m "docs: record AdMob device verification"
```

- [ ] **Step 6: Complete post-publication gates**

After the Play production listing becomes publicly searchable, connect `com.pastlife.archive` in AdMob, set the Play developer website to `https://pastlife-assets.pages.dev`, request app-ads.txt recrawl, and wait for AdMob app readiness approval. Do not count advertising as production-ready before these statuses are approved.

## Self-Review

- Spec coverage: seller authorization, real identifiers, test-device safety, production API, SSV, device QA, store linkage, and delayed Google approvals each have an explicit task.
- Placeholder scan: external values that do not yet exist are represented as fail-closed preconditions rather than invented values.
- Type consistency: the plan uses the current environment names and the existing `/api/v1/ads/admob/ssv` endpoint throughout.

