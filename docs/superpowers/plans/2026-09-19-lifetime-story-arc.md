# Lifetime Story Arc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the seven topic-based result cards with one chronological six-chapter life story, plus structured highlights for the defining relationship, decisive event, and present-life echo.

**Architecture:** Keep `NarrativeBlock` as the transport unit, but replace the basic template IDs and contract cardinality from seven topic blocks to six life-stage blocks. The deterministic provider will distribute the existing location, occupation, relationship-event, crisis, consequence, and last-memory facts across a chronological arc; the AI provider will receive the same stage IDs and continuity rules. Present-day interpretation will be delivered as the sage narrator's closing observation inside the death chapter instead of a separate seventh category.

**Tech Stack:** TypeScript 5.9, NestJS 11, Expo Router 57, React Native 0.86, Zod 4, Vitest 3, Playwright.

## Global Constraints

- Use exactly six basic blocks in this order: birth, childhood, youth, turning point, later years, death.
- Preserve the existing `{ id, title, body }` block shape; only the IDs, titles, count, and prose change.
- Tell one continuous life rather than six independent interpretations.
- Every later chapter must refer to a person, object, promise, or consequence introduced earlier.
- Keep the calm master-sage narrator voice without claiming factual or supernatural certainty.
- Keep gender, real-person identity, explicit violence, and deterministic randomness safeguards.
- Target at least 1,800 Korean characters total and 220–1,200 characters per chapter.
- Treat existing sessions/results as disposable pre-launch development data; do not add production migration compatibility for old seven-block records.
- Do not commit automatically because the current working tree contains pre-existing user changes.
- Use `탄생` instead of `태어남`, and call the fifth stage `삶의 끝자락` so lives that end before old age remain coherent.
- Persist a structured story profile beside rendered prose: lifespan band, ending category/cause/context, defining relationship, decisive event, and present-life echo.
- Ending variants may include natural death, illness, accident, disaster, conflict, sacrifice, persecution, disappearance, and self-chosen death. Never describe methods, glamorize self-harm, or use graphic violence.
- Render the three highlights above the six chapters so the user can grasp the life before reading the full chronology.

---

## File Structure

- `packages/content/src/catalogs.ts`: defines the six canonical life-stage templates.
- `packages/contracts/src/result.ts`: validates six blocks in basic result payloads.
- `apps/api/src/providers/story-narrative.ts`: composes the scored facts into a birth-to-death chronology.
- `apps/api/src/providers/ai-narrative.provider.ts`: requests and validates the same six-stage chronology from AI.
- `apps/mobile/src/components/ResultExperience.tsx`: labels the result as a complete lifetime rather than seven records.
- `apps/api/test/story-narrative.spec.ts`: verifies chronology, continuity, concreteness, safety, and determinism.
- `apps/api/test/provider-fallback.spec.ts`: verifies the six-stage fallback and AI request contract.
- `e2e/mobile-journey.spec.ts`: verifies the new chapter titles on the rendered result.
- `docs/story-event-taxonomy.md`: explains where event categories enter the life arc.

### Task 1: Change the shared result contract to six life stages

**Files:**
- Modify: `packages/content/src/catalogs.ts`
- Modify: `packages/contracts/src/result.ts`
- Modify: `apps/mobile/src/components/ResultExperience.tsx`
- Modify: `apps/api/test/story-narrative.spec.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`

**Interfaces:**
- Produces: canonical block IDs `LIFE_BIRTH`, `LIFE_CHILDHOOD`, `LIFE_YOUTH`, `LIFE_MIDLIFE`, `LIFE_LATER_YEARS`, and `LIFE_DEATH`.
- Produces: `BasicResultResponseSchema.blocks` with exactly six items.

- [ ] **Step 1: Update the narrative tests to require chronological IDs**

Replace the expected ID arrays in both API tests with:

```ts
[
  'LIFE_BIRTH',
  'LIFE_CHILDHOOD',
  'LIFE_YOUTH',
  'LIFE_MIDLIFE',
  'LIFE_LATER_YEARS',
  'LIFE_DEATH',
]
```

In `apps/api/test/story-narrative.spec.ts`, add these chronological assertions:

