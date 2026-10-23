# Story Identity and Visual Integration Implementation Plan

This plan tracks a single-agent implementation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every 3.0 story result identify a named life and place on the existing cinematic result screen, and establish a story-specific visual path beginning with the clown.

**Architecture:** Extend each `StoryCard` with authored `name`, `home`, and `identityLine` rather than deriving Korean prose with brittle particles. Populate the existing result character and presentation fields, add one compact place label to the hero, and resolve story-specific imagery by story ID with the existing shared background as a fallback.

**Tech Stack:** TypeScript, NestJS, React Native/Expo, Vitest, PNG assets.

## Global Constraints

- Preserve 2.5.0 results and the current 3.0.0 scoring and questions.
- First 12 stories must remain fiction, not claimed historical biographies.
- Human lives remain the center; the rock remains a rare exception.
- Name, place, role, event and present-day echo must be coherent without claiming past-life causes for current symptoms or personality.
- Preserve the approved dark-navy, antique-gold cinematic UI and 320px-to-tablet responsiveness.
- Do not overwrite existing assets or unrelated dirty worktree files; do not commit or deploy in this pass.

---

### Task 1: Name the twelve lives

**Files:**
- Modify: `packages/content/src/story-catalog.ts`
- Modify: `packages/content/test/story-questions.test.ts`

**Interfaces:**
- Produces `StoryCard.name`, `StoryCard.home`, and `StoryCard.identityLine` as nonempty strings for `buildContentStoryResult`.

- [x] **Step 1: Write a failing catalog test.** Add checks in the existing card-library test for nonempty `name`, `home`, and `identityLine`, unique `name`/`home` pairs, and that `identityLine` includes both the name and home.
- [x] **Step 2: Verify red.** Run `corepack pnpm --filter @pastlife/content test`; it must fail on missing identity fields.
- [x] **Step 3: Write twelve distinct identities.** Add three required strings to `StoryCard` and every card. Use the following character/place pairs: `CLOWN` 루보/바람골 장터, `ROOM7` 이루/비돌개 고개, `BLANK_ORDER` 세아/안개성, `SILENT_BELL` 다온/갈대강 마을, `NIGHT_GUIDE` 마루/솔등 산골, `MIRROR` 모아/비늘빛 골목, `HERBALIST` 라비/안개숲 마을, `DRAGON_DREAM` 오르/잠든 용의 도서관, `LAST_SIGNAL` 한결/여울호 우주선, `SHADE_TENT` 이로/낮별 행성, `REVERSE_MAP` 누리/물방울 바다, `SHORE_ROCK` 파도틈/바람턱 해안. Each `identityLine` must say who lived there and what they did; for the rock, say it was called 파도틈 rather than assigning a human occupation.
- [x] **Step 4: Verify green.** Run the same content test and the package typecheck; both must pass.

### Task 2: Connect identity to result UI

**Files:**
- Modify: `apps/api/src/results/story-result.ts`
- Modify: `apps/mobile/src/components/ResultExperience.tsx`
- Modify: `apps/mobile/src/components/CinematicChapterPager.tsx`
- Modify: `apps/mobile/src/components/ResultHero.tsx`
- Modify: `apps/api/test/content-reboot.e2e.spec.ts`

**Interfaces:**
- Consumes the three authored identity fields.
- Produces `character.name`, `character.favoritePlace`, authored introduction, hero life summary, and a compact place label on the result hero.

- [x] **Step 1: Make the v3 API test require an actual name and place.** Assert the returned character name is not `이야기 속 당신`, `favoritePlace` is nonempty, and the hero summary contains both.
- [x] **Step 2: Verify red.** Run `corepack pnpm test:e2e`; the v3 flow must fail the new name assertion.
- [x] **Step 3: Wire authored identity.** Connect name/place and authored introduction. The hero keeps only `identityLine` so the first image remains visible on 320px; chapter one carries the longer life paragraph.
- [x] **Step 4: Verify green and responsive layout.** API E2E, mobile typecheck and focused browser E2E passed; 320px and 768px screenshots were inspected.

### Task 3: Give the clown a truthful first scene and define visual production

**Files:**
- Create: `apps/mobile/assets/stories/v3/clown-hero.jpg` (generated then resized for mobile)
- Modify: `apps/api/src/providers/library-image.provider.ts`
- Modify: `apps/mobile/src/results/libraryImages.ts`
- Modify: `apps/api/test/content-reboot.e2e.spec.ts`
- Create: `docs/content-reboot-visual-pipeline.md`

**Interfaces:**
- `asset://stories/v3/clown-hero.png` resolves in the mobile asset registry and is returned for `CLOWN`; other v3 stories retain `asset://branding/main-bg-01.png` until their story-locked visual is ready.

- [x] **Step 1: Add targeted image assertions.** Unit-test the library provider's `CLOWN` asset URI and a non-clown fallback. Existing v3 E2E accepts the selected story's URI.
- [x] **Step 2: Verify red.** The targeted provider test failed on the generic fallback before implementation.
- [x] **Step 3: Connect image by story ID.** The clown URI resolves in the provider and React Native registry without reusing a 2.5.0 portrait.
- [x] **Step 4: Record the visual rule.** `docs/content-reboot-visual-pipeline.md` documents hybrid layered/composite selection and the clown prompt.
- [x] **Step 5: Verify.** Typecheck, tests, content check, API E2E, focused 320px/768px browser E2E, image inspection, and diff check were performed.

## Self-review

- These tasks implement the newly requested named identity and image composition without changing selection/scoring or the 120-story target.
- Remaining 108 stories must each pass the identity and visual-brief gates before joining the live catalog; bulk image production follows approved prose rather than preceding it.
