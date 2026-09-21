# Production Content Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the eight fixed era/location/occupation bundles with a historically reviewable, extensible content-pack system that provides at least 32 valid background combinations, deterministic result selection, and automated content-quality checks.

**Architecture:** Keep questions and scoring tags stable, but move historical result content into focused catalog modules. A `HistoricalSetting` owns the era, region, location, cultural notes, visual direction, and compatible occupation IDs; occupation compatibility becomes many-to-many and is validated at startup/test time. Narrative generation continues to consume the existing `ResultCore`, so the mobile/API contract does not change.

**Tech Stack:** TypeScript, Vitest, NestJS, Prisma/PostgreSQL, existing `@pastlife/content` and `@pastlife/scoring` workspaces.

## Global Constraints

- Preserve deterministic results for identical answers and `contentVersion`.
- Preserve all existing public `ResultCore` fields and API response shapes.
- Korean copy must be UTF-8, natural, and explicitly framed as fictional entertainment.
- Every historical setting must include source notes, review status, and visual fallback metadata.
- Do not call a remote text or image model to make core results usable; AI remains an optional enhancement.
- Do not overwrite the uncommitted narrative/mobile work already present in the worktree.
- Version the expanded catalog as `3.0.0`; published `2.5.0` records remain readable.

---

## File Structure

- Create `packages/content/src/historical/types.ts`: historical setting, occupation, provenance, and review-state types.
- Create `packages/content/src/historical/occupations.ts`: reusable occupation catalog independent of location.
- Create `packages/content/src/historical/settings.ts`: 16 launch settings and their compatible occupations.
- Create `packages/content/src/historical/validate.ts`: referential-integrity, minimum-depth, uniqueness, and copy checks.
- Modify `packages/content/src/catalogs.ts`: re-export compatibility arrays for existing consumers without changing IDs already in production.
- Modify `packages/content/src/index.ts`: export the historical pack and validator.
- Modify `packages/scoring/src/result.ts`: select a setting, then an occupation from its compatible pool.
- Create `packages/content/test/historical-content.test.ts`: catalog quality and coverage tests.
- Modify `packages/scoring/test/determinism.test.ts`: deterministic many-to-many selection tests.
- Modify `prisma/schema.prisma`: store content provenance/review metadata and explicit setting/occupation links.
- Modify `prisma/seed.ts`: seed all translations and compatibility rows, including updates to existing rows.
- Create `prisma/migrations/202609210001_production_content_foundation/migration.sql`: schema migration.
- Create `docs/content/historical-content-authoring.md`: authoring and historical-review guide.
- Create `docs/content/launch-content-matrix.md`: human-readable launch inventory and review checklist.

### Task 1: Historical Content Domain and Validation

**Files:**
- Create: `packages/content/src/historical/types.ts`
- Create: `packages/content/src/historical/validate.ts`
- Create: `packages/content/test/historical-content.test.ts`
- Modify: `packages/content/src/index.ts`

**Interfaces:**
- Consumes: existing `CoreTag` from `packages/content/src/types.ts`.
- Produces: `HistoricalSetting`, `HistoricalOccupation`, `ContentProvenance`, `validateHistoricalContent(settings, occupations): ContentIssue[]`.

- [ ] **Step 1: Write the failing validator tests**

```ts
import { describe, expect, it } from 'vitest';
import { historicalOccupations, historicalSettings, validateHistoricalContent } from '../src/index.js';

describe('historical production content', () => {
  it('contains at least 16 settings and 32 valid setting/occupation combinations', () => {
    expect(historicalSettings.length).toBeGreaterThanOrEqual(16);
    expect(historicalSettings.reduce((sum, item) => sum + item.occupationIds.length, 0)).toBeGreaterThanOrEqual(32);
  });

  it('has no structural or editorial validation issues', () => {
    expect(validateHistoricalContent(historicalSettings, historicalOccupations)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `corepack pnpm --filter @pastlife/content test -- historical-content.test.ts`

Expected: FAIL because the historical exports do not exist.

- [ ] **Step 3: Define the domain types**

```ts
import type { CoreTag } from '../types.js';

export type ReviewStatus = 'DRAFT' | 'EDITORIAL_REVIEWED' | 'HISTORICALLY_REVIEWED';
export type ContentProvenance = {
  sourceTitle: string;
  sourceUrl: string;
  accessedOn: string;
  note: string;
};
export type HistoricalOccupation = {
  id: string;
  label: string;
  classId: string;
  affinityTags: CoreTag[];
  dailyActions: readonly string[];
  signatureObjects: readonly string[];
};
export type HistoricalSetting = {
  id: string;
  eraId: string;
  regionId: string;
  label: string;
  presentDayContext: string;
  yearStart: number;
  yearEnd: number;
  affinityTags: CoreTag[];
  occupationIds: readonly string[];
  dailyLifeNotes: readonly string[];
  visual: { fallbackAssetKey: string; environment: string; clothing: string; avoid: readonly string[] };
  reviewStatus: ReviewStatus;
  provenance: readonly ContentProvenance[];
  fallback?: boolean;
};
export type ContentIssue = { code: string; itemId: string; message: string };
```

- [ ] **Step 4: Implement strict catalog validation**

```ts
import type { ContentIssue, HistoricalOccupation, HistoricalSetting } from './types.js';