```ts
expect(blocks).toHaveLength(6);
expect(blocks[0]?.title).toBe('태어남 · 세상에 처음 닿은 날');
expect(blocks[1]?.title).toBe('유년기 · 처음 품은 기억');
expect(blocks[2]?.title).toBe('청년기 · 자신의 길을 고른 시절');
expect(blocks[3]?.title).toBe('중년기 · 삶을 뒤흔든 사건');
expect(blocks[4]?.title).toBe('노년기 · 남겨진 것들');
expect(blocks[5]?.title).toBe('죽음 · 마지막으로 떠오른 장면');
expect(blocks[0]?.body).toContain('태어난 날');
expect(blocks[1]?.body).toContain('열 살 무렵');
expect(blocks[2]?.body).toContain('청년이 된 당신');
expect(blocks[3]?.body).toContain('삶의 한가운데');
expect(blocks[4]?.body).toContain('머리카락에 희끗한 빛이 늘어갈 무렵');
expect(blocks[5]?.body).toContain('마지막 숨을 앞둔 밤');
```

- [ ] **Step 2: Run the focused test and confirm the old seven-block contract fails**

Run:

```powershell
corepack pnpm --filter @pastlife/api exec vitest run test/story-narrative.spec.ts test/provider-fallback.spec.ts
```

Expected: FAIL because the current templates still use seven `BASIC_*` IDs.

- [ ] **Step 3: Replace `basicTemplates` with six life-stage templates**

In `packages/content/src/catalogs.ts`, replace `basicTemplates` with:

```ts
export const basicTemplates = [
  { id: 'LIFE_BIRTH', title: '태어남 · 세상에 처음 닿은 날' },
  { id: 'LIFE_CHILDHOOD', title: '유년기 · 처음 품은 기억' },
  { id: 'LIFE_YOUTH', title: '청년기 · 자신의 길을 고른 시절' },
  { id: 'LIFE_MIDLIFE', title: '중년기 · 삶을 뒤흔든 사건' },
  { id: 'LIFE_LATER_YEARS', title: '삶의 끝자락 · 남겨진 것들' },
  { id: 'LIFE_DEATH', title: '죽음 · 마지막으로 떠오른 장면' },
] as const;
```

- [ ] **Step 4: Change the basic-result contract cardinality**

In `packages/contracts/src/result.ts`, change:

```ts
blocks: z.array(BasicBlockSchema).length(6),
```

Do not change `ExtendedResultResponseSchema`; deep and guide results remain four blocks.

- [ ] **Step 5: Update the mobile story introduction**

In `apps/mobile/src/components/ResultExperience.tsx`, replace the story lead with:

```tsx
<Text style={styles.storyLead}>태어남부터 마지막 순간까지, 한 사람의 생애가 여섯 장으로 이어집니다.</Text>
```

- [ ] **Step 6: Run content, contracts, mobile, and API type checks**

Run:

```powershell
corepack pnpm --filter @pastlife/content typecheck
corepack pnpm --filter @pastlife/contracts typecheck
corepack pnpm --filter @pastlife/mobile typecheck
corepack pnpm --filter @pastlife/api typecheck
```

Expected: all four commands pass after the story composer is updated in Task 2; before that, a six-template/seven-body mismatch is allowed only as an intermediate state.

### Task 2: Rewrite the deterministic story as one complete life

**Files:**
- Modify: `apps/api/src/providers/story-narrative.ts`
- Test: `apps/api/test/story-narrative.spec.ts`
- Test: `apps/api/test/story-event-catalog.spec.ts`

**Interfaces:**
- Consumes: existing location scenes, occupation scenes, relationship events, location episode facts, personality, social class, and last memory.
- Produces: `buildStoryNarrative(core: ResultCore): NarrativeBlock[]` with six chronological blocks.

- [ ] **Step 1: Add early-life facts for every supported location**

Add this type and complete map before `EpisodeFacts`:

