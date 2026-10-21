# Result Presentation and Chapter Crops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store one coherent, versioned result presentation and render four chapter previews from deliberate crops of its approved background image.

**Architecture:** Keep the existing question and scoring pipeline unchanged. After a result core and story profile are finalized, build and persist a separate immutable presentation snapshot containing short display copy, a selected background and character, and four ordered chapters. Each chapter references the same source background with its own normalized crop. Chapter 01 is the identity hero. Chapters 02–04 retain the exact same hero background and show their text in a parchment reader with horizontal internal pages; a crop is only a navigation preview, not a claim that four distinct illustrated events were created.

**Tech Stack:** NestJS, Prisma/PostgreSQL or in-memory repository, TypeScript, Expo/React Native Web, Vitest, Playwright.

## Global Constraints

- Do not modify question semantics, answer wiring, scoring, or result identity selection.
- Do not show a generic unrelated character when an appropriate character asset is missing: fail presentation validation or show an explicit non-character fallback.
- Preserve old results. Never silently overwrite an existing result or its image; backfill versioned presentation snapshots read-only from its existing core and profile.
- Crop focal coordinates use normalized numbers from 0 to 1, and zoom is at least 1. Asset width and height are required.
- Four chapters must remain in the order `MEETING`, `TRIAL`, `CHOICE`, `NOW`; the NOW chapter is a present-day reflection, not a literal past-life scene.
- Chapter 01 presents who the person was. Chapters 02–04 keep the identical background and display chapter-specific copy in the overlaid parchment. Long chapter copy is split into complete-sentence pages and swiped horizontally inside the parchment; the chapter filmstrip remains separate navigation. Ignore the play icon in the mockup.
- Phone and tablet share the same data. Check 320×720, 390×844, 768×1024, 1024×1366, and 1440×900, plus landscape and resizing. No horizontal overflow.
- Compare the result against the approved C mockup. A crop-only approach does not recreate four unique event illustrations, so visually approve a pilot background before scaling the catalog.
- Run `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm content:check`, and browser E2E. Report unrun checks explicitly.
- Do not push to GitHub as part of plan execution unless the user asks.

---

## File map

- `apps/api/src/results/result-presentation.ts` — versioned presentation type, chapter IDs, crop validation.
- `apps/api/src/results/build-result-presentation.ts` — deterministic, concise copy and asset selection from an already-scored result.
- `apps/api/src/results/result-presentation.test.ts` — contract, coherence, and text-length tests.
- `packages/content/src/historical/chapter-crops.ts` — approved crop presets by **exact background asset key**, with intrinsic dimensions.
- `packages/content/src/historical/chapter-crops.test.ts` — catalog coverage and crop distinctness tests.
- `prisma/schema.prisma` and a new `prisma/migrations/<timestamp>_result_presentation/migration.sql` — versioned JSON snapshot and lossless image-layer storage.
- `apps/api/src/repositories/assessment.repository.ts`, `memory-assessment.repository.ts`, `prisma-assessment.repository.ts` — save/load snapshot and image layers in both modes.
- `apps/api/src/results/results.service.ts` — create snapshot once, return it on reads, and backfill old results without changing their core.
- `apps/mobile/src/components/CroppedScene.tsx` — one cross-platform crop renderer from normalized focal data.
- `apps/mobile/src/components/ResultHero.tsx`, `ChapterFilmstrip.tsx`, `ResultExperience.tsx` — consume the presentation snapshot rather than deriving chapter URLs or repurposing highlight text.
- `apps/mobile/src/results/presentation.ts` — remove filename-derived chapter image logic after consumers migrate.
- `apps/mobile/app/result.tsx` — pass the presentation snapshot through; retain a clearly marked legacy view for old data until backfill succeeds.

## Task 1: Define and test the presentation contract

**Files:** Create `apps/api/src/results/result-presentation.ts`; create `apps/api/src/results/result-presentation.test.ts`.

**Interfaces:** Produce `ResultPresentationV2` and `validateResultPresentation(value): string[]`.

- [ ] Write a failing test: a valid fixture has exactly four chapters in the required order and all image URIs point to one catalog setting; reject missing chapters, empty copy, nonfinite focal values, zoom below 1, absent dimensions, and unrelated character URI.
- [ ] Run `corepack pnpm --filter @pastlife/api test -- result-presentation.test.ts`; expect failure before implementation.
- [ ] Implement the contract using this shape:

```ts
type ChapterId = 'MEETING' | 'TRIAL' | 'CHOICE' | 'NOW';
type Crop = { focusX: number; focusY: number; zoom: number };
type Scene = { uri: string; width: number; height: number; crop: Crop };
export type ResultPresentationV2 = {
  version: 2;
  hero: { title: string; tagline: string; lifeSummary: string; background: Scene; characterUri: string | null };
  chapters: Array<{ id: ChapterId; title: string; summary: string; body: string; preview: Scene }>;
};
```

  Validation must enforce order by comparing `chapters.map(x => x.id)` to `['MEETING','TRIAL','CHOICE','NOW']`, require each `preview.uri === hero.background.uri`, and require `0 <= focusX,focusY <= 1`, `zoom >= 1`, and positive finite dimensions. Copy limits: title 30 characters, tagline 80, life summary 180, chapter summary 70, chapter body 350. Count Unicode code points via `Array.from(text).length`.
- [ ] Rerun the focused test and API typecheck; expect both to pass.
- [ ] Commit this independently testable contract only after review; do not push.

## Task 2: Curate four crops per background, not by filename substitution

**Files:** Create `packages/content/src/historical/chapter-crops.ts`; create `packages/content/src/historical/chapter-crops.test.ts`; modify `packages/content/src/index.ts` to export the catalog.

**Interfaces:** Produce `getChapterCrops(assetKey: string): readonly [Crop, Crop, Crop, Crop] | undefined` and `getImageDimensions(assetKey: string): {width:number;height:number} | undefined`.

- [ ] Write a failing catalog test for the selected pilot background and a coverage test listing each supported background key explicitly. Reject duplicate or near-identical crop centers (Euclidean distance below 0.12) unless a visual review records why it is necessary.
- [ ] Run `corepack pnpm --filter @pastlife/content test -- chapter-crops.test.ts`; expect failure.
- [ ] Implement the exact-key map, for example:

```ts
export const chapterCropCatalog = {
  'library/v4/swahili-kilwa-daily.webp': {
    width: 768,
    height: 1024,
    crops: [
      { focusX: 0.47, focusY: 0.48, zoom: 1.8 },
      { focusX: 0.85, focusY: 0.42, zoom: 1.8 },
      { focusX: 0.22, focusY: 0.17, zoom: 1.8 },
      { focusX: 0.45, focusY: 0.85, zoom: 1.8 },
    ],
  },
} as const;
```

  The pilot's `768×1024` dimensions were read from the WebP header and the centers were selected from visual inspection: people, sail, architecture, cargo. Render and approve the actual card crops before accepting these coordinates. Read every other file's actual dimensions. For unsupported keys, return no crop preset and mark the presentation as needing an explicit fallback, never repeat one thumbnail four times.
- [ ] Render a contact sheet for every supported background with the four crops, inspect recognizable subjects and overlap, and record approval in `docs/design-guide.md`.
- [ ] Rerun content tests and `corepack pnpm content:check`; expect pass.
- [ ] Commit the curated catalog after visual review; do not push.

## Task 3: Build one concise presentation snapshot from the result canon

**Files:** Create `apps/api/src/results/build-result-presentation.ts`; extend `apps/api/src/results/result-presentation.test.ts`.

**Interfaces:** `buildResultPresentation(core: ResultCore, profile: StoryProfile, image: ImageAsset): ResultPresentationV2` consumes Task 1 and 2 contracts.

- [ ] Write fixtures for a historical merchant and a modern programmer. Assert that title, tagline, summary, chapter events, background, and character all refer to the same `core.locationId` and `core.occupationId`. Assert that chapter 02 describes the challenge, 03 the resulting choice, and 04 the present echo. Assert text limits and no ellipsis-created mid-sentence fragments.
- [ ] Run the focused test; expect failure.
- [ ] Implement concise copy from `core`, `profile.relationshipNetwork`, `profile.timeline`, `profile.ending`, and `profile.highlights` as appropriate. Use one selected and validated background URI for all four previews. Select a character by the exact location+occupation+gender catalog rule. If no matching character exists, set `characterUri: null`; do not insert a Joseon official or generic artisan. Call `validateResultPresentation` and reject invalid output.
- [ ] Keep the existing six narrative blocks as separate extended content; do not compress them into chapter bodies by slicing characters. Build chapter copy as independent, complete sentences.
- [ ] Rerun tests and API typecheck; expect pass.
- [ ] Commit the builder after review; do not push.

## Task 4: Persist and return the snapshot without losing image layers

**Files:** Modify `prisma/schema.prisma`, add migration, modify repository types and both repository implementations, modify `apps/api/src/results/results.service.ts`; add repository round-trip tests.

