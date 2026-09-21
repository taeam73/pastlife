import type { ResultCore } from '@pastlife/scoring';

export type StoryScenario = {
  id: string;
  domain: string;
  title: string;
  plainDescription: string;
  compatibleEras: readonly string[];
  compatibleRegions: readonly string[];
  compatibleOccupations: readonly string[];
  conflict: string;
  keyRelationship: string;
  turningPoint: string;
  choice: string;
  cost: string;
  consequence: string;
  legacy: string;
  forbiddenCombinations: readonly string[];
};

const domains: readonly [string, string, string, string, string][] = [
  ['SURVIVAL', '생존과 재난', '굶주림', '식량이 부족한 마을에서 사람들과 음식을 나눌 방법을 찾았습니다.', '가족을 먼저 먹일지 모두에게 나눌지 결정해야 했습니다.'],
  ['TRAVEL', '이동과 이주', '새로운 길', '익숙한 곳을 떠나 낯선 길을 따라 새로운 생활을 시작했습니다.', '돌아갈 수 있는 길과 앞으로 갈 길 중 하나를 골라야 했습니다.'],
  ['FAMILY', '가족', '가족의 책임', '집안의 중요한 일을 맡아 가족의 하루를 지켰습니다.', '자신의 꿈과 가족의 필요가 서로 부딪혔습니다.'],
  ['LOVE', '사랑과 이별', '보내지 못한 편지', '소중한 사람에게 꼭 전하고 싶은 말을 오래 품었습니다.', '붙잡을지 보내 줄지 선택해야 했습니다.'],
  ['FRIENDSHIP', '우정과 동료', '함께 버틴 동료', '힘든 일을 함께 겪은 사람이 가장 가까운 친구가 되었습니다.', '친구의 잘못을 감쌀지 사실을 말할지 고민했습니다.'],
  ['MENTORSHIP', '스승과 배움', '제자에게 건넨 기술', '배운 기술을 다음 사람에게 가르치며 자신의 삶을 돌아보았습니다.', '혼자 잘할지 함께 잘할지 결정해야 했습니다.'],
  ['RIVALRY', '경쟁', '서로 다른 두 방법', '경쟁자와 같은 목표를 두고 다른 방법을 시험했습니다.', '이기는 것과 더 나은 방법을 찾는 것 중 하나를 골랐습니다.'],
  ['RULES', '규칙과 저항', '오래된 규칙에 질문하기', '사람을 힘들게 하는 규칙이 왜 필요한지 묻기 시작했습니다.', '벌을 피할지 부당한 일을 말할지 선택했습니다.'],
  ['POWER', '권력과 정치', '바뀐 통치자', '새로운 권력자가 오며 마을의 약속과 생활이 바뀌었습니다.', '명령을 따를지 사람들의 편에 설지 결정해야 했습니다.'],
  ['COMMUNITY', '공동체', '다시 모인 광장', '서로 멀어진 사람들이 한 장소에 모여 문제를 풀었습니다.', '한 사람의 빠른 결정과 모두의 느린 합의 중 하나를 골랐습니다.'],
  ['LAW', '법과 정의', '억울한 판결', '힘이 약한 사람의 이야기가 제대로 들리지 않는 일을 보았습니다.', '안전하게 침묵할지 사실을 증언할지 선택했습니다.'],
  ['TECHNOLOGY', '기술과 발명', '새로 만든 도구', '생활을 바꿀 도구를 만들었지만 모두가 좋아하지는 않았습니다.', '발명을 숨길지 필요한 사람에게 공개할지 결정했습니다.'],
  ['DISCOVERY', '발견과 탐험', '지도에 없는 장소', '아무도 자세히 기록하지 않은 장소와 사람을 만났습니다.', '모험을 계속할지 안전한 길로 돌아갈지 골랐습니다.'],
  ['LABOR', '직업과 노동', '직업을 바꾼 날', '오래 하던 일을 그만두고 새로운 일을 배워야 했습니다.', '익숙한 안정과 새로운 기회 중 하나를 택했습니다.'],
  ['POVERTY', '가난과 신분', '거리에서 시작한 삶', '가진 것이 거의 없는 상태에서 하루하루를 이어 갔습니다.', '도움을 받을지 혼자 버틸지 선택해야 했습니다.'],
  ['ART', '예술과 표현', '무대에 선 사람', '노래와 연기로 사람들의 마음을 움직였습니다.', '사람들이 원하는 말을 할지 자신의 생각을 표현할지 결정했습니다.'],
  ['RECORD', '기록과 언어', '사라진 이름을 적다', '사람들의 이름과 이야기가 잊히지 않도록 기록했습니다.', '기록을 공개할지 위험을 줄이기 위해 숨길지 골랐습니다.'],
  ['WITNESS', '진실과 증언', '말해야 하는 날', '큰 사건을 직접 본 뒤 누구에게 사실을 말할지 고민했습니다.', '자신의 안전과 다른 사람의 진실 사이에서 선택했습니다.'],
  ['NATURE', '자연과 환경', '강과 숲을 지키다', '사람들의 생활과 자연을 함께 지킬 방법을 찾았습니다.', '당장 필요한 이익과 오래 지킬 환경 중 하나를 골랐습니다.'],
  ['WAR', '전쟁과 귀환', '전쟁에 참가한 군인', '전쟁터에서 명령과 사람의 안전 사이에서 매일 판단해야 했습니다.', '전투를 계속할지 부상자와 민간인을 먼저 구할지 결정했습니다.'],
];