```ts
type EarlyLifeFacts = {
  birthSetting: string;
  familyDetail: string;
  childhoodAge: string;
  childhoodObject: string;
  childhoodIncident: string;
  learnedValue: string;
};

const earlyLifeFactsByLocation: Record<string, EarlyLifeFacts> = {
  LOC_MESOPOTAMIA: {
    birthSetting: '수로의 물이 가장 낮아지고 점토 벽이 서늘해진 새벽',
    familyDetail: '곡물 자루의 무게를 재고 이웃의 품삯을 기록하던 집안',
    childhoodAge: '열 살 무렵',
    childhoodObject: '금이 간 작은 점토판',
    childhoodIncident: '잘못 새긴 곡물 숫자 하나 때문에 옆집의 배급이 줄어든 것을 발견해 어른에게 알린 일',
    learnedValue: '작은 표시 하나도 누군가의 하루를 바꿀 수 있다는 사실',
  },
  LOC_GANGES: {
    birthSetting: '강 안개가 낮게 깔리고 첫 나룻배의 종이 울리던 아침',
    familyDetail: '나루를 오가는 사람에게 물과 소식을 전하던 집안',
    childhoodAge: '아홉 살 무렵',
    childhoodObject: '대나무 조각에 묶은 짧은 필기구',
    childhoodIncident: '길을 잃은 순례자의 말을 듣고 서로 다른 두 마을의 이름을 그림으로 표시해 준 일',
    learnedValue: '배운 것을 건네면 낯선 사람 사이에도 길이 생긴다는 사실',
  },
  LOC_ABBASID: {
    birthSetting: '시장 문이 열리고 종이 꾸러미가 공방으로 들어오던 이른 아침',
    familyDetail: '여러 언어의 장부와 편지를 옮겨 적던 집안',
    childhoodAge: '열한 살 무렵',
    childhoodObject: '먹이 번진 별자리 종이 한 장',
    childhoodIncident: '버려진 필사본 두 장이 같은 관측 기록의 앞뒤라는 것을 알아본 일',
    learnedValue: '흩어진 조각도 오래 바라보면 하나의 뜻으로 이어진다는 사실',
  },
  LOC_VENICE: {
    birthSetting: '밀물이 돌계단 세 칸째까지 차오르고 새벽 종이 울리던 날',
    familyDetail: '운하의 수위와 배의 도착 시간을 적어 두던 집안',
    childhoodAge: '열 살 무렵',
    childhoodObject: '붉은 실이 묶인 낡은 나침반',
    childhoodIncident: '안개 속에서 길을 잃은 작은 배에 창문 등불의 위치를 손짓으로 알려 준 일',
    learnedValue: '정확한 표식 하나가 보이지 않는 길을 대신할 수 있다는 사실',
  },
  LOC_SWASHILI: {
    birthSetting: '계절풍이 바뀌어 먼 항구의 배들이 한꺼번에 들어오던 새벽',
    familyDetail: '향료 자루를 세고 선원에게 마실 물을 나누던 집안',
    childhoodAge: '아홉 살 무렵',
    childhoodObject: '매듭이 세 개 묶인 짧은 항해줄',
    childhoodIncident: '바람이 달라졌다는 어른들의 말을 듣고 풀린 계류줄을 먼저 발견한 일',
    learnedValue: '눈에 보이지 않는 변화도 반복해서 살피면 먼저 알아챌 수 있다는 사실',
  },
  LOC_ANDES: {
    birthSetting: '산등성이에 첫 햇빛이 닿고 서리가 천천히 녹던 아침',
    familyDetail: '계단밭의 씨앗과 공동 창고의 수량을 나누어 관리하던 집안',
    childhoodAge: '여덟 살 무렵',
    childhoodObject: '색이 다른 끈으로 만든 작은 매듭줄',
    childhoodIncident: '씨앗 자루 하나가 잘못 옮겨진 것을 매듭 수와 대조해 찾아낸 일',
    learnedValue: '공동체의 몫은 기억이 아니라 확인으로 지켜야 한다는 사실',
  },
  LOC_STEPPE: {
    birthSetting: '밤새 불던 바람이 잦아들고 말들이 천막 밖으로 나서던 새벽',
    familyDetail: '이동 경로와 물이 남은 골짜기를 기억하던 집안',
    childhoodAge: '열한 살 무렵',
    childhoodObject: '방향마다 다른 매듭을 묶은 가죽끈',
    childhoodIncident: '눈바람 뒤 사라진 어린 말을 돌표식과 발자국으로 찾아낸 일',
    learnedValue: '앞으로 가는 용기만큼 돌아갈 흔적을 남기는 일이 중요하다는 사실',
  },
  LOC_POLYNESIA: {
    birthSetting: '동쪽 별이 수평선에 닿고 산호빛 바다가 밝아오던 날',
    familyDetail: '파도와 별의 순서를 다음 세대에 가르치던 집안',
    childhoodAge: '아홉 살 무렵',
    childhoodObject: '파도 간격을 표시한 야자 섬유 끈',
    childhoodIncident: '어른들이 놓친 두 번째 너울을 보고 얕은 곳의 아이들에게 물러나라고 외친 일',
    learnedValue: '두려움은 사라지기를 기다리는 것이 아니라 관찰한 것을 말할 때 작아진다는 사실',
  },
};
```

