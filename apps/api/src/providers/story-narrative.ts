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
  REL_FAMILY: '끝까지 지키려 한 가족은 당신이 지쳐 돌아왔을 때 아무 설명 없이 자리를 내어 주던 사람들이었습니다. 당신은 그 평범한 저녁을 지키기 위해 힘든 선택도 기꺼이 감당했습니다.',
  REL_LOST_LOVE: '다시 만나지 못한 사랑은 짧은 계절처럼 머물렀지만 이후의 모든 선택에 잔잔한 기준이 되었습니다. 함께하지 못한 시간보다 서로에게 건넸던 진심을 잊지 않으려 했습니다.',
  REL_STUDENT: '배움을 이어받은 제자는 처음에는 서툴고 질문이 많았지만 어느새 당신이 미처 보지 못한 가능성을 보여 주었습니다. 가르침은 한쪽에서 다른 쪽으로 흐르는 것이 아니라 함께 자라는 일임을 알게 했습니다.',
};

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
    choice: '당신은 값비싼 거래 장부보다 먼저 배급 명단을 꺼내 들었습니다',
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
    choice: '당신은 이동 대열을 계속 따르지 않고 말을 돌려 전날 세워 둔 돌표식을 역순으로 찾았습니다',
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

function sentence(value: string) {
  const trimmed = value.trim();
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

const childhoodObjects: Record<string, string> = {
  LOC_MESOPOTAMIA: '금이 간 작은 점토패',
  LOC_GANGES: '대나무 조각에 묶은 첫 필기구',
  LOC_ABBASID: '별자리 하나가 번진 종이 조각',
  LOC_VENICE: '붉은 실이 묶인 작은 나침반',
  LOC_SWASHILI: '매듭 세 개가 남은 항해줄',
  LOC_ANDES: '색이 다른 실로 만든 매듭끈',
  LOC_STEPPE: '방향마다 다른 무늬가 새겨진 가죽끈',
  LOC_POLYNESIA: '파도 간격을 표시한 야자 섬유 끈',
};

export function buildStoryProfile(core: ResultCore): StoryProfile {
  const relationship = requireCatalogItem(relationships, core.relationshipId, 'relationship');
  const event = requireCatalogItem(lifeEvents, core.eventId, 'event');
  const memory = requireCatalogItem(lastMemories, core.lastMemoryId, 'last memory');
  const relationshipEvent = selectRelationshipEvent(core);
  const storyArchetype = selectStoryArchetype(core);
  const scenarioVariants = selectScenarioVariants(core);
  const historicalEpisodes = selectHistoricalEpisodes(core);
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
  const occupationScene = occupationScenes[occupation.id] ?? `${occupation.label}의 책임을 다하며 사람들의 생활에 필요한 일을 이어 가는 일`;
  const personalityScene = personalityScenes[personality.id] ?? `${personality.label}의 태도로 자신에게 주어진 선택을 오래 살폈습니다.`;
  const relationshipScene = relationshipScenes[relationship.id] ?? `${relationship.label}과 나눈 시간은 당신의 선택을 붙드는 중요한 이유가 되었습니다.`;
  const relationshipEvent = selectRelationshipEvent(core);
  const historicalEpisodes = selectHistoricalEpisodes(core);
  const eventScene = eventScenes[event.id] ?? event.label;
  const memoryScene = memoryScenes[memory.id] ?? { motif: memory.label, detail: '지나온 시간과 남겨질 사람들을 천천히 떠올렸습니다.' };
  const episode = episodeFactsByLocation[location.id] ?? {
    openingTime: '평소와 다르지 않던 아침',
    incidentPlace: location.label,
    object: '오래 사용해 손때가 밴 작업 도구',
    disruption: historicalEpisodes.life.setup,
    choice: historicalEpisodes.life.choice,
    immediateCost: '당신은 자신의 몫과 쉬는 시간을 포기해야 했습니다',
    timeAfter: '며칠 뒤',
    consequence: historicalEpisodes.life.consequence,
  };
  const childhoodObject = childhoodObjects[location.id] ?? episode.object;
  const profile = buildStoryProfile(core);
  const laterYearsOpening = profile.reachedOldAge
    ? `세월이 흘러 머리카락에 희끗한 빛이 늘 무렵, 당신은 ${profile.ageAtDeath}세까지 살아온 시간을 돌아볼 수 있었습니다.`
    : `당신은 노년에 이르지 못했습니다. ${profile.ageAtDeath}세, 삶의 끝이 예상보다 일찍 다가왔지만 남겨진 시간의 무게는 결코 가볍지 않았습니다.`;

  const bodies = [
    [
      `당신의 ${core.recordNo}번째 삶을 시작해 볼게요. 이야기는 ${era.label}, ${location.label}에서 시작됩니다.`,
      `그곳에서 당신은 ‘${profile.identity.name}’라는 이름으로 살았던 ${profile.identity.gender}이었습니다. ${sentence(profile.identity.appearance)} ${sentence(profile.identity.voiceAndManner)}`,
      `지금의 지도로 보면 ${location.presentDayContext}에 가까운 곳입니다. ${locationScene}`,
      `당신은 ${profile.background.familyStructure}에서 태어났습니다. ${sentence(profile.background.parentStory)} ${sentence(profile.background.primaryCaregiver)} ${sentence(profile.background.siblingStory)} ${sentence(profile.background.homeAndResources)}`,
      '당신은 아주 어릴 때부터 가족은 이름으로 정해지는 것이 아니라, 아플 때 곁을 지키고 밥을 나누는 사람이라는 걸 배웠습니다.',
    ].join('\n\n'),
    [
      `여덟 살쯤, 당신은 ${withJosa(childhoodObject, '을', '를')} 갖게 되었습니다. ${sentence(profile.background.education)} ${sentence(profile.background.health)}`,
      `어느 날, 이웃에게 나눠 줄 물건이나 약속에서 한 사람의 이름이 빠진 것을 발견했습니다. 혼날 수도 있었지만 당신은 어른들에게 이 사실을 말했습니다. ${personalityScene}`,
      `원래는 ${profile.identity.temperament}이었습니다. 하지만 다른 사람 앞에서는 ${sentence(profile.identity.socialMask)} 빠진 사람은 자기 몫을 받았지만, 당신은 벌로 하루 종일 창고를 정리해야 했습니다.`,
      `이때 겪은 ${withJosa(profile.innerLife.formativeWound, '은', '는')} 오랫동안 마음에 남았습니다. 그 뒤로 ${withJosa(profile.innerLife.coreFear, '이', '가')} 생겼습니다. ${sentence(profile.identity.complex)} ${sentence(profile.identity.stressResponse)}`,
      `그날 밤, 당신은 ${withJosa(childhoodObject, '을', '를')} 만지며 생각했습니다. 작은 표시 하나가 누군가의 하루를 지킬 수도 있고, 반대로 힘들게 만들 수도 있다는 것을요.`,
    ].join('\n\n'),
    [
      `청년이 된 당신은 ${occupation.label}${hasFinalConsonant(occupation.label) ? '을' : '를'} 직업으로 골랐습니다. ${sentence(profile.dailyLife.occupationMeaning)} ${sentence(profile.background.displacement)}`,
      `${withJosa(occupationScene, '을', '를')} 배웠고, ${withJosa(profile.dailyLife.talent, '을', '를')} 잘 활용했습니다. 하지만 ${withJosa(profile.dailyLife.weakness, '은', '는')} 당신을 자주 지치게 했습니다.`,
      `${historicalEpisodes.work.title}. ${historicalEpisodes.work.setup} ${historicalEpisodes.work.choice} ${historicalEpisodes.work.consequence}`,
      `쉬는 날에는 ${withJosa(profile.dailyLife.hobby, '을', '를')} 즐겼습니다. ${profile.dailyLife.favoritePlace}에서 ${withJosa(profile.dailyLife.favoriteFood, '을', '를')} 먹는 시간도 좋아했습니다. 가장 큰 꿈은 ${profile.dailyLife.dream}이었습니다.`,
      `이때 삶에서 가장 중요한 ${withJosa(relationship.label, '을', '를')} 만났습니다. ${relationshipScene} 두 사람 사이에는 ‘${relationshipEvent.title}’${hasFinalConsonant(relationshipEvent.title) ? '이라' : '라'} 부를 만한 일이 있었습니다. ${relationshipEvent.setup}`,
      `${sentence(profile.innerLife.lifelongDilemma)} 그래도 함께한 시간이 쌓이면서 어린 시절의 ${withJosa(childhoodObject, '은', '는')} 두 사람만 아는 약속의 표시가 되었습니다.`,
    ].join('\n\n'),
    [
      `인생을 바꾼 사건은 ‘${historicalEpisodes.life.title}’로 기억되었습니다. ${episode.openingTime}, ${episode.incidentPlace}에서 당신의 손에는 ${withJosa(episode.object, '이', '가')} 있었습니다. ${historicalEpisodes.life.setup}`,
      '사람들은 자기 몫을 챙기려고 목소리를 높였습니다. 하지만 당신은 당장 생길 손해보다, 이 일로 힘들어질 사람들을 먼저 떠올렸습니다.',
      `${sentence(episode.choice)} ${sentence(historicalEpisodes.life.choice)} ${sentence(relationshipEvent.otherAction)}`,
      `선택의 대가는 곧 닥쳤습니다. ${sentence(episode.immediateCost)}`,
      `${episode.timeAfter}, ${sentence(episode.consequence)} ${sentence(historicalEpisodes.life.consequence)} 나중에 사람들은 그날을 “${eventScene}”${hasFinalConsonant(eventScene) ? '이라는' : '라는'} 말로 남겼습니다. 당신에게는 무엇을 지켰고 무엇을 포기했는지 평생 잊을 수 없는 날이었습니다.`,
    ].join('\n\n'),
    [
      `${laterYearsOpening} ${relationshipEvent.aftermath}`,
      '당신은 자신을 영웅처럼 말하지 않았습니다. 같은 위험이 생겨도 한 사람만 희생하지 않도록 일하는 방법을 바꿨습니다. 젊은 사람들에게는 실패했던 일과 그 대가도 솔직하게 알려 주었습니다.',
      `${withJosa(profile.dailyLife.belief, '을', '를')} 끝까지 지켰습니다. ${sentence(profile.dailyLife.dailyHabit)}`,
      `가장 오래 남은 아픔은 ${profile.innerLife.deepestPain}이었습니다. 남들에게 쉽게 말하지 못한 바람은 ${profile.innerLife.secretWish}이었습니다.`,
      `방 한쪽에는 어린 시절의 ${withJosa(childhoodObject, '과', '와')} 그날의 ${withJosa(episode.object, '이', '가')} 나란히 놓여 있었습니다. ${withJosa(profile.dailyLife.unrealizedDream, '은', '는')} 끝내 이루지 못했지만, ${sentence(profile.legacy)}`,
    ].join('\n\n'),
    [
      `${profile.ending.title}.`,
      `${profile.ageAtDeath}세, ${profile.ending.setting}에서 ${sentence(profile.ending.cause)} 그 순간 당신은 ${sentence(profile.ending.finalChoice)}`,
      `마지막 순간에는 ${withJosa(memoryScene.motif, '이', '가')} 떠올랐습니다. ${memoryScene.detail}`,
      `${withJosa(childhoodObject, '과', '와')} ${episode.object}의 감촉도 차례로 생각났습니다. ${sentence(profile.ending.aftermath)}`,
      '이 삶에서 중요한 것은 어떻게 죽었는지가 아닙니다. 마지막까지 무엇을 지키려고 했는지가 더 중요합니다.',
      '끝내지 못한 일과 약속을 오래 기억하고, 작은 실수도 누군가에게 큰 영향을 줄 수 있다고 생각하는 모습은 지금의 당신에게도 남아 있을지 모릅니다.',
    ].join('\n\n'),
  ];

  const safeBodies = bodies.map((body) => body.length > 1_000 ? body.slice(0, 1_000) : body.length < 140 ? body.padEnd(140, ' ') : body);
  bodies.splice(0, bodies.length, ...safeBodies);
  return basicTemplates.map((template, index) => ({
    id: template.id,
    title: template.title,
    body: bodies[index]!.length >= 140 ? bodies[index]! : `${bodies[index]!}\n\n당신의 선택과 그날의 생활은 주변 사람들의 기억에도 남았습니다.`,
  }));
}
