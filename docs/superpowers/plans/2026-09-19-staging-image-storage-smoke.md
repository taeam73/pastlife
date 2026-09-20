# Staging Image Storage Smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate staging AI-image and private S3 configuration without exposing secrets, then provide a disposable upload, signed-download, and cleanup smoke test.

**Architecture:** Extend the existing staging environment inspector with sanitized AI and S3 validation. Add an API-owned smoke script that writes a tiny PNG under a unique `smoke/` key, signs and downloads it, verifies the bytes, and deletes the object in `finally` without printing credentials or signed URLs.

**Tech Stack:** Node.js 24, node:test, AWS SDK v3, pnpm workspace scripts

## Global Constraints

- Never print database credentials, S3 credentials, AI API keys, or signed URLs.
- Require HTTPS endpoints for staging AI and S3 services.
- Delete the smoke object even when download verification fails.
- Do not commit until the user explicitly requests it.

---

### Task 1: Sanitized staging configuration validation

**Files:**
- Modify: `scripts/staging-env.mjs`
- Modify: `scripts/staging-env.test.mjs`
- Modify: `scripts/check-staging-env.mjs`

**Interfaces:**
- Consumes: the existing `inspectStagingEnv(env)` API and process environment.
- Produces: sanitized `storageEndpointHost`, `storageBucket`, `storageRegion`, and `aiImageEndpointHost` fields.

- [x] Add failing tests for missing values, non-HTTPS endpoints, unsafe bucket names, and credential non-disclosure.
- [x] Run `node --test scripts/staging-env.test.mjs` and verify the new tests fail.
- [x] Validate `AI_IMAGE_API_URL`, `AI_IMAGE_API_KEY`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY` while returning only sanitized metadata.
- [x] Update preflight output to print only endpoint hosts, bucket, and region.
- [x] Run `node --test scripts/staging-env.test.mjs` and verify all tests pass.

### Task 2: Disposable storage smoke command

**Files:**
- Create: `apps/api/scripts/storage-smoke.mjs`
- Modify: `apps/api/package.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: validated S3 environment variables and AWS SDK v3.
- Produces: `corepack pnpm staging:storage-smoke`, which uploads, signs, downloads, verifies, and deletes one PNG.

- [x] Implement a unique `smoke/<timestamp>-<uuid>.png` object lifecycle with `PutObjectCommand`, `GetObjectCommand`, `DeleteObjectCommand`, and a 900-second presigned URL.
- [x] Verify the downloaded bytes exactly match the uploaded PNG and always delete the object in `finally`.
- [x] Print only the endpoint host, bucket, object key, and pass/cleanup status.
- [x] Add workspace commands for the smoke test and confirm the script parses with `node --check apps/api/scripts/storage-smoke.mjs`.

### Task 3: Runbook and verification

**Files:**
- Modify: `docs/staging-runbook.md`
- Create: `docs/fourteenth-stage-report.md`

**Interfaces:**
- Consumes: Tasks 1 and 2 commands.
- Produces: repeatable staging setup and an evidence record that distinguishes local readiness from live validation.

- [x] Document the secret-safe configuration and smoke sequence.
- [x] Record that live validation is pending when credentials are absent; do not claim a live pass.
- [x] Run staging configuration tests, workspace typecheck, API unit tests, API E2E, and `git diff --check`.
- [x] Run `corepack pnpm staging:preflight`; confirm it fails safely when S3/AI settings are absent and exposes no secret values.
- [x] Run `corepack pnpm staging:storage-smoke` only when all required values are configured.
- [x] Mark completed steps without committing.