- [ ] **Step 2: Resolve early-life facts beside the existing episode facts**

Inside `buildStoryNarrative`, add:

```ts
const earlyLife = earlyLifeFactsByLocation[location.id];
if (!earlyLife) throw new Error(`Unknown early-life facts: ${location.id}`);
```

- [ ] **Step 3: Replace the seven bodies with a six-stage continuous arc**

Replace `bodies` with:

```ts
const bodies = [
  `좋습니다. 이제 한 사람의 생애가 시작되는 곳부터 기록을 펼쳐 보겠습니다. 당신이 태어난 날은 ${earlyLife.birthSetting}이었습니다. 그곳은 ${era.label}의 ${location.label}, 지금의 지도로는 ${location.presentDayContext}에 닿는 곳이지요. ${locationScene} 당신은 ${earlyLife.familyDetail}에서 첫 울음을 터뜨렸습니다. 기록은 화려한 혈통보다 손에서 손으로 이어지는 일과 약속이 당신의 삶을 둘러싸고 있었다고 전합니다.`,
  `${earlyLife.childhoodAge}, 당신의 성격을 처음 드러낸 사건이 있었습니다. 손에 쥔 것은 ${earlyLife.childhoodObject}이었고, 그날 벌어진 일은 ${earlyLife.childhoodIncident}이었습니다. ${personalityScene} 어른들은 우연이라고 넘겼지만 당신은 그 경험을 오래 기억했습니다. 그날 마음에 남은 것은 ${earlyLife.learnedValue}이었습니다. 훗날 큰 선택 앞에서도 당신은 이 유년기의 교훈으로 돌아오게 됩니다.`,
  `청년이 된 당신은 ${socialClass.label} 계층과 가까운 환경에서 ${occupation.label}의 길을 골랐습니다. 매일 반복한 일은 ${occupationScene}이었습니다. 처음에는 생계를 위한 선택이었지만 손과 눈이 익을수록 다른 사람의 길과 기억을 지키는 책임이 되었습니다. 이 시기에 기록에는 한 사람이 등장합니다. 두 사람의 관계는 “${relationship.label}”로 남아 있습니다. ${relationshipScene} ${relationshipEvent.setup} 아직 삶이 길다고 믿던 두 사람은 각자 이루고 싶은 일을 말하며 미래를 약속했습니다.`,
  `삶의 한가운데, 평범했던 하루의 방향이 바뀝니다. ${episode.openingTime}, 당신은 ${episode.incidentPlace}에서 ${episode.object}을 손에 들고 있었습니다. 곧 ${episode.disruption}이 벌어졌습니다. 주변 사람들이 각자의 것을 챙길 때 당신은 ${episode.choice}. ${relationshipEvent.otherAction} 그 선택의 대가는 분명했습니다. ${episode.immediateCost}. 공식 기록에는 “${event.label}”이라는 한 줄만 남았지만, 당신에게는 무엇을 구했고 무엇을 잃었는지가 선명한 하루였습니다.`,
  `머리카락에 희끗한 빛이 늘어갈 무렵, 그날의 결과는 사람들의 생활 속에 남아 있었습니다. ${episode.timeAfter}, ${episode.consequence}. ${relationshipEvent.aftermath} 당신은 젊은 이들에게 성공한 결과만 들려주지 않았습니다. 두려웠던 순간과 잘못 판단할 뻔한 지점, 곁의 사람이 없었다면 해내지 못했을 일을 함께 전했습니다. 그렇게 ${earlyLife.childhoodObject}에서 시작된 교훈은 다음 세대의 습관과 규칙으로 이어졌습니다.`,
  `마지막 숨을 앞둔 밤, 방 안의 소리는 멀어지고 ${memoryScene.motif} 또한 선명하게 돌아왔습니다. ${memoryScene.detail} 손끝에는 유년기의 ${earlyLife.childhoodObject}, 삶의 한가운데 붙잡았던 ${episode.object}의 감촉이 차례로 되살아났습니다. 그 사람과 나눈 약속, 잃었던 것, 그리고 이후 달라진 이들의 생활을 떠올리며 당신은 자신의 생애가 하나의 방향으로 이어졌음을 이해했습니다. 제가 이 기록에서 마지막으로 짚어 드리고 싶은 것은 결과보다도, 매 시기 무엇을 지키기로 선택했는가입니다. 물론 이 이야기는 당신의 선택을 바탕으로 엮은 창작 서사이지만, 그 선택의 반복은 지금 당신이 중요하게 여기는 마음을 비추고 있습니다.`,
];
```

