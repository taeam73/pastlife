# Prompt-Driven Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make “개발 배포해줘” and “운영 배포해줘” invoke a repository skill that safely publishes the selected commit through `dev` or `prod`, with Railway hosting NestJS and PostgreSQL and Cloudflare Pages hosting static assets.

**Architecture:** A checked-in Codex skill invokes one PowerShell deployment entrypoint. The entrypoint validates the repository and environment, runs tests, builds a deterministic Cloudflare Pages directory, pushes the current commit to the matching deployment branch, and polls configured health URLs; Railway and Cloudflare Git integrations perform the external deployments. The mobile app uses `EXPO_PUBLIC_ASSET_BASE_URL` for remote story assets while retaining bundled assets as a fallback.

**Tech Stack:** PowerShell 7/Windows PowerShell 5.1, Node.js 24, pnpm 12, Expo/React Native, Railway Git deployments, Railway PostgreSQL, Cloudflare Pages Git integration, Codex skills

## Global Constraints

- `dev` and `prod` must use separate Railway PostgreSQL services and secrets.
- A production deployment may only promote a commit already present on `origin/dev`.
- Deployment scripts must never read, print, commit, or generate production secrets.
- Railway and Cloudflare account creation remain manual; dry-run mode must work without either account.
- Bundled mobile assets remain available until remote asset delivery is proven on Android devices.

---

### Task 1: Build deterministic static assets

**Files:**
- Create: `scripts/build-static-assets.mjs`
- Create: `scripts/build-static-assets.test.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `apps/mobile/assets/**/*`.
- Produces: `dist/static/assets/**/*`, `dist/static/manifest.json`, `dist/static/health.json`, and `dist/static/_headers`.

- [ ] Add a Node test that builds a temporary fixture and checks copied bytes, SHA-256 manifest entries, health metadata, and cache headers.
- [ ] Implement the recursive asset builder with `--source` and `--output` overrides.
- [ ] Add `assets:build` and `assets:test` scripts and ignore `dist/`.
- [ ] Run `corepack pnpm assets:test` and `corepack pnpm assets:build`; expect success and 743 source assets in the manifest.

### Task 2: Add remote asset resolution with bundled fallback

**Files:**
- Create: `apps/mobile/src/results/assetUrl.ts`
- Create: `apps/mobile/src/results/assetUrl.test.ts`
- Modify: `apps/mobile/src/results/libraryImages.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `EXPO_PUBLIC_ASSET_BASE_URL` and existing `asset://...` identifiers.
- Produces: `remoteAssetSource(uri): { uri: string } | undefined` and a resolver that returns remote sources when configured, otherwise existing Metro modules.

- [ ] Test URL normalization, URI encoding, rejection of non-asset schemes, and unset configuration.
- [ ] Implement the pure URL helper.
- [ ] Prefer the remote source in `resolveLibraryImage`, retaining the existing map as fallback when the base URL is absent.
- [ ] Run the focused mobile test and typecheck; expect success.

### Task 3: Add deployment validation and orchestration

**Files:**
- Create: `scripts/deploy.ps1`
- Create: `scripts/test-deploy-script.ps1`
- Create: `.deploy/dev.env.example`
- Create: `.deploy/prod.env.example`
- Modify: `.gitignore`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `-Environment dev|prod`, `-DryRun`, `-ConfirmProduction`, clean Git state, and environment-specific health URL variables.
- Produces: validated `HEAD` pushed to `refs/heads/dev` or `refs/heads/prod`, then verified API and static health responses.

- [ ] Add script tests covering invalid target, dirty tree, production confirmation, and dry-run command generation.
- [ ] Implement preflight checks, tests, static build, fast-forward branch push, and bounded health polling.
- [ ] Require production `HEAD` to be an ancestor of or equal to `origin/dev` and require `-ConfirmProduction`.
- [ ] Add `dev` and `prod` to CI branch filters and ignore local `.deploy/*.env` files.
- [ ] Run the PowerShell tests and both deployment dry runs; expect no external mutation.

### Task 4: Create the prompt-invoked deployment skill

**Files:**
- Create: `.codex/skills/pastlife-deploy/SKILL.md`
- Create: `.codex/skills/pastlife-deploy/agents/openai.yaml`

**Interfaces:**
- Consumes: Korean or English requests to deploy Pastlife to development or production.
- Produces: an invocation of `scripts/deploy.ps1` with the correct safety flags and a concise deployment report.

- [ ] Initialize the skill with the bundled skill initializer.
- [ ] Define environment routing, production authorization rules, stop conditions, and report format.
- [ ] Validate the skill with `quick_validate.py`.
- [ ] Confirm the skill never treats a status question as deployment authorization.

### Task 5: Document provider setup and verify the repository

**Files:**
- Create: `docs/deployment/prompt-driven-deployment.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: Railway and Cloudflare Git integrations configured by the account owner.
- Produces: exact `dev`/`prod` environment topology, branch mapping, Cloudflare Pages build settings, secret names, and operational commands.

- [ ] Document one Railway project with isolated `dev` and `prod` API/PostgreSQL environments.
- [ ] Document Cloudflare Pages production branch `prod`, preview branch allowlist `dev`, build command `corepack pnpm assets:build`, and output directory `dist/static`.
- [ ] Document non-secret health URL variables used locally by the deployment script.
- [ ] Run `corepack pnpm typecheck`, `corepack pnpm test`, asset tests, PowerShell script tests, and skill validation; expect all to pass.

## Self-Review

- Spec coverage: prompt invocation, scripts, dev/prod branch promotion, Railway API/database isolation, Cloudflare static assets, tests, health checks, and manual account boundaries are covered.
- Placeholder scan: provider-generated URLs are represented only as environment variable names; no code step depends on an undefined placeholder value.
- Type consistency: the deployment environments are exactly `dev` and `prod`; the asset variable is exactly `EXPO_PUBLIC_ASSET_BASE_URL`; the static health path is exactly `/health.json`.
