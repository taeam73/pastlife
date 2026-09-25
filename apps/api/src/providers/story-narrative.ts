import {
  basicTemplates,
  eras,
  historicalLocations,
  lastMemories,
  lifeEvents,
  occupations,
  personalities,
  relationships,
  socialClasses,
} from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeBlock } from '../repositories/assessment.repository.js';
import type { StoryProfile } from '../story-profile.js';
import { selectLifeEnding } from './life-ending-catalog.js';
import { selectLifeBackground } from './life-background-catalog.js';
import { selectLifeIdentity } from './life-identity-catalog.js';
import { selectRelationshipEvent } from './story-event-catalog.js';
import { selectStoryArchetype } from './story-archetype-catalog.js';
import { selectScenarioVariants } from './story-scenario-catalog.js';
import { selectHistoricalEpisodes } from './historical-episode-catalog.js';
import { selectChoiceOutcome } from './choice-outcome-catalog.js';
import { describeOccupation, describeOccupationTraits } from './occupation-narrative.js';
import { selectDiverseLifeEvents } from './story-diversity-catalog.js';

const locationScenes: Record<string, string> = {
  LOC_MESOPOTAMIA: '햇빛에 마른 점토 냄새와 수로를 오가는 사람들의 목소리가 골목마다 머물렀고, 해가 기울면 낮 동안 달아오른 벽이 천천히 식어 갔습니다.',
  LOC_GANGES: '넓은 강가에는 물안개와 향신료 냄새가 함께 번졌고, 나루를 건너는 사람들의 발걸음과 수행자들의 낮은 목소리가 하루의 시간을 알려 주었습니다.',
  LOC_ABBASID: '시장에는 먼 지역에서 온 종이와 향료가 쌓였고, 등불이 켜진 뒤에도 학자와 상인들의 토론이 안뜰과 좁은 길을 오래 채웠습니다.',
  LOC_VENICE: '물길을 미끄러지는 배와 젖은 돌계단, 공방 창문에서 새어 나오는 불빛이 도시의 풍경을 이루었고, 종소리가 밀물과 썰물 사이로 번졌습니다.',
  LOC_SWASHILI: '산호석으로 지은 집 사이에 바닷바람과 향료 냄새가 스며들었고, 항구에는 계절풍을 기다리는 배와 여러 언어의 인사가 끊이지 않았습니다.',
  LOC_ANDES: '높은 고원의 차가운 공기 아래 계단식 밭과 돌길이 이어졌고, 해가 산등성이를 넘을 때마다 공동체의 불빛이 하나둘 켜졌습니다.',
  LOC_STEPPE: '끝을 가늠하기 어려운 풀밭 위로 바람의 방향이 길을 만들었고, 밤이면 말의 숨소리와 별빛이 천막 주변을 조용히 감쌌습니다.',
  LOC_POLYNESIA: '산호빛 바다와 야자수 그림자 사이에서 파도와 별의 움직임이 곧 달력이자 지도였고, 사람들은 바람의 냄새로 먼 날씨를 짐작했습니다.',
};

const occupationScenes: Record<string, string> = {
  OCC_01: '젖은 점토판을 반듯하게 고르고 갈대 끝으로 수량과 약속을 새기는 일',
  OCC_02: '배움이 필요한 이들에게 글과 오래된 이야기를 가르치고 서로 다른 기억을 한 줄의 기록으로 잇는 일',
  OCC_03: '사람들이 중요한 날을 준비하도록 의식의 순서를 살피고 공동체가 기억해야 할 이름을 빠짐없이 챙기는 일',
  OCC_04: '뱃사람이 전한 해안선과 수심을 비교해 빈 지도 위에 안전한 길을 그리는 일',
  OCC_05: '별자리와 바람, 파도의 간격을 읽어 배가 돌아올 방향과 출항할 때를 판단하는 일',
  OCC_06: '재료의 결을 손끝으로 살피며 오래 견딜 도구를 만들고 망가진 물건에 다시 쓸모를 돌려주는 일',
  OCC_07: '아픈 사람의 곁을 지키고 먹을 것과 쉴 곳을 나누며 흩어진 이웃을 다시 연결하는 일',
  OCC_08: '밤하늘과 바람의 변화를 세심하게 읽어 길을 잃은 이들에게 다음 발걸음을 알려 주는 일',
};