- [ ] **Step 4: Strengthen continuity assertions**

In `apps/api/test/story-narrative.spec.ts`, add:

```ts
const childhoodObject = '금이 간 작은 점토판';
expect(blocks[1]?.body).toContain(childhoodObject);
expect(blocks[4]?.body).toContain(childhoodObject);
expect(blocks[5]?.body).toContain(childhoodObject);
expect(blocks[3]?.body).toContain('금이 간 점토판과 아직 마르지 않은 곡물 배급 명단');
expect(blocks[5]?.body).toContain('금이 간 점토판과 아직 마르지 않은 곡물 배급 명단');
expect(blocks.map(({ body }) => body).join('\n').length).toBeGreaterThanOrEqual(1_800);
expect(blocks.every(({ body }) => body.length >= 220 && body.length <= 1_200)).toBe(true);
```

- [ ] **Step 5: Run deterministic-story tests**

Run:

```powershell
corepack pnpm --filter @pastlife/api exec vitest run test/story-narrative.spec.ts test/story-event-catalog.spec.ts
```

Expected: PASS with chronology and relationship-event integration intact.

### Task 3: Align AI generation with the six-stage lifetime arc

**Files:**
- Modify: `apps/api/src/providers/ai-narrative.provider.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`

**Interfaces:**
- Consumes: the new six `basicTemplates` IDs and selected relationship event.
- Produces: AI request rules and validation for a continuous birth-to-death story.

- [ ] **Step 1: Update provider request expectations**

In the AI request-contract test, expect:

```ts
format: {
  minTotalCharacters: 1_800,
  minChapterCharacters: 220,
  maxChapterCharacters: 1_200,
},
lifeStages: [
  'birth: family setting and first sensory image',
  'childhood: concrete formative incident and object',
  'youth: occupation choice and relationship beginning',
  'middle age: central incident, choice, and immediate cost',
  'old age: measurable aftermath, changed relationship, and legacy',
  'death: last sensory memory and sage reflection',
],
```

Also require these constraints:

```ts
expect(requestBody?.constraints).toEqual(expect.arrayContaining([
  'tell one continuous life from birth to death, not six independent summaries',
  'carry at least one object and one relationship forward across multiple life stages',
  'do not add a separate present-day interpretation chapter',
]));
```

- [ ] **Step 2: Update validation length bounds**

Replace the constants with:

```ts
const MIN_TOTAL_STORY_LENGTH = 1_800;
const MIN_CHAPTER_LENGTH = 220;
const MAX_CHAPTER_LENGTH = 1_200;
```

- [ ] **Step 3: Add the life-stage request contract**

Add this request member after `format`:

