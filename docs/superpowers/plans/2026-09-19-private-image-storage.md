# Private Image Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist successful AI images in private S3-compatible storage and expose only short-lived signed download URLs.

**Architecture:** `AiImageProvider` downloads and validates the generated asset, then stores a stable `s3://bucket/key` reference. `ResultsService` resolves that reference to a 15-minute signed URL only when building client responses, while library assets remain unchanged.

**Tech Stack:** Node.js 24, NestJS 11, AWS SDK v3, Vitest, Prisma 6.

## Global Constraints

- DB rows must never store expiring signed URLs or storage credentials.
- Only HTTPS AI source URLs and `image/png`, `image/jpeg`, or `image/webp` payloads up to 10 MB are accepted.
- Object keys are deterministic per result hash so retries do not create duplicate assets.
- Signed download URLs expire after 900 seconds.
- Storage or signing failures fall back safely without exposing secrets.
- No Git commit is created until explicitly requested by the user.

---

### Task 1: Standards-compliant private S3 adapter

**Files:**
- Modify: `apps/api/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/api/src/providers/storage.provider.ts`
- Modify: `apps/api/src/providers/s3-storage.provider.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`

- [x] Add AWS SDK S3 client and presigner dependencies.
- [x] Define `putObject` to return `s3://bucket/key` and `getDownloadUrl` to return a 900-second signed URL.
- [x] Configure endpoint, region, path-style access, and credentials from environment variables.
- [x] Test stable references without printing credentials.

### Task 2: Persist validated AI assets

**Files:**
- Modify: `apps/api/src/providers/ai-image.provider.ts`
- Modify: `apps/api/src/providers/providers.module.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`

- [x] Inject `IMAGE_STORAGE` into `AiImageProvider`.
- [x] Download successful AI output with a 30-second timeout.
- [x] Accept only PNG, JPEG, or WebP and reject content over 10 MB.
- [x] Store with a deterministic `results/<answerHash>.<extension>` key and return the stable S3 reference.
- [x] Verify invalid downloads and upload failures retry once and then use the library fallback.

### Task 3: Resolve signed URLs at response time

**Files:**
- Modify: `apps/api/src/results/results.service.ts`
- Modify: `apps/api/test/vertical-flow.e2e.spec.ts`

- [x] Inject `IMAGE_STORAGE` into `ResultsService`.
- [x] Resolve only `s3://` references for basic, deep, guide, archive detail, and share-asset responses.
- [x] Keep `asset://` and existing HTTPS library references unchanged.
- [x] Verify the repository retains a stable reference while repeated API reads receive usable signed URLs.

### Task 4: Configuration, documentation, and regression verification

**Files:**
- Modify: `.env.example`
- Modify: `.env.neon.example`
- Modify: `README.md`
- Modify: `docs/prd-2.5-implementation-report.md`
- Modify: `docs/superpowers/plans/2026-09-19-private-image-storage.md`

- [x] Document `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY` without real values.
- [x] Document stable references and 15-minute signed delivery.
- [x] Run workspace typecheck, unit tests, API E2E, browser E2E, and `git diff --check`.
- [x] Mark completed steps without committing.