const personalityScenes: Record<string, string> = {
  PERSON_ANALYTIC: '쉽게 결론을 내리기보다 작은 흔적을 여러 번 확인했고, 말보다 정확한 행동으로 신뢰를 쌓았습니다. 다른 이들이 지나친 어긋남을 발견하면 조용히 바로잡되 자신의 공을 앞세우지 않았습니다.',
  PERSON_GUARDIAN: '위험을 먼저 알아차리면 자신의 몫보다 주변 사람의 안전을 살폈고, 한번 책임진 약속을 쉽게 내려놓지 않았습니다. 다정함을 큰 말로 드러내기보다 필요한 순간 곁에 남는 방식으로 표현했습니다.',
  PERSON_PIONEER: '익숙한 길이 막히면 주저앉기보다 아직 아무도 밟지 않은 방향을 살폈고, 두려움을 느끼면서도 첫걸음을 내디뎠습니다. 당신의 용기는 무모함보다 가능성을 시험해 보려는 끈기에 가까웠습니다.',
  PERSON_ARTISAN: '평범한 재료에서도 아직 드러나지 않은 모양을 보았고, 손에 익을 때까지 같은 동작을 되풀이하는 시간을 아끼지 않았습니다. 완성한 물건에는 쓰는 사람의 생활까지 생각한 세심함이 남았습니다.',
};

const relationshipScenes: Record<string, string> = {
  REL_COMPANION: '처음에는 필요한 말만 나누던 사이였지만, 여러 번 같은 어려움을 건너며 서로의 침묵까지 이해하는 오랜 동료가 되었습니다. 두 사람은 일이 끝난 늦은 시간에도 내일의 계획을 나누곤 했습니다.',
  REL_FAMILY: '가족은 당신이 지쳐 돌아온 날, 아무 설명을 요구하지 않고 따뜻한 식사와 쉴 자리를 마련해 주었습니다. 당신에게 가족은 의무만 지우는 사람들이 아니라 힘들 때 돌아가 쉴 수 있는 사람들이었습니다.',
  REL_LOST_LOVE: '다시 만나지 못한 사랑은 짧은 계절처럼 머물렀지만 이후의 모든 선택에 잔잔한 기준이 되었습니다. 함께하지 못한 시간보다 서로에게 건넸던 진심을 잊지 않으려 했습니다.',
  REL_STUDENT: '배움을 이어받은 제자는 처음에는 서툴고 질문이 많았지만 어느새 당신이 미처 보지 못한 가능성을 보여 주었습니다. 가르침은 한쪽에서 다른 쪽으로 흐르는 것이 아니라 함께 자라는 일임을 알게 했습니다.',
};

function relationshipOpening(relationshipId: string) {
  if (relationshipId === 'REL_FAMILY') return '청년 시절에도 가족은 당신의 삶에서 가장 가까운 사람들이었습니다.';
  if (relationshipId === 'REL_LOST_LOVE') return '이 시기에 마음을 나누는 한 사람을 만나 가장 가까운 사이가 되었습니다.';
  if (relationshipId === 'REL_STUDENT') return '이 시기에 처음 맡은 제자를 만나 기술과 경험을 나누기 시작했습니다.';
  return '이 시기에 함께 일하던 동료와 가까워졌습니다.';
}

function concreteRelationshipAction(relationshipId: string, value: string) {
  if (relationshipId !== 'REL_FAMILY') return value;
  return value.replace(/^한 가족은/u, '가족 한 사람은');
}

function relationshipClosing(relationshipId: string) {
  if (relationshipId === 'REL_FAMILY') return '가족과 어려움을 나눈 경험은 이후 중요한 선택을 할 때도 혼자 결정하지 않는 기준이 되었습니다.';
  if (relationshipId === 'REL_STUDENT') return '제자와 함께 배운 경험은 이후 중요한 선택을 할 때도 다음 사람의 의견을 듣는 기준이 되었습니다.';
  if (relationshipId === 'REL_LOST_LOVE') return '그 사람과 나눈 마음은 헤어진 뒤에도 중요한 선택의 기준으로 남았습니다.';
  return '동료와 쌓은 신뢰는 이후 중요한 선택을 할 때도 든든한 힘이 되었습니다.';
}

