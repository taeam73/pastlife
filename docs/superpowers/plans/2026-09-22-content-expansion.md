# Historical Content Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the historical content system so every declared era is playable, all occupations are connected, event taxonomy has real narrative data, and generated stories have substantially more cultural and structural variety.

**Architecture:** Keep catalog data in `packages/content` and selection/orchestration in `apps/api`. Replace orphan occupation rows with connected occupations, add 20th-century settings and setting-specific episode expansions, broaden personality/relationship/guide catalogs, and make the narrative provider consume setting-specific scenes instead of relying mainly on generic fallback prose. Strengthen content validation and deterministic tests so future additions cannot silently become unreachable.

**Tech Stack:** TypeScript, pnpm workspace, Prisma seed catalogs, Vitest.

## Global Constraints

- Preserve all existing user changes in the working tree; do not reset or overwrite unrelated edits.
- Keep deterministic result generation: identical `ResultCore` input must produce identical output.
- Every historical setting must have valid era/region IDs, at least four connected occupations, three daily-life notes, two provenance entries, three images, four work episodes, and four life events.
- Do not leave catalog entries unreachable from a historical setting or result-selection path.
- Keep content non-graphic and culturally specific; use source-backed historical framing already established in `historical/settings.ts`.

---

### Task 1: Establish coverage tests before expanding data

**Files:**
- Modify: `packages/content/test/historical-content.test.ts`
- Modify: `apps/api/test/story-event-catalog.spec.ts`
- Create: `apps/api/test/content-coverage.spec.ts`

**Interfaces:**
- Consume `eras`, `historicalSettings`, `occupations`, `personalities`, `relationships`, `lifeEvents`, `guideTemplates`, `STORY_EVENT_TAXONOMY`, `relationshipEventCounts`, and `findHistoricalSettingExpansion`.
- Produce failing assertions that encode the requested minimums and orphan checks.

- [ ] Assert every era, including `ERA_20C_EARLY` and `ERA_20C_LATE`, has at least one setting.
- [ ] Assert every occupation has at least one setting reference and no `OCC_01` through `OCC_08` remains.
- [ ] Assert at least 12 personalities and 10 guide templates.
- [ ] Assert each relationship type has at least 8 concrete events.
- [ ] Assert every taxonomy type used by work/community/journey/inner catalogs has concrete events in at least one setting expansion.
- [ ] Run `pnpm --filter @pastlife/content test` and `pnpm --filter @pastlife/api test -- --runInBand`; record expected failures before implementation.

### Task 2: Replace orphan occupations with connected historical occupations

**Files:**
- Modify: `packages/content/src/historical/occupations.ts`
- Modify: `packages/content/src/historical/settings.ts`
- Modify: `packages/content/src/catalogs.ts`
- Modify: `prisma/seed.ts`

**Interfaces:**
- Preserve `HistoricalOccupation` and `Occupation` shapes.
- Ensure `occupations` derives `allowedEraIds` and `allowedLocationIds` from settings and has no empty allowed lists.

- [ ] Remove `OCC_01`–`OCC_08` from the exported occupation catalog and remove their narrative lookup entries from `apps/api/src/providers/story-narrative.ts`.
- [ ] Add connected occupations covering industrial, wartime, postwar, and late-modern settings, such as `OCC_FACTORY_WORKER`, `OCC_NURSE`, `OCC_JOURNALIST`, `OCC_RADIO_TECHNICIAN`, `OCC_CIVIL_SERVANT`, `OCC_PHOTOGRAPHER`, `OCC_PROGRAMMER`, and `OCC_COMMUNITY_ORGANIZER`.
- [ ] Add those IDs to historically suitable settings, with period-appropriate classes, tags, daily actions, and signature objects.
- [ ] Add a validation issue for an occupation with zero setting references and test it.

### Task 3: Add 20th-century and additional bridge settings

**Files:**
- Modify: `packages/content/src/historical/settings.ts`
- Modify: `packages/content/src/historical/expansions.ts`
- Modify: `packages/content/src/historical/types.ts` if new expansion fields are needed
- Modify: `packages/content/test/historical-content.test.ts`

**Interfaces:**
- Keep `HistoricalSetting` and `HistoricalSettingExpansion` compatible with `findHistoricalSettingExpansion` and `selectHistoricalEpisodes`.

