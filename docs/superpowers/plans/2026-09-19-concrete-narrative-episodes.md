# Concrete Narrative Episodes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every newly generated past-life result feel tangible by having a calm master-sage narrator reveal a coherent, concrete episode with a time, place, physical object, human interaction, consequential choice, and observable aftermath.

**Architecture:** Keep the existing seven-block result contract and stored-result model unchanged. Enrich the deterministic fallback in `story-narrative.ts` with typed episode facts selected from the already scored location, occupation, relationship, event, and last-memory IDs, then make the AI provider request and validate the same narrative shape. This is a pre-launch environment, so development results may be regenerated or cleared when verifying the new prose.

**Tech Stack:** TypeScript 5.9, NestJS 11, Vitest 3, existing `@pastlife/content`, `@pastlife/scoring`, and `@pastlife/contracts` packages.

## Global Constraints

- Preserve the public API: exactly seven `{ id, title, body }` blocks in the current `basicTemplates` order.
- Preserve deterministic output for the same `ResultCore`; do not use current time, randomness, or network data in the template provider.
- Use second-person Korean prose and do not infer gender, a real historical identity, or a real named person.
- Frame each chapter as a calm master sage reading an old record directly to the user, while never claiming the story is factual or supernatural truth.
- Treat the result as creative entertainment, not a historical or supernatural fact claim.
- Avoid explicit violence; describe danger through disrupted work, evacuation, loss of records, separation, or material consequences.
- Every story must include at least one episode with a time cue, a place cue, a handled object, another person's observable action, the user's choice, and a later consequence.
- Increase the accepted story floor from 1,100 to 1,600 Korean characters while keeping each block between 140 and 1,000 characters.
- Treat existing sessions and results as disposable development data; verification may regenerate or clear them after confirming the exact development-only scope.

---

## File Structure

- `apps/api/src/providers/story-narrative.ts`: owns deterministic scene facts and composes the seven connected story chapters.
- `apps/api/src/providers/ai-narrative.provider.ts`: owns AI request instructions and structural validation before accepting AI prose.
- `apps/api/test/story-narrative.spec.ts`: focused regression tests for concreteness, determinism, safety, and chapter structure.
- `apps/api/test/provider-fallback.spec.ts`: retains provider fallback coverage and gains assertions for the richer AI request contract.

### Task 1: Lock the concrete-story acceptance criteria in tests

**Files:**
- Create: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Consumes: `buildStoryNarrative(core: ResultCore): NarrativeBlock[]` from `apps/api/src/providers/story-narrative.ts`.
- Produces: executable acceptance criteria for seven chapters, a 1,600-character minimum, deterministic output, concrete scene anchors, a visible consequence, and gender neutrality.

- [ ] **Step 1: Add the focused failing test**

Create `apps/api/test/story-narrative.spec.ts` with this content:

```ts
import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { buildStoryNarrative } from '../src/providers/story-narrative.js';

const core = {
  contentVersion: '2.5.0',
  answerHash: 'concrete-story-fixture',
  recordNo: 17,
  scores: { tags: {}, axes: {}, topTags: [] },
  eraId: 'ERA_ANCIENT_CIV',
  regionId: 'REG_EAST_ASIA',
  locationId: 'LOC_MESOPOTAMIA',
  classId: 'CLASS_SCHOLAR',
  occupationId: 'OCC_01',
  personalityId: 'PERSON_ANALYTIC',
  relationshipId: 'REL_COMPANION',
  eventId: 'EVENT_01',
  lastMemoryId: 'MEM_RAIN',
  basicBlockIds: [],
  libraryImage: { key: 'ancient-east-asia', promptTags: [] },
} as unknown as ResultCore;

describe('buildStoryNarrative', () => {
  it('builds a deterministic seven-chapter story around a concrete episode', () => {
    const blocks = buildStoryNarrative(core);
    const fullStory = blocks.map(({ body }) => body).join('\n');

    expect(blocks.map(({ id }) => id)).toEqual([
      'BASIC_COVER',
      'BASIC_PERSON',
      'BASIC_DAILY',
      'BASIC_RELATIONSHIP',
      'BASIC_EVENT',
      'BASIC_LAST_MEMORY',
      'BASIC_TRACE',
    ]);
    expect(fullStory.length).toBeGreaterThanOrEqual(1_600);
    expect(blocks.every(({ body }) => body.length >= 140 && body.length <= 1_000)).toBe(true);
    expect(fullStory).toContain('동이 트기 전');
    expect(fullStory).toContain('서쪽 창고');
    expect(fullStory).toContain('금이 간 점토판');
    expect(fullStory).toContain('젖은 소매로 판을 감쌌');
    expect(fullStory).toContain('곡물 배급 명단');
    expect(fullStory).toContain('사흘 뒤');
    expect(fullStory).toContain('열두 가구');
    expect(fullStory).not.toMatch(/남자|여자|남성|여성/);
    expect(buildStoryNarrative(core)).toEqual(blocks);
  });

  it('changes scene details when the scored location and work change', () => {
    const oceanStory = buildStoryNarrative({
      ...core,
      eraId: 'ERA_AGE_OF_EXPLORATION',
      regionId: 'REG_SUBSAHARAN_AFRICA',
      locationId: 'LOC_SWASHILI',
      classId: 'CLASS_MERCHANT',
      occupationId: 'OCC_05',
      eventId: 'EVENT_05',
      lastMemoryId: 'MEM_SEA',
    } as ResultCore).map(({ body }) => body).join('\n');

    expect(oceanStory).toContain('산호석 부두');
    expect(oceanStory).toContain('매듭을 묶은 항해줄');
    expect(oceanStory).toContain('계절풍');
    expect(oceanStory).not.toContain('곡물 배급 명단');
  });
});
```