const eventScenes: Record<string, string> = {
  EVENT_01: '도시의 질서가 흔들리고 오래 지켜 온 기록이 사라질 위기',
  EVENT_02: '새로운 가르침과 오래된 관습이 충돌해 사람들의 선택이 갈리던 시기',
  EVENT_03: '먼 지역의 지식과 물자가 한꺼번에 들어오며 익숙한 기준이 빠르게 달라진 변화',
  EVENT_04: '도시의 권력과 교역의 흐름이 바뀌어 어제의 안전한 길이 더는 안전하지 않게 된 사건',
  EVENT_05: '먼 항로가 열리는 동시에 돌아오지 못한 사람들의 소식이 이어진 격변',
  EVENT_06: '새로운 기계와 생산 방식이 사람들의 일과 공동체의 속도를 바꾼 변화',
  EVENT_07: '거대한 충돌로 일상의 규칙이 무너지고 평범한 사람들의 기록이 흩어진 시기',
  EVENT_08: '빠르게 달라지는 세상 속에서 오래된 기술과 관계의 의미를 다시 묻게 된 변화',
};

const memoryScenes: Record<string, { motif: string; detail: string }> = {
  MEM_RAIN: { motif: '창밖을 두드리는 빗소리', detail: '손에는 끝내 마치지 못한 기록이 남아 있었고, 번진 글자 사이로 지키고 싶었던 이름들이 보였습니다.' },
  MEM_SEA: { motif: '해 질 무렵 붉게 물든 바다', detail: '멀리 떠난 이와 나눈 약속이 파도 소리처럼 되돌아왔고, 닿지 못한 길도 누군가에게는 방향이 되리라 생각했습니다.' },
  MEM_LIGHTS: { motif: '사람들이 하나씩 밝힌 등불', detail: '차가워진 손을 감싸 준 온기 속에서 혼자 지켜 온 시간이 결국 여러 사람의 삶으로 이어졌음을 알아차렸습니다.' },
  MEM_MOUNTAIN: { motif: '눈 덮인 산과 고요한 숨', detail: '멀고 험했던 길들이 한눈에 내려다보였고, 더 오를 곳보다 이미 지나온 발자국을 오래 바라보았습니다.' },
  MEM_TOOL: { motif: '마지막까지 놓지 못한 작업 도구', detail: '닳은 손잡이에는 수많은 날의 노력이 배어 있었고, 완성하지 못한 한 부분을 다음 사람이 이어 주기를 바랐습니다.' },
  MEM_FACE: { motif: '곁을 지켜 준 한 사람의 얼굴', detail: '말로 다 전하지 못한 고마움이 선명해졌고, 기억에서 사라지더라도 그 사람의 삶에는 따뜻한 흔적으로 남고 싶었습니다.' },
};