**Interfaces:** `StoredResult.presentation?: ResultPresentationV2`; `saveResultPresentation(resultId, presentation)` is idempotent and returns the stored value. `StoredImage.layers` and `compositeUri` round-trip in Prisma as well as memory.

- [ ] Write failing tests: save/load a result presentation twice and confirm byte-equivalent values; save/load image layers and composite URI; reading an old result with no presentation must not mutate its core or blocks.
- [ ] Run API tests; expect failure.
- [ ] Add `presentationJson Json?` to `Result` and `layersJson Json?`, `compositeUri String?` to `ResultImage`; create an additive migration with `ALTER TABLE`, never dropping existing columns. Update the Prisma repository read/write paths and memory repository to retain every field. Do not use `update: {}` when a new image must be repaired; make image repair an explicit, versioned method so existing user data is not silently replaced.
- [ ] Build the snapshot when the first basic result is finalized, save it once, and return it unchanged on subsequent reads. For older results, attempt a deterministic backfill from their stored `coreJson`, `storyProfileJson`, and image; if compatibility validation fails, return a named legacy state and log the reason rather than fabricating a scene.
- [ ] Rerun API tests, Prisma migration status, API typecheck; expect pass. Test against both memory and a disposable PostgreSQL database before deploying a migration.
- [ ] Commit the additive migration and repository behavior after review; do not push.

## Task 5: Render crops and chapter state consistently on every viewport

**Files:** Create `apps/mobile/src/components/CroppedScene.tsx`; modify `ResultHero.tsx`, `ChapterFilmstrip.tsx`, `ResultExperience.tsx`, `apps/mobile/app/result.tsx`; update `apps/mobile/src/results/presentation.test.ts`.

**Interfaces:** `CroppedScene({scene, accessibilityLabel})` renders a clipped background from `Scene`; result components receive `ResultPresentationV2` directly.

- [ ] Add a crop-math unit test. For source `1536×1024`, viewport `160×130`, `zoom=1.5`, and `focusX=focusY=0.5`, compute `scale=max(160/1536,130/1024)*1.5`; rendered dimensions are source dimensions times scale; offset each axis by `viewport/2 - focus*rendered`, clamped to `[viewport-rendered,0]`. Test a wide tablet card as well as a narrow phone card.
- [ ] Implement `CroppedScene` as an `overflow: hidden` container with an absolutely positioned image sized by the tested math. Use one algorithm on native and web; avoid CSS-only `background-position`. Obtain viewport dimensions from `onLayout`; use dimensions persisted in `Scene`, not a runtime network guess.
- [ ] Make chapter 01 show `presentation.hero` as an identity introduction. For 02–04, keep the same background and put the selected chapter's complete-sentence text inside a larger parchment. Use a nested horizontal pager for parchment pages with previous/next controls and page count, resetting to page 1 when the chapter changes. Keep the chapter filmstrip as the outer navigation. Remove the filename-derived `-daily.webp` substitution and unrelated generic-character fallback; do not generate chapter backgrounds.
- [ ] Run mobile typecheck and focused component tests; expect pass.
- [ ] Verify 320×720, 390×844, 768×1024, 1024×1366, 1440×900, phone/tablet landscape, viewport resize while chapter 03 is selected, keyboard selection, swipe, no cut-off copy, no horizontal overflow, and no subject cropped through the face. Capture and compare screenshots against the approved C mockup.
- [ ] Commit only after visual review; do not push.

## Task 6: Release validation and legacy audit

**Files:** Modify `docs/design-guide.md` and `docs/decision-log.md` with the approved crop-only limitation, legacy behavior, and test evidence.

- [ ] Test one old result, one newly created result, one unsupported background, one missing character asset, and a DB restart. Confirm the exact same title, hero, character, chapter order, crop coordinates, and text after reload.
- [ ] Run `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm content:check`, and `corepack pnpm test:e2e:browser`; record pass/fail and environmental skips.
- [ ] Review the cropped chapter cards as a pilot. If four crops of a single background cannot credibly communicate meeting/trial/choice/now, stop at the pilot and request dedicated scene art for those backgrounds. Do not present the crop-only design as visually equivalent to the mockup's four different illustrated scenes.
- [ ] Commit documentation and verification evidence after review; do not push.

## Self-review

- Covers compact identity, tagline, life summary, a coherent hero, four ordered chapters, chapter copy, persistent image references, crop-only previews, old-result migration, mobile/tablet, and visual verification.
- The single-background crop is intentionally limited to navigation cards; it cannot depict four new events not present in the source image.
- `ResultPresentationV2` is consumed by repository, API, and UI without changing scoring or questions.