- [ ] **Step 2: Run the new test and verify the richer requirements fail**

Run:

```powershell
corepack pnpm --filter @pastlife/api exec vitest run test/story-narrative.spec.ts
```

Expected: FAIL because the current prose is shorter than 1,600 characters and does not contain the concrete Mesopotamian episode markers.

- [ ] **Step 3: Commit the acceptance test**

```powershell
git add apps/api/test/story-narrative.spec.ts
git commit -m "test: define concrete narrative episode criteria"
```

### Task 2: Compose a specific deterministic episode from scored facts

**Files:**
- Modify: `apps/api/src/providers/story-narrative.ts`
- Test: `apps/api/test/story-narrative.spec.ts`

**Interfaces:**
- Consumes: `ResultCore` IDs and the existing content catalogs.
- Produces: `buildStoryNarrative(core: ResultCore): NarrativeBlock[]` with the unchanged seven-block interface.

- [ ] **Step 1: Add typed scene facts beside the existing scene maps**

Add these types and facts after `memoryScenes`:

```ts
type EpisodeFacts = {
  openingTime: string;
  incidentPlace: string;
  object: string;
  disruption: string;
  choice: string;
  immediateCost: string;
  timeAfter: string;
  consequence: string;
};

const episodeFactsByLocation: Record<string, EpisodeFacts> = {
  LOC_MESOPOTAMIA: {
    openingTime: '동이 트기 전',
    incidentPlace: '도시 서쪽 창고',
    object: '금이 간 점토판과 아직 마르지 않은 곡물 배급 명단',
    disruption: '밤새 불어난 수로가 창고 문턱을 넘어와 낮은 선반의 기록부터 진흙물에 잠기기 시작한 일',
    choice: '당신은 값비싼 거래 장부보다 먼저 배급 명단을 꺼내 들었고, 오랜 동료는 젖은 소매로 판을 감싸 품에 안았습니다',
    immediateCost: '두 사람은 개인 물품과 그달의 품삯 장부를 물에 남겨 둔 채 지붕이 높은 곡물 계량소까지 달려야 했습니다',
    timeAfter: '사흘 뒤',
    consequence: '남겨 온 명단 덕분에 누락될 뻔한 열두 가구가 제 몫의 곡물을 받았고, 당신은 번진 쐐기 하나씩을 새 판에 다시 새겼습니다',
  },
  LOC_GANGES: {
    openingTime: '해가 강 안개를 걷어 내기 전',
    incidentPlace: '나루 옆 작은 배움터',
    object: '기름 먹인 천으로 싼 수업 기록과 대나무 필기구',
    disruption: '상류의 비로 강물이 빠르게 올라 아이들과 장사꾼이 함께 쓰던 나루가 닫힌 일',
    choice: '당신은 수업을 접는 대신 높은 사원 회랑으로 자리를 옮겨 건너오지 못한 이들의 소식을 한 줄씩 받아 적었습니다',
    immediateCost: '젖은 길을 오가느라 준비한 종이 절반을 잃고 며칠 동안 제대로 쉬지 못했습니다',
    timeAfter: '닷새 뒤',
    consequence: '그 명단을 보고 헤어진 가족 세 무리가 서로의 거처를 찾았고, 배움터의 학생들은 처음으로 글이 사람을 이어 주는 장면을 보았습니다',
  },
  LOC_ABBASID: {
    openingTime: '저녁 기도 뒤 등불이 켜질 무렵',
    incidentPlace: '종이 시장 뒤편의 번역 공방',
    object: '가장자리가 그을린 별자리 필사본',
    disruption: '옆 창고의 화로가 넘어져 연기가 골목을 메우고 여러 언어로 적힌 원고가 흩어진 일',
    choice: '당신은 완성본 한 권을 챙기기보다 서로 다른 필사본의 빠진 쪽을 맞춰 한 묶음으로 만들었습니다',
    immediateCost: '자신이 수개월 동안 베껴 온 원고는 절반을 잃었고 손에는 며칠 동안 먹 냄새와 재가 남았습니다',
    timeAfter: '일주일 뒤',
    consequence: '학자 셋이 그 묶음을 나누어 다시 옮겨 적으면서 사라질 뻔한 관측표가 복원되었고 공방은 사본을 여러 곳에 두는 규칙을 세웠습니다',
  },
  LOC_VENICE: {
    openingTime: '새벽 종이 세 번 울린 뒤',
    incidentPlace: '북쪽 운하의 지도 공방',
    object: '붉은 실로 항로를 표시한 양피지 지도',
    disruption: '예상보다 높은 밀물이 작업대 아래까지 차올라 먹물과 항해 기록을 번지게 한 일',
    choice: '당신은 의뢰인의 화려한 장식 지도보다 귀항하지 않은 배들의 마지막 좌표가 적힌 지도를 먼저 들어 올렸습니다',
    immediateCost: '비싼 안료 상자와 완성 직전의 개인 작품은 물에 젖어 다시 쓸 수 없게 되었습니다',
    timeAfter: '나흘 뒤',
    consequence: '보존한 좌표를 바탕으로 수색선 두 척이 암초를 피해 나갔고 선원 가족들은 기다릴 방향을 알게 되었습니다',
  },
  LOC_SWASHILI: {
    openingTime: '아침 계절풍이 방향을 바꾸기 직전',
    incidentPlace: '산호석 부두의 세 번째 계류장',
    object: '매듭을 묶은 항해줄과 조개껍데기로 표시한 별자리 판',
    disruption: '먼바다에서 돌아온 작은 배가 돛대 손상으로 암초 쪽으로 밀려난 일',
    choice: '당신은 예정된 큰 상선의 출항을 늦추고 그 배의 선원들에게 바람이 비는 좁은 수로를 손짓과 북소리로 알려 주었습니다',
    immediateCost: '상인은 지연된 화물 값을 당신 몫에서 빼겠다고 했고 다음 항해의 자리를 보장하지 않았습니다',
    timeAfter: '해가 두 번 뜬 뒤',
    consequence: '구조된 선원 여섯 명이 부두로 돌아왔고 항구 사람들은 당신의 매듭 표시를 공용 항해줄에 그대로 옮겼습니다',
  },
  LOC_ANDES: {
    openingTime: '산등성이에 첫 햇빛이 닿기 전',
    incidentPlace: '상단 계단밭의 돌창고',
    object: '씨앗 수량을 표시한 매듭끈과 작은 감자 자루',
    disruption: '밤서리가 예상보다 일찍 내려 아랫마을의 씨앗 저장분이 얼기 시작한 일',
    choice: '당신은 자기 가족 몫의 자루를 먼저 숨기지 않고 매듭끈의 수량대로 여러 집에 나누었습니다',
    immediateCost: '당신의 밭은 다음 철에 절반만 심을 수 있었고 가족은 먼 친척에게 식량을 빌려야 했습니다',
    timeAfter: '다음 파종철',
    consequence: '씨앗을 받은 아홉 집이 모두 밭을 되살렸고 수확 첫날 각 집은 한 줌씩을 당신의 빈 자루에 돌려놓았습니다',
  },
  LOC_STEPPE: {
    openingTime: '별빛이 옅어지고 말들이 깨어날 무렵',
    incidentPlace: '겨울 야영지 남쪽의 마른 골짜기',
    object: '바람 방향을 표시한 가죽끈과 약초 꾸러미',
    disruption: '갑작스러운 눈바람으로 뒤따르던 두 천막의 흔적이 끊긴 일',
    choice: '당신은 이동 대열을 계속 따르지 않고 오랜 동료와 말을 돌려 전날 세워 둔 돌표식을 역순으로 찾았습니다',
    immediateCost: '식량과 마른 땔감 대부분을 길 잃은 이들에게 내어 주어 돌아오는 길을 굶주린 채 견뎌야 했습니다',
    timeAfter: '이틀 뒤',
    consequence: '아이를 포함한 다섯 사람이 주 야영지에 도착했고 이후 모든 이동대는 골짜기마다 같은 모양의 돌표식을 남겼습니다',
  },
  LOC_POLYNESIA: {
    openingTime: '동쪽 별이 수평선 아래로 내려가기 전',
    incidentPlace: '섬 북쪽의 얕은 암초 길',
    object: '파도 간격을 묶어 표시한 야자 섬유 끈',
    disruption: '낯선 너울이 들어와 식량을 실은 카누가 평소의 물길에서 자꾸 바깥쪽으로 밀린 일',
    choice: '당신은 가장 짧은 길을 포기하고 별 하나와 파도 두 줄이 겹치는 먼 우회로로 노를 돌리게 했습니다',
    immediateCost: '도착이 하루 늦어져 축제의 첫 의식에 참여하지 못했고 남은 물을 여섯 사람이 나누어 마셔야 했습니다',
    timeAfter: '다음 날 해 질 무렵',
    consequence: '카누와 식량이 모두 마을에 닿았고 젊은 항해자들은 당신의 야자 끈 매듭을 새 표지법으로 배웠습니다',
  },
};
```

