# Content Depth and 48-Image Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make repeat play and paid deep results feel materially distinct by adding setting-specific work and life events, richer relationship events, and three deterministic fallback images for each of the 16 launch settings.

**Architecture:** Keep historical facts and setting-specific narrative material in `@pastlife/content`, then let scoring select stable variants from the answer hash. The API narrative consumes the selected setting/occupation material, while mobile resolves one of 48 bundled WebP assets through the existing `asset://` contract. Existing IDs and saved results remain compatible.

**Tech Stack:** TypeScript, Vitest, pnpm workspaces, React Native static assets, built-in ImageGen, WebP.

## Global Constraints

- Preserve all existing user changes in the dirty worktree.
- Keep the current 16 launch settings and existing stable IDs.
- Provide at least three fallback images per setting and at least 48 checked assets total.
- Every new historical narrative must be setting-specific and avoid anachronisms listed in the setting's `visual.avoid` field.
- Image selection must be deterministic for the same result input.
- Generated images contain no text, logos, trademarks, borders, or watermarks.
- Historical content remains fictionalized entertainment and must not claim biographical certainty.

---

### Task 1: Expand and validate the historical content schema

**Files:**
- Modify: `packages/content/src/historical/types.ts`
- Modify: `packages/content/src/historical/settings.ts`
- Modify: `packages/content/src/historical/validate.ts`
- Test: `packages/content/test/historical-content.test.ts`

**Interfaces:**
- Consumes: existing `HistoricalSetting`, `HistoricalOccupation`, and 16 stable location IDs.
- Produces: `HistoricalEpisode`, `imageAssetKeys`, `workEpisodes`, and `lifeEvents` on each setting.

- [ ] **Step 1: Write failing tests for depth and image variants**

```ts
it('has three images and setting-specific narrative depth per setting', () => {
  expect(historicalSettings.every(({ imageAssetKeys }) => imageAssetKeys.length >= 3)).toBe(true);
  expect(historicalSettings.every(({ workEpisodes }) => workEpisodes.length >= 4)).toBe(true);
  expect(historicalSettings.every(({ lifeEvents }) => lifeEvents.length >= 4)).toBe(true);
});
```

- [ ] **Step 2: Run the content test and verify it fails**

Run: `corepack pnpm --filter @pastlife/content test`

Expected: FAIL because the new fields do not exist.

- [ ] **Step 3: Add explicit content types and validation**

```ts
export type HistoricalEpisode = {
  id: string;
  title: string;
  setup: string;
  choice: string;
  consequence: string;
  occupationIds: readonly string[];
};
```

Add `imageAssetKeys`, `workEpisodes`, and `lifeEvents` to `HistoricalSetting`. Validation must reject fewer than three unique image keys, fewer than four episodes in either category, duplicate episode IDs, and occupation references not allowed by that setting.

- [ ] **Step 4: Author content for all 16 settings**

Each setting receives three stable image keys, at least four occupation-aware work episodes, and at least four local life events. Copy must name concrete actions, objects, or spaces already supported by `dailyLifeNotes` and provenance.

- [ ] **Step 5: Run focused tests**

Run: `corepack pnpm --filter @pastlife/content test`

Expected: all content tests pass.

### Task 2: Expand relationship events and deterministic narrative selection

**Files:**
- Modify: `apps/api/src/providers/story-event-catalog.ts`
- Create: `apps/api/src/providers/historical-episode-catalog.ts`
- Modify: `apps/api/src/providers/story-narrative.ts`
- Modify: `apps/api/src/story-profile.ts`
- Test: `apps/api/test/story-event-catalog.spec.ts`
- Test: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Consumes: `HistoricalSetting.workEpisodes`, `HistoricalSetting.lifeEvents`, `ResultCore.locationId`, `ResultCore.occupationId`, and stable answer identifiers.
- Produces: `selectHistoricalEpisodes(core)` and at least four relationship event variants per relationship type.

- [ ] **Step 1: Write failing tests**

```ts
it('offers at least four events for every relationship type', () => {
  expect(relationshipEventCounts()).toEqual({
    REL_COMPANION: 4, REL_FAMILY: 4, REL_LOST_LOVE: 4, REL_STUDENT: 4,
  });
});

it('uses episodes compatible with the selected setting and occupation', () => {
  const selected = selectHistoricalEpisodes(core);
  expect(selected.work.occupationIds).toContain(core.occupationId);
});
```

- [ ] **Step 2: Run API tests and verify failure**

Run: `corepack pnpm --filter @pastlife/api test -- story-event-catalog story-narrative`

Expected: FAIL because event counts and selector are not implemented.

- [ ] **Step 3: Implement stable selection**

```ts
export function selectHistoricalEpisodes(core: EpisodeCore) {
  const setting = requireSetting(core.locationId);
  const compatible = setting.workEpisodes.filter((item) => item.occupationIds.includes(core.occupationId));
  return {
    work: stablePick(compatible, `${core.answerHash}:${core.recordNo}:work`),
    life: stablePick(setting.lifeEvents, `${core.answerHash}:${core.recordNo}:life`),
  };
}
```