export function validateHistoricalContent(
  settings: readonly HistoricalSetting[],
  occupations: readonly HistoricalOccupation[],
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const occupationIds = new Set(occupations.map(({ id }) => id));
  const duplicate = (ids: readonly string[]) => ids.find((id, index) => ids.indexOf(id) !== index);
  const duplicateSetting = duplicate(settings.map(({ id }) => id));
  const duplicateOccupation = duplicate(occupations.map(({ id }) => id));
  if (duplicateSetting) issues.push({ code: 'DUPLICATE_SETTING', itemId: duplicateSetting, message: 'Setting ID must be unique' });
  if (duplicateOccupation) issues.push({ code: 'DUPLICATE_OCCUPATION', itemId: duplicateOccupation, message: 'Occupation ID must be unique' });
  for (const setting of settings) {
    if (setting.yearStart >= setting.yearEnd) issues.push({ code: 'INVALID_YEAR_RANGE', itemId: setting.id, message: 'yearStart must precede yearEnd' });
    if (setting.occupationIds.length < 2) issues.push({ code: 'SHALLOW_OCCUPATION_POOL', itemId: setting.id, message: 'At least two occupations are required' });
    if (setting.dailyLifeNotes.length < 3) issues.push({ code: 'SHALLOW_DAILY_LIFE', itemId: setting.id, message: 'At least three daily-life notes are required' });
    if (setting.provenance.length < 2) issues.push({ code: 'INSUFFICIENT_PROVENANCE', itemId: setting.id, message: 'At least two sources are required' });
    for (const occupationId of setting.occupationIds) if (!occupationIds.has(occupationId)) issues.push({ code: 'UNKNOWN_OCCUPATION', itemId: setting.id, message: occupationId });
  }
  return issues;
}
```

- [ ] **Step 5: Export the types and validator, then rerun the focused test**

Add to `packages/content/src/index.ts`:

```ts
export * from './historical/types.js';
export * from './historical/validate.js';
export * from './historical/occupations.js';
export * from './historical/settings.js';
```

Run: `corepack pnpm --filter @pastlife/content test -- historical-content.test.ts`

Expected: FAIL only because the catalogs in Task 2 do not exist yet.

- [ ] **Step 6: Commit**

```bash
git add packages/content/src/historical packages/content/src/index.ts packages/content/test/historical-content.test.ts
git commit -m "feat(content): define historical content domain"
```

### Task 2: Launch Historical Settings and Occupations

**Files:**
- Create: `packages/content/src/historical/occupations.ts`
- Create: `packages/content/src/historical/settings.ts`
- Modify: `packages/content/src/catalogs.ts`
- Test: `packages/content/test/historical-content.test.ts`

**Interfaces:**
- Consumes: `HistoricalSetting` and `HistoricalOccupation` from Task 1.
- Produces: `historicalSettings`, `historicalOccupations`, plus legacy `historicalLocations` and `occupations` projections.

- [ ] **Step 1: Add coverage assertions for cultural breadth**

```ts
it('covers every launch region and avoids one-to-one job locking', () => {
  expect(new Set(historicalSettings.map(({ regionId }) => regionId)).size).toBeGreaterThanOrEqual(8);
  expect(historicalSettings.every(({ occupationIds }) => occupationIds.length >= 2)).toBe(true);
  const reusedJobs = historicalOccupations.filter(({ id }) => historicalSettings.filter(({ occupationIds }) => occupationIds.includes(id)).length >= 2);
  expect(reusedJobs.length).toBeGreaterThanOrEqual(8);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `corepack pnpm --filter @pastlife/content test -- historical-content.test.ts`

Expected: FAIL because no production catalogs exist.

- [ ] **Step 3: Create 16 reviewed-content records and 16 reusable occupations**

Create records for these launch settings, preserving all existing setting IDs where applicable:

```ts
export const historicalSettings: readonly HistoricalSetting[] = [
  // Existing IDs: LOC_MESOPOTAMIA, LOC_GANGES, LOC_ABBASID, LOC_VENICE,
  // LOC_SWASHILI, LOC_ANDES, LOC_STEPPE, LOC_POLYNESIA.
  // New IDs: LOC_HAN_CHANGAN, LOC_HEIAN_KYO, LOC_JOSEON_HANYANG,
  // LOC_MALI_TIMBUKTU, LOC_AZTEC_TENOCHTITLAN, LOC_OTTOMAN_ISTANBUL,
  // LOC_EDO, LOC_INDUSTRIAL_HANSEONG.
];
```

Each setting must contain 2–4 compatible occupation IDs, at least three concrete daily-life notes, an asset key under `library/v3/`, culturally specific visual direction, a negative visual list, and at least two authoritative-source notes. Occupations must include at least two observable daily actions and two handled objects so templates and AI prompts can produce concrete scenes.

- [ ] **Step 4: Project the new catalogs through the legacy API**

Replace the fixed `historicalLocations` and location-derived `occupations` construction in `packages/content/src/catalogs.ts` with:

```ts
export const historicalLocations: HistoricalLocation[] = historicalSettings.map((setting) => ({
  id: setting.id,
  label: setting.label,
  presentDayContext: setting.presentDayContext,
  eraId: setting.eraId,
  regionId: setting.regionId,
  affinityTags: [...setting.affinityTags],
  fallback: setting.fallback,
}));

export const occupations: Occupation[] = historicalOccupations.map((occupation) => ({
  id: occupation.id,
  label: occupation.label,
  classId: occupation.classId,
  allowedEraIds: [...new Set(historicalSettings.filter(({ occupationIds }) => occupationIds.includes(occupation.id)).map(({ eraId }) => eraId))],
  allowedLocationIds: historicalSettings.filter(({ occupationIds }) => occupationIds.includes(occupation.id)).map(({ id }) => id),
  affinityTags: [...occupation.affinityTags],
}));
```

- [ ] **Step 5: Run content tests and type checking**

Run: `corepack pnpm --filter @pastlife/content test && corepack pnpm --filter @pastlife/content typecheck`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 6: Commit**

```bash
git add packages/content/src/historical packages/content/src/catalogs.ts packages/content/test/historical-content.test.ts
git commit -m "feat(content): add production historical catalog"
```

### Task 3: Deterministic Many-to-Many Result Selection

**Files:**
- Modify: `packages/scoring/src/result.ts`
- Modify: `packages/scoring/test/determinism.test.ts`
- Modify: `packages/scoring/test/fallback.test.ts`

**Interfaces:**
- Consumes: `historicalSettings`, `historicalOccupations`, and legacy result IDs.
- Produces: unchanged `calculateResult(input): ResultCore`, now selecting an occupation from the chosen setting's pool.

- [ ] **Step 1: Write failing compatibility and determinism tests**

```ts
it('always chooses an occupation allowed by the selected setting', () => {
  for (const fixture of answerFixtures) {
    const result = calculateResult({ answers: fixture, contentVersion: '3.0.0' });
    const setting = historicalSettings.find(({ id }) => id === result.locationId)!;
    expect(setting.occupationIds).toContain(result.occupationId);
  }
});

it('returns an identical result for identical v3 input', () => {
  const input = { answers: answerFixtures[0]!, contentVersion: '3.0.0' };
  expect(calculateResult(input)).toEqual(calculateResult(input));
});
```

- [ ] **Step 2: Run scoring tests to verify compatibility coverage fails**

Run: `corepack pnpm --filter @pastlife/scoring test -- determinism.test.ts fallback.test.ts`

Expected: at least the new compatibility assertion FAILS.

- [ ] **Step 3: Select from the explicit setting occupation pool**

In `calculateResult`, replace the era/location filter with:

```ts
const setting = historicalSettings.find(({ id }) => id === location.id);
if (!setting) throw new Error(`Location ${location.id} has no historical setting`);
const compatibleOccupations = occupations.filter(({ id }) => setting.occupationIds.includes(id));
if (compatibleOccupations.length === 0) throw new Error(`Location ${location.id} has no compatible occupation`);
const occupation = pickCandidate(compatibleOccupations, scores.tags, `${seed}:occupation`, compatibleOccupations);
```

- [ ] **Step 4: Add a deterministic fallback test for malformed optional data**

The fallback test must assert that the production catalog itself has no empty occupation pool and that `pickCandidate` still returns its marked fallback when handed an empty filtered list.

- [ ] **Step 5: Run all content and scoring tests**

Run: `corepack pnpm --filter @pastlife/content test && corepack pnpm --filter @pastlife/scoring test`

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/scoring/src/result.ts packages/scoring/test/determinism.test.ts packages/scoring/test/fallback.test.ts
git commit -m "feat(scoring): support compatible occupation pools"
```

### Task 4: Persist Versioned Content and Complete Translations

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/202609210001_production_content_foundation/migration.sql`
- Modify: `prisma/seed.ts`
- Modify: `apps/api/test/database-constraints.spec.ts`

**Interfaces:**
- Consumes: validated v3 historical catalogs.
- Produces: `HistoricalSettingSource` and `SettingOccupation` rows plus complete Korean translations.

- [ ] **Step 1: Write failing schema/seed assertions**

Extend the database constraint test to assert that `setting_occupations` has unique `(locationId, occupationId)` pairs and that every translation key referenced by eras, regions, locations, classes, occupations, personalities, relationships, events, and memories exists for version `3.0.0`.

- [ ] **Step 2: Run the database test to verify it fails**

Run: `corepack pnpm --filter @pastlife/api test -- database-constraints.spec.ts`

Expected: FAIL because the new relation tables and translations do not exist.

- [ ] **Step 3: Add normalized provenance and compatibility models**

```prisma
model SettingOccupation {
  locationId   String
  occupationId String
  location     HistoricalLocation @relation(fields: [locationId], references: [id], onDelete: Cascade)
  occupation   Occupation @relation(fields: [occupationId], references: [id], onDelete: Cascade)
  @@id([locationId, occupationId])
  @@map("setting_occupations")
}

model HistoricalSettingSource {
  id          String @id @default(cuid())
  locationId  String
  sourceTitle String
  sourceUrl   String
  accessedOn DateTime
  note        String
  reviewStatus String
  @@index([locationId])
  @@map("historical_setting_sources")
}
```

Add relation fields to `HistoricalLocation` and `Occupation`, and put equivalent SQL with foreign keys into the migration.

- [ ] **Step 4: Make seed updates authoritative and complete**

For each catalog record, upsert both the entity and every referenced Korean translation. Do not retain `update: {}`; update era ranges, affinity tags, labels, compatibility links, visual metadata, and provenance when v3 content changes. Seed `ContentVersion('3.0.0')` only after `validateHistoricalContent` returns no issues.

- [ ] **Step 5: Generate Prisma client and run database tests**

Run: `corepack pnpm exec prisma generate --schema prisma/schema.prisma`

Run: `corepack pnpm --filter @pastlife/api test -- database-constraints.spec.ts`

Expected: Prisma generation succeeds and tests PASS.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/202609210001_production_content_foundation prisma/seed.ts apps/api/test/database-constraints.spec.ts
git commit -m "feat(content): persist versioned historical metadata"
```

### Task 5: Authoring Guide, Visual Inventory, and Release Gate

**Files:**
- Create: `docs/content/historical-content-authoring.md`
- Create: `docs/content/launch-content-matrix.md`
- Modify: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: v3 content validator and catalog exports.
- Produces: repeatable editorial workflow and `content:check` release command.

- [ ] **Step 1: Add the release-gate command**

Add to the root `package.json`:

```json
"content:check": "corepack pnpm --filter @pastlife/content test && corepack pnpm --filter @pastlife/scoring test && corepack pnpm --filter @pastlife/content typecheck"
```

- [ ] **Step 2: Write the authoring guide**

Document exact requirements for a setting: stable ID, accurate date range, two authoritative sources, three daily-life facts, two or more compatible occupations, culturally appropriate naming review, concrete objects/actions, visual prompt and exclusions, Korean editorial review, and historical review. Include the command `corepack pnpm content:check` as the required pre-publish gate.

- [ ] **Step 3: Write the launch matrix**

Create one row per setting with columns: ID, Korean label, date range, region, occupation count, source count, editorial status, historical-review status, fallback image key, asset status. Mark every nonexistent bitmap as `NEEDS_ASSET`; do not claim an asset exists merely because a URI can be generated.

- [ ] **Step 4: Document the runtime policy**

Update `README.md` to state that templates are the guaranteed result path, remote text/image generation is optional, `CONTENT_VERSION=3.0.0` activates the expanded catalog, and missing fallback assets block production release.

- [ ] **Step 5: Run the full release gate**

Run: `corepack pnpm content:check`

Expected: all content/scoring tests and type checks PASS.

Run: `corepack pnpm test`

Expected: all workspace tests PASS; any environment-only integration skip is reported explicitly.

- [ ] **Step 6: Commit**

```bash
git add docs/content README.md package.json
git commit -m "docs(content): add production authoring and release gate"
```

## Self-Review

- Spec coverage: replaces fixed bundles, expands launch content, preserves deterministic generation, adds provenance, completes persistence/translations, and exposes missing image work.
- Scope boundary: actual bitmap illustration production is a separate asset-production project; this plan creates exact asset keys and visual briefs and correctly blocks release while assets are absent.
- Placeholder scan: catalog records are enumerated by stable ID, and every implementation rule and validation threshold is exact.
- Type consistency: `HistoricalSetting.occupationIds` is consumed by legacy projections, scoring, persistence, and tests with the same name and readonly string-array type.
- Compatibility: existing eight location IDs are preserved, and `ResultCore` plus API/mobile response shapes remain unchanged.