- [ ] **Step 2: Resolve the episode facts and replace the seven body templates**

In `buildStoryNarrative`, resolve the episode after `memoryScene`:

```ts
const episode = requireCatalogItem(
  Object.entries(episodeFactsByLocation).map(([id, facts]) => ({ id, ...facts })),
  location.id,
  'episode facts',
);
```

Replace `bodies` with the following composition. It keeps the seven existing chapters but makes chapters three through six one continuous episode:

```ts
const bodies = [
  `당신의 ${core.recordNo}번째 전생은 ${era.label}, ${location.label}에서 시작됩니다. 지금의 지도로는 ${location.presentDayContext}에 닿는 곳입니다. ${locationScene} 이 이야기 속 당신은 전설 속 영웅이 아니라, 매일 같은 길을 걸으며 타인의 생활을 떠받치던 사람이었습니다. 훗날 삶 전체를 잇는 상징이 된 ${memoryScene.motif}도 이 거리의 냄새와 소리 속에서 처음 마음에 새겨졌습니다.`,
  `당시 당신은 ${socialClass.label}의 삶에 가까운 ${occupation.label}였습니다. ${personalityScene} 사람들은 당신을 화려한 말보다 정확한 손놀림과 오래 지키는 약속으로 기억했습니다. 아침마다 가장 먼저 도구의 상태를 살피고, 일이 끝나면 틀린 부분과 다음 날 해야 할 일을 짧게 남겼습니다. 그 습관은 눈에 띄지 않았지만 위기가 닥친 날 무엇을 먼저 지켜야 하는지 판단하게 한 기준이 되었습니다.`,
  `${episode.openingTime}, 당신은 ${episode.incidentPlace}에서 ${occupationScene}을 시작했습니다. 손에 들고 있던 것은 ${episode.object}이었습니다. 평소라면 동료와 짧은 인사를 나눈 뒤 익숙한 순서대로 일을 마쳤겠지만, 그날은 ${episode.disruption}이 벌어졌습니다. 주변 사람들은 각자의 물건을 챙기느라 목소리를 높였고, 당신은 눈앞의 손실보다 그 물건이 사라졌을 때 곤란해질 사람들의 얼굴을 먼저 떠올렸습니다.`,
  `그 순간 곁에는 ${relationship.label}이 있었습니다. ${relationshipScene} ${episode.choice}. 둘은 긴 설명을 나눌 겨를도 없이 서로가 다음에 할 일을 알아차렸습니다. 평소 쌓인 신뢰가 실제 행동으로 드러난 순간이었습니다. 하지만 선택에는 대가가 따랐습니다. ${episode.immediateCost} 당신은 옳은 일을 했다는 확신과 생활이 무너질지 모른다는 두려움을 동시에 안고 그날 밤을 보냈습니다.`,
  `공식 기록에는 ${event.label}이라는 한 줄만 남았습니다. 그러나 당신에게 그 사건은 무엇을 구했는지만큼 무엇을 포기했는지가 선명한 하루였습니다. ${episode.timeAfter}, ${episode.consequence}. 사람들은 결과만 보고 당신의 침착함을 칭찬했지만, 당신은 우연히 혼자 해낸 일이 아니라 동료의 행동과 평소 남겨 둔 작은 기록이 맞물린 결과임을 알았습니다. 이후 당신은 같은 일이 생겨도 한 사람의 희생에 기대지 않도록 도구와 기록의 보관 순서를 새로 정했습니다.`,
  `시간이 흘러 삶의 마지막 장면에 이르렀을 때 가장 먼저 돌아온 것은 ${memoryScene.motif}이었습니다. ${memoryScene.detail} 손끝에는 그날 들었던 ${episode.object}의 감촉이 되살아났습니다. ${relationship.label}과 함께 움직였던 짧은 순간, 잃었던 것, 그리고 ${episode.consequence} 당신은 미완성으로 남은 일보다 구체적으로 달라진 사람들의 생활을 떠올리며 자신의 삶을 헤아렸습니다. 아쉬움은 남았지만 자신의 선택이 누군가의 다음 날을 만들었다는 조용한 안도도 함께 있었습니다.`,
  `그 삶의 흔적은 현생의 당신에게 낯선 상황을 대하는 방식으로 이어졌을지 모릅니다. 먼저 주변의 구조와 사람의 표정을 살피고, 사소해 보이는 정보나 약속이 누구에게 영향을 주는지 오래 생각하는 성향입니다. 무언가 미완성으로 남으면 쉽게 잊지 못하는 이유도 결과보다 책임과 후속 조치를 중요하게 여겼던 이야기와 닮아 있습니다. 이 기록은 선택을 바탕으로 엮은 창작 서사이지만, 위기 속에서 무엇을 먼저 집어 들었는지 살펴보면 지금의 당신이 지키고 싶은 가치도 조금 더 구체적으로 보일 수 있습니다.`,
];
```

