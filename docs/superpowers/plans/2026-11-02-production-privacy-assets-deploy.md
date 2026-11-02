# Production Privacy Assets Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing multilingual privacy policy at `https://pastlife-assets.pages.dev/privacy/` without deploying or configuring the production API.

**Architecture:** Extend the repository-owned deployment entrypoint with an explicit `-AssetsOnly` switch. The switch retains the clean-tree, tests, branch-promotion, and Cloudflare health checks, while skipping Cloud Run API deployment and API health verification.

**Tech Stack:** PowerShell, Git, pnpm, Node.js static asset builder, Cloudflare Pages Git deployment

## Global Constraints

- Do not modify or deploy the production API.
- Do not require production Google OAuth or AdMob identifiers for an assets-only deployment.
- Do not touch the user's untracked `marketing/` directory.
- Production deployment still requires `-ConfirmProduction` and a commit already present on `origin/dev`.
- A successful Git push is not success until the configured Cloudflare asset health URL and `/privacy/` both return HTTP 200.

---

### Task 1: Add and verify an assets-only deployment path

**Files:**
- Modify: `scripts/deploy.ps1`
- Modify: `docs/deployment/prompt-driven-deployment.md`
- Test: `scripts/deploy-assets-only.test.mjs`

**Interfaces:**
- Consumes: `scripts/deploy.ps1 -Environment <dev|prod> [-ConfirmProduction]`
- Produces: `scripts/deploy.ps1 -Environment <dev|prod> -AssetsOnly [-ConfirmProduction]`

- [ ] **Step 1: Add a failing source-level regression test**

Create `scripts/deploy-assets-only.test.mjs` to assert that the deployment script declares `AssetsOnly`, pushes the selected deployment branch, exits before Cloud Run deployment, and still verifies Cloudflare assets.

- [ ] **Step 2: Run the regression test and confirm failure**

Run: `node --test scripts/deploy-assets-only.test.mjs`

Expected: FAIL because `-AssetsOnly` is not implemented.

- [ ] **Step 3: Implement the minimal PowerShell branch**

Add `[switch]$AssetsOnly`. After checks and the deployment-branch push, return early only after `Wait-ForUrl 'Cloudflare assets' $assetHealth`; do not invoke `scripts/deploy-cloud-run.ps1` or the API health check.

- [ ] **Step 4: Document the supported commands**

Document dev and production assets-only commands and state that they build and publish static assets without deploying Cloud Run.

- [ ] **Step 5: Run focused and repository verification**

Run:

```powershell
node --test scripts/deploy-assets-only.test.mjs
corepack pnpm assets:test
corepack pnpm typecheck
corepack pnpm test
```

Expected: all commands PASS.

- [ ] **Step 6: Commit the deployment support**

Commit only the plan, deployment script, documentation, and regression test with message `feat: support static-only asset deployments`.

### Task 2: Promote and verify the privacy page

**Files:**
- Deploy: current clean worktree commit
- Verify: `https://dev.pastlife-assets.pages.dev/health.json`
- Verify: `https://pastlife-assets.pages.dev/health.json`
- Verify: `https://pastlife-assets.pages.dev/privacy/`

**Interfaces:**
- Consumes: the `-AssetsOnly` deployment option from Task 1
- Produces: a publicly accessible production privacy policy page

- [ ] **Step 1: Promote the commit to dev assets**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment dev -AssetsOnly
```

Expected: checks pass, `origin/dev` advances, and dev Cloudflare health returns HTTP 200.

- [ ] **Step 2: Promote the same commit to production assets**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -AssetsOnly -ConfirmProduction
```

Expected: `origin/prod` advances without invoking Cloud Run, and production Cloudflare health returns HTTP 200.

- [ ] **Step 3: Verify the privacy policy response and content**

Request `https://pastlife-assets.pages.dev/privacy/` and confirm HTTP 200, HTML content type, and the presence of `전생록 개인정보처리방침` and `gysoft@gimmyoung.com`.

- [ ] **Step 4: Report deployment evidence**

Report the deployed commit, branches pushed, checks run, Cloudflare health result, privacy URL result, and explicitly state that production Cloud Run was not deployed.