const baseVariantSeeds = [
  ['START', '처음부터 다시 시작한 사람'], ['CARE', '누군가를 먼저 살린 사람'], ['TRUTH', '숨은 사실을 밝힌 사람'], ['RETURN', '떠났다가 돌아온 사람'], ['SHARE', '배운 것을 나눈 사람'],
  ['PROMISE', '약속을 끝까지 지킨 사람'], ['SEARCH', '잃어버린 사람을 찾은 사람'], ['REPAIR', '망가진 것을 고친 사람'], ['REFUSE', '부당한 명령을 거부한 사람'], ['WELCOME', '낯선 사람을 받아들인 사람'],
  ['PROTECT', '약한 사람을 보호한 사람'], ['TEACH', '다음 사람을 가르친 사람'], ['ESCAPE', '위험한 곳에서 빠져나온 사람'], ['DISCLOSE', '감춰진 일을 공개한 사람'], ['NEGOTIATE', '서로 다른 편을 이어 준 사람'],
  ['CREATE', '새로운 것을 만든 사람'], ['SACRIFICE', '자신의 몫을 양보한 사람'], ['FORGIVE', '미워하던 사람을 용서한 사람'], ['REMEMBER', '잊힌 이름을 기억한 사람'], ['REBUILD', '모두와 다시 세운 사람'],
] as const;

const extraVariantTitles = [
  '길을 잃었지만 다시 방향을 찾은 사람', '두 집 사이에서 살아간 사람', '가족의 이름을 지킨 사람', '낯선 언어를 배운 사람', '작은 가게를 연 사람',
  '사라진 물건을 되찾은 사람', '혼자였지만 도움을 청한 사람', '마을의 약속을 만든 사람', '오래된 물건을 복원한 사람', '위험한 소식을 옮긴 사람',
  '잘못된 소문을 바로잡은 사람', '다른 세대의 친구가 된 사람', '떠난 사람의 일을 이어받은 사람', '실패한 계획을 다시 세운 사람', '나눌 몫을 정한 사람',
  '두려움을 말로 꺼낸 사람', '자신의 이름을 되찾은 사람', '잊힌 길을 다시 연 사람', '남의 기술을 안전하게 지킨 사람', '공동 작업을 시작한 사람',
  '마지막까지 문을 열어 둔 사람', '약속을 기록으로 남긴 사람', '낡은 노래를 되살린 사람', '다친 사람을 집으로 데려온 사람', '다음 계절을 준비한 사람',
] as const;
const extraVariantSeeds = extraVariantTitles.map((title, index) => [`EXTRA_${String(index + 1).padStart(2, '0')}`, title] as const);
const variantSeeds: readonly (readonly [string, string])[] = [...baseVariantSeeds, ...extraVariantSeeds];

export const storyScenarios: readonly StoryScenario[] = domains.flatMap(([domain, domainLabel, conflictSeed, conflict, choice]) => variantSeeds.map(([variant, titleSeed], index) => ({
  id: `${domain}_${variant}`,
  domain: domainLabel,
  title: `${titleSeed} - ${domainLabel}`,
  plainDescription: `${conflictSeed} ${titleSeed}가 되어 ${['작은 일부터 시작했습니다.', '필요한 사람을 먼저 살폈습니다.', '사실을 차분히 확인했습니다.', '돌아갈 곳을 다시 생각했습니다.', '배운 것을 나누었습니다.'][index % 5]}`,
  compatibleEras: ['ERA_ANCIENT_CIV', 'ERA_MEDIEVAL', 'ERA_INDUSTRIAL', 'ERA_20C_EARLY', 'ERA_20C_LATE'],
  compatibleRegions: ['REG_EAST_ASIA', 'REG_EUROPE', 'REG_MENA', 'REG_AMERICAS', 'REG_SUBSAHARAN_AFRICA'],
  compatibleOccupations: domain === 'POWER' || domain === 'RULES' || domain === 'WAR' ? ['OCC_SOLDIER', 'OCC_INDEPENDENCE_FIGHTER', 'OCC_CIVIL_SERVANT', 'OCC_JOURNALIST'] : ['OCC_FARMER', 'OCC_MERCHANT', 'OCC_ARTISAN', 'OCC_COMMUNITY_ORGANIZER'],
  conflict,
  keyRelationship: ['가족', '동료', '스승', '이웃', '떠난 사람'][index]!,
  turningPoint: `${titleSeed}가 되어 ${['작은 일부터 시작했습니다.', '필요한 사람을 먼저 살폈습니다.', '사실을 차분히 확인했습니다.', '돌아갈 곳을 다시 생각했습니다.', '배운 것을 나누었습니다.'][index % 5]}`,
  choice,
  cost: ['시간을 잃었습니다.', '자신의 물건을 포기했습니다.', '안전한 자리를 떠났습니다.', '오해를 감당해야 했습니다.', '혼자 결정하지 않기로 했습니다.'][index]!,
  consequence: `그 선택 뒤 ${['가족과 이웃의 다음 날이 바뀌었습니다.', '당신의 행동이 다른 사람의 기억에 남았습니다.', '늦게 밝혀진 사실이 새 약속을 만들었습니다.', '당신은 돌아온 뒤 다른 방식으로 살았습니다.', '남긴 방법이 다음 세대의 생활이 되었습니다.'][index % 5]}`,
  legacy: `${titleSeed}의 이야기는 다음 사람에게 작은 용기를 남겼습니다.`,
  forbiddenCombinations: [],
})));