- [ ] **Step 3: Run the focused narrative test**

Run:

```powershell
corepack pnpm --filter @pastlife/api exec vitest run test/story-narrative.spec.ts
```

Expected: PASS with 2 tests.

- [ ] **Step 4: Run API type checking**

Run:

```powershell
corepack pnpm --filter @pastlife/api typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit the deterministic story implementation**

```powershell
git add apps/api/src/providers/story-narrative.ts apps/api/test/story-narrative.spec.ts
git commit -m "feat: tell results through concrete historical episodes"
```

### Task 3: Require the same specificity from AI-generated prose

**Files:**
- Modify: `apps/api/src/providers/ai-narrative.provider.ts`
- Modify: `apps/api/test/provider-fallback.spec.ts`

**Interfaces:**
- Consumes: the existing AI endpoint response `{ blocks: Array<{ id, body }> }`.
- Produces: an expanded request contract with `requiredSceneElements`, and rejects AI stories shorter than 1,600 characters or chapters shorter than 140 characters.

- [ ] **Step 1: Add a failing request-contract test**

In `apps/api/test/provider-fallback.spec.ts`, add this test after the short-prose fallback test:

```ts
it('asks the AI endpoint for a connected episode with observable details', async () => {
  process.env.AI_TEXT_API_URL = 'https://text.invalid/generate';
  const original = globalThis.fetch;
  let requestBody: Record<string, unknown> | undefined;
  globalThis.fetch = (async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(null, { status: 503 });
  }) as typeof fetch;

  try {
    await new AiNarrativeProvider(new TemplateNarrativeProvider()).createBasic(fixture);
    expect(requestBody).toMatchObject({
      format: {
        minTotalCharacters: 1_600,
        minChapterCharacters: 140,
      },
      requiredSceneElements: [
        'time cue',
        'specific place within the historical location',
        'physical object handled by the protagonist',
        'observable action by the scored relationship',
        'choice with an immediate cost',
        'later consequence with a count or measurable change',
      ],
    });
    expect(requestBody?.constraints).toEqual(expect.arrayContaining([
      'show one connected incident across daily, relationship, event, and last-memory chapters',
      'use concrete actions and sensory details instead of abstract personality summaries',
    ]));
  } finally {
    globalThis.fetch = original;
  }
});
```

- [ ] **Step 2: Run the provider test and verify the request assertion fails**

Run:

```powershell
corepack pnpm --filter @pastlife/api exec vitest run test/provider-fallback.spec.ts
```

Expected: FAIL because `minTotalCharacters`, `minChapterCharacters`, and `requiredSceneElements` do not yet match.

- [ ] **Step 3: Strengthen validation constants and the AI request**

In `apps/api/src/providers/ai-narrative.provider.ts`, replace the length constants with:

```ts
const MIN_TOTAL_STORY_LENGTH = 1_600;
const MIN_CHAPTER_LENGTH = 140;
const MAX_CHAPTER_LENGTH = 1_000;
```

Replace the request's `format` and `constraints` members, and add `requiredSceneElements`:

```ts
format: {
  chapterIds: basicTemplates.map(({ id }) => id),
  minTotalCharacters: MIN_TOTAL_STORY_LENGTH,
  minChapterCharacters: MIN_CHAPTER_LENGTH,
  maxChapterCharacters: MAX_CHAPTER_LENGTH,
},
requiredSceneElements: [
  'time cue',
  'specific place within the historical location',
  'physical object handled by the protagonist',
  'observable action by the scored relationship',
  'choice with an immediate cost',
  'later consequence with a count or measurable change',
],
constraints: [
  'one continuous short story',
  'second-person Korean prose',
  'show one connected incident across daily, relationship, event, and last-memory chapters',
  'use concrete actions and sensory details instead of abstract personality summaries',
  'do not invent gender or real people',
  'no explicit violence',
  'creative entertainment only',
],
```

- [ ] **Step 4: Run narrative and provider tests together**

Run:

```powershell
corepack pnpm --filter @pastlife/api exec vitest run test/story-narrative.spec.ts test/provider-fallback.spec.ts
```

Expected: PASS for all tests in both files.

- [ ] **Step 5: Commit the AI specificity contract**

```powershell
git add apps/api/src/providers/ai-narrative.provider.ts apps/api/test/provider-fallback.spec.ts
git commit -m "feat: require specific incidents from narrative AI"
```

### Task 4: Verify the full flow and development-server output

**Files:**
- No source files created or modified.

**Interfaces:**
- Consumes: the API's normal session completion flow and the mobile result screen.
- Produces: evidence that the richer blocks pass the full API suite and render without a contract or layout regression.

- [ ] **Step 1: Run the complete API test suite**

Run:

```powershell
corepack pnpm --filter @pastlife/api test
```

Expected: PASS with no provider, session, result, or repository regression.

- [ ] **Step 2: Run workspace type checking**

Run:

```powershell
corepack pnpm -r --if-present typecheck
```

Expected: all workspaces pass.

- [ ] **Step 3: Generate a new result through the running development server**

Open `http://localhost:8081`, choose “또 다른 전생 기록 찾아보기,” finish a new assessment, and open the basic result. Do not reuse an existing result ID because narrative blocks are persisted at session completion.

