# AI Image Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make automatic result-image generation safe and vendor-neutral so a production image endpoint can be connected without changing the result flow.

**Architecture:** Keep `ResultsService` responsible for result-level idempotency and persistence. Move deterministic prompt construction into a pure module, while `AiImageProvider` owns the HTTP boundary, two-attempt retry policy, timeout, and response validation. Continue to use `LibraryImageProvider` whenever generation is unavailable or invalid.

**Tech Stack:** Node.js 24, TypeScript, NestJS 11, Vitest, built-in Fetch API.

## Global Constraints

- The first result-status request automatically ensures one representative image per result.
- Every generation request sends `n: 1` and `quality: "low"`.
- Prompts must prohibit modern objects, explicit violence, real-person likeness, ethnic or religious caricature, and sexualization.
- User credentials and complete connection URLs must never be logged.
- A failed or malformed AI response must preserve the public result flow through the library fallback.
- No provider-specific SDK or production secret is added in this phase.

---

### Task 1: Deterministic historical image prompt

**Files:**
- Create: `apps/api/src/providers/ai-image-request.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`

**Interfaces:**
- Consumes: `ResultCore` from `@pastlife/scoring`.
- Produces: `buildAiImagePrompt(core: ResultCore): string`.

- [x] **Step 1: Write a failing test for deterministic prompt content**

Assert that the prompt contains the result IDs and `libraryImage.promptTags`, requests a cinematic historical illustration, and contains the required negative safety instructions.

- [x] **Step 2: Run `corepack pnpm --filter @pastlife/api test -- provider-fallback.spec.ts`**

Expected: fail because `buildAiImagePrompt` does not exist.

- [x] **Step 3: Implement `buildAiImagePrompt` as a pure function**

Join only immutable catalog IDs and controlled prompt tags. Do not include emails, tokens, free-form user text, or runtime secrets.

- [x] **Step 4: Re-run the focused API test**

Expected: prompt test passes.

### Task 2: Harden the image HTTP boundary

**Files:**
- Modify: `apps/api/src/providers/ai-image.provider.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`

**Interfaces:**
- Consumes: `buildAiImagePrompt(core)` and `AI_IMAGE_API_URL`/`AI_IMAGE_API_KEY`.
- Produces: the existing `ImageProvider.getImage(core): Promise<ImageAsset>` contract.

- [x] **Step 1: Extend the request-contract test**

Assert that the body contains `prompt`, `n: 1`, `quality: "low"`, `idempotencyKey`, and the content version, and that the fetch request carries an abort signal.

- [x] **Step 2: Add malformed-response tests**

Return an invalid URI and an empty alt value from the fake endpoint; assert two attempts followed by `IMAGE_GENERATION_FAILED` library fallback.

- [x] **Step 3: Implement timeout and response validation**

Use `AbortSignal.timeout(30_000)`. Accept only `https:` image URIs and a non-empty alt string of at most 500 characters. Retry once on HTTP, JSON, timeout, or validation failure.

- [x] **Step 4: Run focused tests and API typecheck**

Run `corepack pnpm --filter @pastlife/api test -- provider-fallback.spec.ts` and `corepack pnpm --filter @pastlife/api typecheck`.

Expected: all checks pass.

### Task 3: Document and verify the production endpoint contract

**Files:**
- Modify: `README.md`
- Modify: `docs/prd-2.5-implementation-report.md`
- Modify: `docs/superpowers/plans/2026-09-19-ai-image-production-readiness.md`

**Interfaces:**
- Consumes: the finalized request and response shapes from Task 2.
- Produces: an operator-facing contract that does not contain credentials.

- [x] **Step 1: Document the endpoint request and response shapes**

Document `prompt`, `n`, `quality`, `version`, and `idempotencyKey`; document the required `{ "uri": "https://...", "alt": "..." }` response.

- [x] **Step 2: Run full verification**

Run `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm test:e2e`, and `git diff --check`.

Expected: all commands pass.

- [x] **Step 3: Review the plan and mark only completed steps**

Confirm no unchecked implementation step remains and no secret or real endpoint value was committed.