function requireCatalogItem<T extends { id: string }>(items: readonly T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown ${label}: ${id}`);
  return item;
}

const retiredOccupationAliases: Record<string, string> = {
  OCC_01: 'OCC_SCRIBE', OCC_02: 'OCC_TEACHER', OCC_03: 'OCC_CEREMONIAL', OCC_04: 'OCC_NAVIGATOR',
  OCC_05: 'OCC_NAVIGATOR', OCC_06: 'OCC_ARTISAN', OCC_07: 'OCC_HEALER', OCC_08: 'OCC_MESSENGER',
};

function hasFinalConsonant(value: string) {
  const last = [...value.trim()].at(-1);
  if (!last) return false;
  const code = last.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11_171 && code % 28 !== 0;
}

function withJosa(value: string, consonantForm: string, vowelForm: string) {
  return `${value}${hasFinalConsonant(value) ? consonantForm : vowelForm}`;
}

function withRoleParticle(value: string) {
  const last = [...value.trim()].at(-1);
  if (!last) return `${value}로`;
  const code = last.charCodeAt(0) - 0xac00;
  const finalConsonant = code >= 0 && code <= 11_171 ? code % 28 : 0;
  return `${value}${finalConsonant === 0 || finalConsonant === 8 ? '로' : '으로'}`;
}

function sentence(value: string) {
  const trimmed = value.trim();
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function firstSentence(value: string) {
  return value.trim().split(/(?<=[.!?…])\s+/u)[0]!.replace(/[.!?…]+$/u, '');
}

function withYouSubject(value: string) {
  const trimmed = value.trim();
  return /^(당신은|당신이|당신에게|당신의)\s/u.test(trimmed) ? trimmed : `당신은 ${trimmed}`;
}

function workRecognition(theme: string, occupationLabel: string) {
  if (['UNFAIR_PAY', 'CLIENT_PRESSURE', 'HIDDEN_DEFECT', 'STOLEN_IDEA', 'MORAL_RECORD', 'PRICE_SPIKE'].includes(theme)) {
    return `사람들은 ${withRoleParticle(occupationLabel)}서 보여 준 당신의 정직함을 믿었고, 이후 더 중요한 일을 맡겼습니다.`;
  }
  if (['QUALITY', 'DANGEROUS_ORDER', 'TOOL_FAILURE', 'NIGHT_SHIFT', 'ACCIDENT'].includes(theme)) {
    return `사람들은 결과보다 안전과 책임을 먼저 생각한 당신을 신뢰하게 되었습니다.`;
  }
  if (['APPRENTICE', 'SICK_COWORKER', 'TEACHING', 'HANDOVER', 'PUBLIC_NEED'].includes(theme)) {
    return `당신이 일을 나누고 사람을 키운 덕분에, 혼자 없어도 작업이 계속될 수 있었습니다.`;
  }
  return `사람들은 자기 이익보다 약속을 먼저 지킨 당신의 태도를 인정하고 존중했습니다.`;
}

function workSacrifice(theme: string) {
  if (theme === 'PRICE_SPIKE') return '당신은 자신의 이익을 줄이면서도 약속한 가격을 지켰습니다.';
  if (theme === 'UNFAIR_PAY') return '당신은 자기 몫만 챙기지 않고 동료들이 정당한 품삯을 받도록 도왔습니다.';
  if (theme === 'QUALITY' || theme === 'HIDDEN_DEFECT') return '시간과 재료가 더 들었지만 잘못된 결과를 그대로 넘기지 않았습니다.';
  if (theme === 'DANGEROUS_ORDER' || theme === 'ACCIDENT') return '일이 늦어지더라도 사람의 안전을 먼저 지켰습니다.';
  return '';
}

export function buildStoryProfile(core: ResultCore): StoryProfile {
  const relationship = requireCatalogItem(relationships, core.relationshipId, 'relationship');
  const event = requireCatalogItem(lifeEvents, core.eventId, 'event');
  const memory = requireCatalogItem(lastMemories, core.lastMemoryId, 'last memory');
  const relationshipEvent = selectRelationshipEvent(core);
  const storyArchetype = selectStoryArchetype(core);
  const scenarioVariants = selectScenarioVariants(core);
  const historicalEpisodes = selectHistoricalEpisodes({ ...core, occupationId: retiredOccupationAliases[core.occupationId] ?? core.occupationId });
  const lifeEnding = selectLifeEnding(core);
  const lifeBackground = selectLifeBackground(core);
  const lifeIdentity = selectLifeIdentity(core);
  const decisiveEvent = eventScenes[event.id] ?? event.label;
  const legacy = lifeEnding.reachedOldAge
    ? '여러 세대가 함께 쓰는 규칙과 기술을 남겼습니다'
    : '곁의 사람들은 당신의 선택을 기억하며 위험과 상실에 대처하는 방식을 바꾸었습니다';
  const youthAge = Math.min(18, lifeEnding.ageAtDeath - 3);
  const turningAge = Math.max(youthAge + 1, Math.min(Math.floor(lifeEnding.ageAtDeath * 0.62), lifeEnding.ageAtDeath - 2));
  const laterAge = Math.max(turningAge + 1, lifeEnding.ageAtDeath - 1);
  const characterArc = {
    outwardGoal: lifeIdentity.dailyLife.dream,
    innerNeed: lifeBackground.innerLife.secretWish,
    falseBelief: `${lifeBackground.innerLife.coreFear} 때문에 자신이 모든 책임을 먼저 져야만 관계가 유지된다고 믿었습니다`,
    centralContradiction: `${lifeIdentity.identity.temperament}이었지만 ${lifeIdentity.identity.socialMask}`,
    realization: '사람을 지키는 일은 혼자 대신 희생하는 것이 아니라 두려움과 책임을 나누는 것임을 깨달았습니다',
  };
  const relationshipNetwork: StoryProfile['relationshipNetwork'] = [
    { role: '양육자', bond: lifeBackground.background.primaryCaregiver, tension: lifeBackground.background.parentStory, change: '혈연의 호칭보다 반복해서 곁을 지키는 행동을 가족의 기준으로 삼게 했습니다' },
    { role: '형제·또래', bond: lifeBackground.background.siblingStory, tension: '한정된 관심과 기회를 나누며 경쟁과 죄책감을 함께 배웠습니다', change: '자기 몫을 주장하면서도 약한 사람의 몫을 확인하는 습관으로 남았습니다' },
    { role: '핵심 인연', bond: relationship.label, tension: relationshipEvent.setup, change: relationshipEvent.aftermath },
    { role: '스승·라이벌', bond: '기술을 가르치면서도 쉽게 인정하지 않던 연장자', tension: '인정받고 싶은 마음과 그 방식을 닮고 싶지 않은 마음이 충돌했습니다', change: '기술은 이어받되 침묵과 권위까지 물려주지는 않기로 했습니다' },
    { role: '돌봄을 받은 사람', bond: '결정적 사건에서 당신의 선택으로 다음 날을 맞은 사람들', tension: '감사와 기대가 때로는 또 다른 부담이 되었습니다', change: '은혜를 갚게 하기보다 다른 사람을 돕는 방식으로 이어 달라고 부탁했습니다' },
  ];
  const timeline: StoryProfile['timeline'] = [
    { age: 0, stage: '탄생', event: `${lifeBackground.background.familyStructure}에서 태어남`, consequence: lifeBackground.background.primaryCaregiver },
    { age: 8, stage: '유년기', event: lifeBackground.innerLife.formativeWound, consequence: lifeBackground.innerLife.copingPattern },
    { age: youthAge, stage: '청년기', event: `${lifeIdentity.dailyLife.dream}이라는 꿈과 직업의 길을 품음`, consequence: `${relationship.label}을 만나 삶의 기준이 달라짐` },
    { age: turningAge, stage: '삶의 전환기', event: decisiveEvent, consequence: lifeEnding.ending.finalChoice },
    { age: laterAge, stage: '삶의 끝자락', event: lifeIdentity.dailyLife.unrealizedDream, consequence: legacy },
    { age: lifeEnding.ageAtDeath, stage: '죽음', event: lifeEnding.ending.title, consequence: lifeEnding.ending.aftermath },
  ];
  return {
    version: 1,
    ...lifeEnding,
    ...lifeBackground,
    ...lifeIdentity,
    characterArc,
    relationshipNetwork,
    timeline,
    legacy,
    highlights: [
      { id: 'IDENTITY', title: '그때의 당신', summary: `${lifeIdentity.identity.name}이라 불린 ${lifeIdentity.identity.gender}`, detail: `${lifeIdentity.identity.appearance} ${lifeIdentity.identity.temperament}. ${lifeIdentity.identity.complex}` },
      { id: 'DREAM_AND_DAILY', title: '좋아한 일과 꿈', summary: lifeIdentity.dailyLife.hobby, detail: `가장 이루고 싶었던 꿈은 ${lifeIdentity.dailyLife.dream}이었습니다.` },
      { id: 'LIFE_FOUNDATION', title: '어떤 환경에서 자랐을까', summary: lifeBackground.background.familyStructure, detail: `${lifeBackground.background.primaryCaregiver} ${lifeBackground.background.homeAndResources}` },
      { id: 'INNER_WOUND', title: '오래 마음에 남은 상처', summary: lifeBackground.innerLife.formativeWound, detail: `${lifeBackground.innerLife.coreFear}. 그래서 ${lifeBackground.innerLife.copingPattern}` },
      { id: 'KEY_RELATIONSHIP', title: '가장 중요한 인연', summary: relationship.label, detail: `${relationshipEvent.title}. ${relationshipEvent.aftermath}` },
      { id: 'DECISIVE_EVENT', title: scenarioVariants.scenario.title, summary: scenarioVariants.event.title, detail: `${scenarioVariants.event.setup} ${scenarioVariants.event.choice} ${scenarioVariants.event.consequence}` },
      { id: 'LIFE_LEGACY', title: '당신이 남긴 것', summary: legacy, detail: lifeBackground.innerLife.secretWish },
      { id: 'PRESENT_ECHO', title: '지금의 나와 닮은 점', summary: memory.label, detail: '끝내지 못한 일을 그냥 넘기지 않고, 내 선택이 다른 사람에게 어떤 영향을 줄지 오래 생각하는 모습으로 이어졌을 수 있어요.' },
    ],
  };
}

export function buildStoryNarrative(core: ResultCore): NarrativeBlock[] {
  const era = requireCatalogItem(eras, core.eraId, 'era');
  const location = requireCatalogItem(historicalLocations, core.locationId, 'location');
  const socialClass = requireCatalogItem(socialClasses, core.classId, 'social class');
  const occupation = requireCatalogItem(occupations, retiredOccupationAliases[core.occupationId] ?? core.occupationId, 'occupation');
  const personality = requireCatalogItem(personalities, core.personalityId, 'personality');
  const relationship = requireCatalogItem(relationships, core.relationshipId, 'relationship');
  const event = requireCatalogItem(lifeEvents, core.eventId, 'event');
  const memory = requireCatalogItem(lastMemories, core.lastMemoryId, 'last memory');
  const locationScene = locationScenes[location.id] ?? '사람들의 생활과 계절의 변화가 거리의 표정을 매일 조금씩 바꾸었습니다.';
  const personalityScene = personalityScenes[personality.id] ?? `${personality.label}의 태도로 자신에게 주어진 선택을 오래 살폈습니다.`;
  const relationshipScene = relationshipScenes[relationship.id] ?? `${relationship.label}과 나눈 시간은 당신의 선택을 붙드는 중요한 이유가 되었습니다.`;
  const relationshipEvent = selectRelationshipEvent(core);
  const eventScene = eventScenes[event.id] ?? event.label;
  const memoryScene = memoryScenes[memory.id] ?? { motif: memory.label, detail: '지나온 시간과 남겨질 사람들을 천천히 떠올렸습니다.' };
  const presentDayLocation = location.presentDayContext.replace(/^오늘날\s+/u, '');
  const profile = buildStoryProfile(core);
  const occupationDescription = describeOccupation(core);
  const occupationTraits = describeOccupationTraits(core, profile.dailyLife.talent, profile.dailyLife.weakness);
  const diverseEvents = selectDiverseLifeEvents(core);
  const choiceOutcome = selectChoiceOutcome(core, {
    choice: withYouSubject(diverseEvents.turning.choice),
    cost: diverseEvents.turning.cost,
    immediateResult: diverseEvents.turning.consequence,
    laterTime: diverseEvents.turning.timeAfter,
    laterResult: diverseEvents.turning.legacy,
    relationshipAction: diverseEvents.turning.relationshipAction,
    legacy: diverseEvents.turning.legacy,
  });
  const laterYearsOpening = profile.reachedOldAge
    ? `세월이 흘러 머리카락에 희끗한 빛이 늘 무렵, 당신은 ${profile.ageAtDeath}세까지 살아온 시간을 돌아볼 수 있었습니다.`
    : `당신은 노년에 이르지 못했습니다. ${profile.ageAtDeath}세, 삶의 끝이 예상보다 일찍 다가왔지만 남겨진 시간의 무게는 결코 가볍지 않았습니다.`;

  const bodies = [
    [
      `당신의 ${core.recordNo}번째 삶입니다. 전생 이름은 ${profile.identity.name}입니다. ${era.label}의 ${location.label}에서 ${occupation.label}${hasFinalConsonant(occupation.label) ? '으로' : '로'} 살았습니다.`,
      `이곳은 지금의 ${presentDayLocation}입니다. ${locationScene}`,
      `당신은 ${profile.background.familyStructure}에서 태어났습니다. 생활은 넉넉하지 않았습니다. ${sentence(profile.background.homeAndResources)}`,
      `${sentence(profile.background.primaryCaregiver)} ${sentence(profile.background.siblingStory)}`,
    ].join('\n\n'),
    [
      `여덟 살 무렵, 당신은 ${sentence(profile.background.education)}`,
      `${sentence(diverseEvents.childhood.problem)} ${sentence(withYouSubject(diverseEvents.childhood.choice))}`,
      `${diverseEvents.childhood.timeAfter}, ${sentence(diverseEvents.childhood.consequence)} ${sentence(diverseEvents.childhood.legacy)} 이 일을 겪은 뒤, 당신은 문제가 생기면 외면하지 않고 직접 확인하는 사람이 되었습니다.`,
    ].join('\n\n'),
    [
      occupationDescription,
      `당신의 장점은 ${occupationTraits.strength}이었습니다. 다만 ${occupationTraits.weakness}도 있었습니다.`,
      `${sentence(diverseEvents.work.problem)} ${sentence(withYouSubject(diverseEvents.work.choice))} ${workSacrifice(diverseEvents.work.theme)} ${workRecognition(diverseEvents.work.theme, occupation.label)}`.replace(/\s{2,}/g, ' '),
      `${relationshipOpening(relationship.id)} ${relationshipScene}`,
      `${sentence(relationshipEvent.setup)} ${sentence(concreteRelationshipAction(relationship.id, relationshipEvent.otherAction))} ${sentence(relationshipEvent.aftermath)} ${relationshipClosing(relationship.id)}`,
    ].join('\n\n'),
    [
      `그러던 어느 날, ${sentence(diverseEvents.turning.problem)}`,
      '그 순간 당신은 누구를 먼저 지킬지 직접 결정해야 했습니다.',
      choiceOutcome.text,
      `이 사건 뒤에 남은 변화는 분명했습니다. ${sentence(profile.legacy)}`,
    ].join('\n\n'),
    [
      `${laterYearsOpening}`,
      '당신은 젊은 사람들에게 자신의 기술을 가르쳤습니다. 성공한 방법뿐 아니라 실패한 일과 그 대가도 숨기지 않았습니다.',
      `매일 ${sentence(profile.dailyLife.dailyHabit)} 삶의 기준은 ${firstSentence(profile.dailyLife.belief)}이었습니다.`,
      `마음에 가장 오래 남은 아픔은 ${firstSentence(profile.innerLife.deepestPain)}이었습니다. 쉽게 말하지 못한 바람은 ${firstSentence(profile.innerLife.secretWish)}이었습니다.`,
      `${withJosa(firstSentence(profile.dailyLife.unrealizedDream), '은', '는')} 끝내 이루지 못했습니다. 그래도 ${sentence(profile.legacy)}`,
      `${sentence(relationshipEvent.aftermath)} 당신이 가르친 방법과 지킨 약속은 주변 사람들의 생활에 남았습니다.`,
    ].join('\n\n'),
    [
      `당신은 ${profile.ageAtDeath}세에 삶을 마쳤습니다. 마지막 장소는 ${withJosa(profile.ending.setting, '이었습니다', '였습니다')}.`,
      `${sentence(profile.ending.cause)} 마지막까지 한 선택은 ${sentence(profile.ending.finalChoice)}`,
      `마지막으로 떠올린 것은 ${withJosa(memoryScene.motif, '이었습니다', '였습니다')}. ${memoryScene.detail}`,
      `${sentence(profile.ending.aftermath)}`,
      '당신이 남긴 가장 중요한 것은 죽음의 모습이 아닙니다. 어려운 순간에도 사람을 먼저 도운 선택입니다.',
      `그렇게 ${profile.identity.name}의 삶은 끝났지만, 그 사람이 남긴 선택과 약속은 주변 사람들의 생활 속에 오래 남았습니다.`,
    ].join('\n\n'),
  ];

  return basicTemplates.map((template, index) => ({
    id: template.id,
    title: template.title,
    body: bodies[index]!.length >= 140 ? bodies[index]! : `${bodies[index]!}\n\n당신의 선택과 그날의 생활은 주변 사람들의 기억에도 남았습니다.`,
  }));
}