Expected: the seven chapters render in order, and the daily-life, relationship, event, and last-memory chapters describe one connected episode with a specific object, choice, cost, and aftermath.

- [ ] **Step 4: Check small-screen readability**

At a 390×844 viewport, confirm that the longer chapters wrap normally, no text is clipped, and the result page remains vertically scrollable.

Expected: all prose is readable without horizontal scrolling or overlapping controls.

- [ ] **Step 5: Commit any verification-only snapshot update if the repository requires one**

No commit is expected. If an existing test fixture records full narrative bodies and fails only because of the intended prose change, update that exact fixture and commit it with:

```powershell
git add <exact-failing-fixture-path>
git commit -m "test: update concrete narrative fixture"
```

Do not update unrelated snapshots or stored user results.

---

## Self-Review

- Spec coverage: the plan adds longer prose, a concrete incident, observable actions, a cost, an aftermath, deterministic variation by scored location, and equivalent AI instructions.
- Placeholder scan: all implementation and test steps contain exact code or exact commands; no deferred behavior is left unspecified.
- Type consistency: `buildStoryNarrative(core: ResultCore): NarrativeBlock[]` and the seven-block API contract remain unchanged; new `EpisodeFacts` fields are used consistently in the composition.
- Data safety: the service is pre-launch; verification uses newly generated results and may clear only confirmed development data if stale results obscure the change.