export function selectStoryScenario(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'eventId' | 'occupationId'>) {
  let hash = 2_166_136_261;
  for (const character of `${core.answerHash}:${core.recordNo}:${core.eventId}:${core.occupationId}:scenario`) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16_777_619); }
  const preferred = storyScenarios.filter((scenario) => scenario.compatibleOccupations.includes(core.occupationId));
  const candidates = preferred.length > 0 ? preferred : storyScenarios;
  return candidates[(hash >>> 0) % candidates.length]!;
}

export type ScenarioVariant = { id: string; scenarioId: string; title: string; setup: string; choice: string; consequence: string };

const variantActions: readonly [string, string, string][] = [
  ['새벽에 먼저 움직인 날', '당신은 다른 사람이 오기 전 필요한 일을 시작했습니다.', '작은 준비가 여러 사람의 하루를 바꾸었습니다.'],
  ['도움을 청한 날', '당신은 혼자 해결하려 하지 않고 믿을 만한 사람에게 상황을 설명했습니다.', '함께 나눈 책임 덕분에 문제를 오래 버틸 수 있었습니다.'],
  ['규칙을 바꾼 날', '당신은 모두에게 똑같은 방법이 정말 공평한지 물었습니다.', '사람들은 더 안전하고 공평한 방법을 다시 정했습니다.'],
  ['떠날지 남을지 정한 날', '당신은 두 길의 좋은 점과 잃게 될 것을 천천히 비교했습니다.', '선택의 대가는 컸지만 다음 삶의 방향은 분명해졌습니다.'],
  ['기록을 남긴 날', '당신은 이름과 날짜를 적어 다음 사람이 사실을 알 수 있게 했습니다.', '그 기록은 시간이 지나도 사람들의 선택을 도왔습니다.'],
];

export const scenarioEventVariants: readonly ScenarioVariant[] = storyScenarios.flatMap((scenario) => variantActions.map(([title, setup, consequence], index) => ({
  id: `${scenario.id}_EVENT_${index + 1}`,
  scenarioId: scenario.id,
  title: `${scenario.title} - ${title}`,
  setup: `${scenario.plainDescription} ${setup}`,
  choice: scenario.choice,
  consequence: `${consequence} ${scenario.legacy}`,
})));

export const scenarioRelationshipVariants: readonly ScenarioVariant[] = storyScenarios.flatMap((scenario) => variantActions.slice(0, 4).map(([title, setup, consequence], index) => ({
  id: `${scenario.id}_REL_${index + 1}`,
  scenarioId: scenario.id,
  title: `${scenario.keyRelationship}와의 ${title}`,
  setup: `${scenario.keyRelationship}은 ${setup.toLowerCase()}`,
  choice: scenario.choice,
  consequence,
})));

export const scenarioEndingVariants: readonly ScenarioVariant[] = storyScenarios.flatMap((scenario) => variantActions.slice(0, 4).map(([title, , consequence], index) => ({
  id: `${scenario.id}_END_${index + 1}`,
  scenarioId: scenario.id,
  title: `${scenario.title}의 마지막 ${index + 1}`,
  setup: title,
  choice: scenario.choice,
  consequence: `${consequence} ${scenario.legacy}`,
})));

function variantIndex(seed: string, length: number) {
  let hash = 2_166_136_261;
  for (const character of seed) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16_777_619); }
  return (hash >>> 0) % length;
}

export function selectScenarioVariants(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'eventId' | 'occupationId'>) {
  const scenario = selectStoryScenario(core);
  const events = scenarioEventVariants.filter((item) => item.scenarioId === scenario.id);
  const relationships = scenarioRelationshipVariants.filter((item) => item.scenarioId === scenario.id);
  const endings = scenarioEndingVariants.filter((item) => item.scenarioId === scenario.id);
  const seed = `${core.answerHash}:${core.recordNo}:${core.eventId}:${core.occupationId}:${scenario.id}`;
  return {
    scenario,
    event: events[variantIndex(`${seed}:event`, events.length)]!,
    relationship: relationships[variantIndex(`${seed}:relationship`, relationships.length)]!,
    ending: endings[variantIndex(`${seed}:ending`, endings.length)]!,
  };
}

export function storyScenarioCounts() {
  return Object.fromEntries(domains.map(([, domain]) => [domain, storyScenarios.filter((scenario) => scenario.domain === domain).length]));
}