```ts
lifeStages: [
  'birth: family setting and first sensory image',
  'childhood: concrete formative incident and object',
  'youth: occupation choice and relationship beginning',
  'middle age: central incident, choice, and immediate cost',
  'old age: measurable aftermath, changed relationship, and legacy',
  'death: last sensory memory and sage reflection',
],
```

Add these strings to `constraints`:

```ts
'tell one continuous life from birth to death, not six independent summaries',
'carry at least one object and one relationship forward across multiple life stages',
'do not add a separate present-day interpretation chapter',
```

- [ ] **Step 4: Run provider tests**

Run:

```powershell
corepack pnpm --filter @pastlife/api exec vitest run test/provider-fallback.spec.ts
```

Expected: PASS; malformed, short, gendered, or factual-claim AI responses still fall back to the deterministic lifetime story.

### Task 4: Update the rendered journey and verify end to end

**Files:**
- Modify: `e2e/mobile-journey.spec.ts`
- Modify: `docs/story-event-taxonomy.md`

**Interfaces:**
- Consumes: six-block API response rendered by `ResultExperience`.
- Produces: browser evidence that the complete assessment ends in a readable chronological life story.

- [ ] **Step 1: Replace topic-title assertions in the mobile journey**

Replace the old result-title expectations with:

```ts
await expect(page.getByText('태어남 · 세상에 처음 닿은 날')).toBeVisible();
await expect(page.getByText('유년기 · 처음 품은 기억')).toBeVisible();
await expect(page.getByText('청년기 · 자신의 길을 고른 시절')).toBeVisible();
await expect(page.getByText('중년기 · 삶을 뒤흔든 사건')).toBeVisible();
await expect(page.getByText('노년기 · 남겨진 것들')).toBeVisible();
await expect(page.getByText('죽음 · 마지막으로 떠오른 장면')).toBeVisible();
await expect(page.getByText(/한 사람의 생애가 여섯 장으로 이어집니다/)).toBeVisible();
```

Update the archived-detail assertion from the removed `나는 어떤 사람이었는가` title to `태어남 · 세상에 처음 닿은 날`.

- [ ] **Step 2: Document event placement in the life arc**

In `docs/story-event-taxonomy.md`, replace the combination sequence with:

```md
1. 태어남: 시대·지역·가정 환경을 배치한다.
2. 유년기: 성격을 만든 작은 사건과 반복 등장할 물건을 소개한다.
3. 청년기: 직업을 선택하고 중요한 인연을 만난다.
4. 중년기: 지역 사건과 관계 사건을 결합해 가장 큰 선택과 대가를 만든다.
5. 노년기: 측정 가능한 결과, 달라진 관계, 다음 세대에 남긴 유산을 보여 준다.
6. 죽음: 유년기의 물건과 중년기의 사건을 다시 불러와 한 생애를 닫는다.
```

- [ ] **Step 3: Run the full automated checks**

Run:

```powershell
corepack pnpm --filter @pastlife/api test
corepack pnpm -r --if-present typecheck
```

Expected: all API tests and workspace type checks pass.

- [ ] **Step 4: Verify the browser result with a fresh assessment**

Use the already installed Chrome executable with the repository's Playwright runtime, complete six question stages, and wait for `/result`.

Expected:

- All six life-stage titles are visible in chronological order.
- The story lead says a complete lifetime is told in six chapters.
- The childhood object reappears in old age and death.
- The page remains vertically scrollable at 390×844 without clipped chapter text.
- A newly created session returns six blocks accepted by `BasicResultResponseSchema`.

---

## Self-Review

- Spec coverage: all six requested stages—birth, childhood, youth, middle age, old age, death—have canonical IDs, concrete content responsibilities, API validation, UI copy, and browser assertions.
- Continuity: the childhood object, important relationship, central choice, and aftermath recur across chapters instead of resetting per card.
- Type consistency: `basicTemplates`, deterministic output, AI output, Zod contract, and UI tests all use six blocks; deep and guide results remain four blocks.
- Scope control: no database migration or backward-compatibility layer is added because the product is pre-launch.
- Placeholder scan: every implementation step includes exact code or commands; no deferred behavior remains.