- [ ] **Step 4: Add two new events to each relationship type**

Add distinct actions and consequences for companion, family, lost-love, and student relationships. Preserve the existing taxonomy and IDs used by saved outputs.

- [ ] **Step 5: Integrate episodes into the deep narrative**

Use the selected work episode in the work-life chapter and the selected local life event in the turning-point chapter. Expose their titles in the structured result blocks so paid content visibly differs before reading the full prose.

- [ ] **Step 6: Run API tests**

Run: `corepack pnpm --filter @pastlife/api test`

Expected: all API tests pass.

### Task 3: Select and resolve 48 deterministic image assets

**Files:**
- Modify: `packages/scoring/src/result.ts`
- Modify: `packages/scoring/test/determinism.test.ts`
- Modify: `apps/mobile/src/results/libraryImages.ts`
- Modify: `scripts/check-library-assets.mjs`
- Modify: `docs/content/launch-content-matrix.md`

**Interfaces:**
- Consumes: each setting's three `imageAssetKeys`.
- Produces: `ResultCore.libraryImage.key` selected deterministically and 48 mobile `require()` mappings.

- [ ] **Step 1: Write failing scoring and asset tests**

```ts
expect(result.libraryImage.key).toMatch(/^library\/v4\/.+-(daily|work|turning)\.webp$/);
expect(new Set(repeatedRuns.map(({ libraryImage }) => libraryImage.key)).size).toBe(1);
```

Update the asset checker to require 16 settings, three unique keys per setting, and 48 existing files.

- [ ] **Step 2: Run checks and verify failure**

Run: `corepack pnpm --filter @pastlife/scoring test`

Run: `node scripts/check-library-assets.mjs`

Expected: FAIL because v4 keys and files do not exist.

- [ ] **Step 3: Implement deterministic image selection**

Select the image index from `answerHash`, `recordNo`, `occupationId`, and `locationId`; store the chosen key in the existing `libraryImage.key` field so API contracts remain unchanged.

- [ ] **Step 4: Add all 48 static mobile mappings**

Map every `asset://library/v4/*.webp` URI to a literal React Native `require()` call. Dynamic filesystem paths must not be used because Metro requires static paths.

- [ ] **Step 5: Update the launch matrix**

Record `3/3 READY` per setting and describe the daily/work/turning scene coverage.

### Task 4: Generate and install 32 new production images

**Files:**
- Create: `apps/mobile/assets/library/v4/*.webp` (48 files after carrying forward or regenerating one base scene per setting)
- Create: `docs/content/image-prompts-v4.md`

**Interfaces:**
- Consumes: setting environment, clothing, avoid list, daily-life notes, work episodes, and life events.
- Produces: three 16:9 historical-scene images per setting named `<slug>-daily.webp`, `<slug>-work.webp`, and `<slug>-turning.webp`.

- [ ] **Step 1: Create the prompt manifest**

For every setting, write three prompts using this exact structure:

```text
Use case: historical-scene
Asset type: mobile past-life result illustration
Primary request: a fictional everyday, work, or turning-point scene grounded in the setting record
Scene/backdrop: use the setting environment and one concrete daily-life note
Subject: one or two ordinary people performing the selected action
Style/medium: cinematic painterly historical illustration, realistic materials, cohesive across the full library
Composition/framing: landscape, medium-wide, clear focal action, safe center crop
Lighting/mood: natural period-appropriate light, reflective rather than sensational
Constraints: period-accurate clothing, tools, architecture and transport; no text; no logos; no watermark
Avoid: copy every item from the setting's visual.avoid list
```

- [ ] **Step 2: Generate one new asset per prompt with built-in ImageGen**

Issue one built-in generation call per distinct asset. Inspect subject, action, period accuracy, absence of text/watermarks, and consistency. Regenerate only failed assets with one targeted correction.

- [ ] **Step 3: Copy final outputs into the workspace**

Save selected files under `apps/mobile/assets/library/v4/` without overwriting the existing v3 library. Convert to WebP only as a mechanical format step when needed.

- [ ] **Step 4: Verify all assets**

Run: `node scripts/check-library-assets.mjs`

Expected: `Verified 48 historical fallback images across 16 settings`.

### Task 5: Full verification and content report

**Files:**
- Create: `docs/content/content-depth-v4-report.md`

**Interfaces:**
- Consumes: all earlier tasks.
- Produces: a release-readiness record with exact counts and known limitations.

- [ ] **Step 1: Run complete verification**

Run: `corepack pnpm run content:check`

Run: `corepack pnpm --filter @pastlife/api test`

Run: `corepack pnpm typecheck`

Expected: all commands pass.

- [ ] **Step 2: Document final counts and limitations**

Record settings, connected occupations, work episodes, local life events, relationship events, images, tests, and any remaining need for professional historical review.

- [ ] **Step 3: Review the diff without changing unrelated work**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors; pre-existing user changes remain present and are not reverted.

