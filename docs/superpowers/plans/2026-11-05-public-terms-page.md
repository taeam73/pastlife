# Public Terms Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an app-specific, publicly accessible multilingual Terms of Service page for Past Life Archive at `https://pastlife-assets.pages.dev/terms/`.

**Architecture:** Add a static HTML page beside the existing privacy page, copy it into the Cloudflare Pages output during the existing static-assets build, and verify its content and cache headers with the repository test. Promote the same commit through the existing assets-only dev and production deployment path, without deploying the API.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js asset builder and tests, PowerShell deployment, Cloudflare Pages

## Global Constraints

- Keep the existing privacy page unchanged.
- Do not modify the untracked `marketing/` directory.
- State clearly that the app is an entertainment experience and does not verify or prove past lives.
- Provide Korean, English, Thai, and Japanese content through the existing language-selection pattern.
- Keep the page publicly accessible over HTTPS with no login, geoblocking, or PDF-only presentation.
- Deploy static assets only; do not deploy or change the production API.

---

### Task 1: Add the terms page to the static-assets build

**Files:**
- Create: `scripts/static-pages/terms/index.html`
- Modify: `scripts/build-static-assets.mjs`
- Test: `scripts/build-static-assets.test.mjs`

**Interfaces:**
- Consumes: `buildStaticAssets({ source, output, version })`
- Produces: `dist/static/terms/index.html` and a `/terms/*` cache rule

- [ ] **Step 1: Add a failing regression assertion**

Assert that the build output contains `terms/index.html`, the operator contact address, the entertainment disclaimer, and a `/terms/*` cache rule.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test scripts/build-static-assets.test.mjs`

Expected: FAIL because `output/terms/index.html` does not exist.

- [ ] **Step 3: Add the multilingual terms page and copy rule**

Create the Korean, English, Thai, and Japanese sections using the privacy page's accessible language selector. Copy the page to the build output and add a five-minute cache rule.

- [ ] **Step 4: Run focused and repository verification**

Run:

```powershell
node --test scripts/build-static-assets.test.mjs
corepack pnpm typecheck
corepack pnpm test
```

Expected: all commands pass.

- [ ] **Step 5: Commit the source change**

Commit only the plan, terms page, builder, and focused test with message `feat: publish app terms of service`.

### Task 2: Publish and verify the terms page

**Files:**
- Deploy: the clean committed worktree
- Verify: `https://dev.pastlife-assets.pages.dev/terms/`
- Verify: `https://pastlife-assets.pages.dev/terms/`

**Interfaces:**
- Consumes: `scripts/deploy.ps1 -Environment <dev|prod> -AssetsOnly`
- Produces: a public Terms of Service URL accepted by Play Console

- [ ] **Step 1: Promote the commit to dev assets**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment dev -AssetsOnly`

Expected: checks pass, `origin/dev` advances, and the dev assets health URL returns HTTP 200.

- [ ] **Step 2: Verify the dev terms page**

Request the dev URL and confirm HTTP 200, HTML content type, `전생록 서비스 약관`, and `gysoft@gimmyoung.com`.

- [ ] **Step 3: Promote the same commit to production assets**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Environment prod -AssetsOnly -ConfirmProduction`

Expected: `origin/prod` advances without Cloud Run deployment.

- [ ] **Step 4: Verify the production terms page**

Request the production URL and confirm HTTP 200, HTML content type, multilingual controls, and the entertainment disclaimer.

- [ ] **Step 5: Prepare Play Console registration**

Use `https://pastlife-assets.pages.dev/terms/` in the app-level trader-status form. Saving or submitting the external form remains a separate user-visible action.
