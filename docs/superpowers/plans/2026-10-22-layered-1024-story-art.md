# Layered 1024 Story Art Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. This task is executed in the current session without delegated agents.

**Goal:** Replace the 540px single-scene clown trial with separately generated, at-least-1024px background and character assets that fit the existing cinematic result UI.

**Architecture:** Keep the existing `BACKGROUND` + `CHARACTER` image-layer contract and the current `ResultHero` composition. Produce a square environment image so the same source can crop on mobile and tablet, plus a transparent 1024px-wide character cutout in the existing 2:3 upper-body convention. Optimize file size without shrinking the short edge below 1024px. Treat this pair as the approved production pattern for subsequent story-specific art; do not change question, scoring, result prose, or legacy 2.5 assets.

**Tech Stack:** Built-in image generation, NestJS library image provider, Expo static assets, Vitest, Playwright.

## Global Constraints

- User's later visual direction supersedes the prior hybrid/composite recommendation: new story images use separate background and character layers.
- Background source: square, at least 1024×1024. Character: transparent with at least 1024px width; the existing 1024×1536 character convention is suitable. Lossy WebP with alpha is permitted if Expo asset loading and visual QA pass.
- Low file size comes from compression, not from reducing the source to 540px. Never upscale a smaller generation and call it native 1024px detail.
- Maintain the C-cinematic navy/charcoal/warm-gold mood and keep faces/actions out of title and parchment-panel safe areas.
- Preserve unrelated dirty files and all previous results. Do not commit, push, or deploy.

---

### Task 1: Lock the two-layer contract

**Files:** `apps/api/test/image-delivery.spec.ts`, `apps/api/test/content-reboot.e2e.spec.ts`, `apps/api/src/providers/library-image.provider.ts`, `apps/mobile/src/results/libraryImages.ts`

**Interfaces:** `LibraryImageProvider.getImage({ storyId: 'CLOWN' })` returns one `BACKGROUND` and one `CHARACTER` layer; `presentation.hero.characterUri` already consumes the latter.

- [x] Extend provider tests to require two distinct clown layer URIs and no single-scene composite; verify red with `corepack pnpm --filter @pastlife/api exec vitest run test/image-delivery.spec.ts`.
- [x] Generate the two assets under `apps/mobile/assets/stories/v3/` without overwriting the old trial.
- [x] Verify actual image dimensions and alpha channel before registering the paths. Optimize only after native resolution is confirmed.
- [x] Map the asset URIs in the provider and Expo registry; update the v3 E2E URI assertion. Verify green with provider and API E2E tests.

### Task 2: Establish the reusable visual rule and inspect the UI

**Files:** `docs/content-reboot-visual-pipeline.md`, `e2e/mobile-story-identity.spec.ts` (only if its image assertions need extension)

**Interfaces:** Every completed story has a background asset, a transparent character asset, a title-safe composition, 1024px native minimum, verified mobile mapping and alt text.

- [x] Replace the previous one-scene/540px rule in the visual document with the two-layer 1024px rule and measured sizes of the clown pair.
- [x] Run `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm test:e2e`, and focused browser QA at 320px and 768px; inspect clipping, blank images, overlap, and horizontal scroll.
- [x] Run `git diff --check` and report any test limitation honestly.

## Self-review

The plan changes presentation assets and their mapping only. It does not invent a new result structure or assume that a low-resolution file is sufficient because it happens to look acceptable on a phone. All remaining story-specific pairs require the same prose-to-image and responsive gates before going live.