- [ ] Add at least four settings for `ERA_20C_EARLY`: for example 1920s Shanghai, 1930s Berlin, 1940s Seoul, and 1940s Cairo.
- [ ] Add at least four settings for `ERA_20C_LATE`: for example 1950s Busan, 1960s Tokyo, 1980s Lagos, and 1990s São Paulo.
- [ ] Add at least two additional settings to strengthen underrepresented regions and connect new occupations.
- [ ] Give each setting period-specific daily life, clothing/environment, provenance, occupation pools, and expansion episodes.
- [ ] Ensure all new settings have three distinct image asset keys under `library/v3/`; update asset checks only when real assets exist or the established fallback convention supports them.

### Task 4: Expand real event data beyond relationship stories

**Files:**
- Modify: `apps/api/src/providers/story-event-catalog.ts`
- Modify: `packages/content/src/historical/expansions.ts`
- Create or modify: `apps/api/test/event-taxonomy-coverage.spec.ts`

**Interfaces:**
- Add typed concrete catalogs for `WORK`, `COMMUNITY`, `JOURNEY`, and `INNER` events while preserving `STORY_EVENT_TAXONOMY` and deterministic selection.
- Export a coverage helper returning counts by category/type for tests and admin diagnostics.

- [ ] Expand each relationship type to at least eight events with distinct conflict, care, separation, mentorship, reconciliation, rivalry, role-reversal, and encounter arcs.
- [ ] Add setting-compatible work events for failure, discovery, commission, craft conflict, and legacy.
- [ ] Add community events for disaster, shortage, migration, festival, power shift, and collective decision.
- [ ] Add journey events for departure, lost route, rescue, return, and exploration.
- [ ] Add inner events for promise, secret, regret, moral dilemma, and redemption.
- [ ] Select events using `answerHash`, `recordNo`, setting ID, occupation ID, and event type so repeated results do not overuse the same story.

### Task 5: Expand personality, relationship, and guide catalogs

**Files:**
- Modify: `packages/content/src/catalogs.ts`
- Modify: `apps/api/src/providers/story-narrative.ts`
- Modify: `apps/api/src/providers/extended-narratives.ts` if personality-specific prose is used there
- Modify: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Keep catalog candidates compatible with scoring and `requireCatalogItem`.

- [ ] Expand personalities to at least 12 with distinct strengths, blind spots, social masks, stress responses, and compatible tags.
- [ ] Expand relationships to at least 10 types, including caregiver, sibling, collaborator, rival, apprentice, patron, neighbor, lost love, chosen family, and community elder.
- [ ] Expand guides to at least 10 actionable types with non-overlapping advice and tag rules.
- [ ] Add scene maps or structured fields so each new personality and relationship produces materially different prose rather than only a label substitution.
- [ ] Add deterministic tests verifying new IDs are accepted and produce different narrative sections.

### Task 6: Make historical setting identity flow through the narrative

**Files:**
- Modify: `apps/api/src/providers/historical-episode-catalog.ts`
- Modify: `apps/api/src/providers/story-narrative.ts`
- Modify: `apps/api/src/providers/extended-narratives.ts`
- Modify: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Extend selected episode output with category/type metadata and setting-specific daily-life hooks without breaking existing `work` and `life` consumers.

- [ ] Include setting-specific daily-life notes, work episode, life event, community event, and journey/inner event in the generated profile and basic narrative.
- [ ] Replace generic fallback event sentences when a concrete setting event exists.
- [ ] Ensure 20th-century stories mention period-specific institutions, technology, migration, work, or social change from the selected setting.
- [ ] Keep narrative output deterministic and ensure no unknown catalog ID can reach the provider.

### Task 7: Seed, verify, and document content coverage

**Files:**
- Modify: `prisma/seed.ts` if new persisted content tables/fields are required
- Modify: `README.md` or create `docs/content/content-coverage.md`
- Modify: relevant package scripts only if needed for repeatable checks

**Interfaces:**
- No runtime API changes unless required by the existing seed model.

- [ ] Run content, API, scoring, and relevant end-to-end tests.
- [ ] Run TypeScript builds for changed packages.
- [ ] Run a deterministic matrix over all settings, occupations, personalities, relationships, events, and guides to detect unknown IDs and empty narrative sections.
- [ ] Document catalog counts, era coverage, event coverage, and the rule that every occupation must be connected to a setting.
- [ ] Review `git diff` and report any pre-existing modified files left untouched.

## Self-review checklist

- Confirm all six requested problem areas have a concrete implementation task.
- Confirm no catalog is expanded without a selection path and tests.
- Confirm no new era or occupation is merely declared without settings and narrative data.
- Confirm deterministic selection inputs include enough entropy to avoid repeated stories.
- Confirm the final test commands and resulting counts are reported to the user.
