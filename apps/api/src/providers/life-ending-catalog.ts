import type { ResultCore } from '@pastlife/scoring';
import type { LifeEndingCategory, StoryProfile } from '../story-profile.js';

type EndingVariant = StoryProfile['ending'] & {
  minAge: number;
  maxAge: number;
};

export const LIFE_ENDING_TAXONOMY: Record<LifeEndingCategory, readonly string[]> = {
  NATURAL: ['노쇠', '잠든 사이 맞은 평온한 끝'],
  ILLNESS: ['오랜 병', '돌봄 중 얻은 병', '유행병'],
  ACCIDENT: ['항해 사고', '작업장 사고', '여정 중 사고'],
  DISASTER: ['홍수', '화재', '폭풍', '산사태'],
  CONFLICT: ['공동체 충돌', '피란 중 부상', '도시를 지키던 중 입은 상처'],
  SACRIFICE: ['다른 이를 구한 희생', '기록과 식량을 지킨 희생', '위험을 대신 짊어진 선택'],
  PERSECUTION: ['신념 때문에 받은 형벌', '권력에 맞선 기록으로 인한 죽음'],
  SELF_CHOSEN: ['감당하기 어려운 고통 속에서 스스로 맞은 끝'],
  UNKNOWN: ['실종', '기록이 끊긴 마지막 여정'],
};

const variants: readonly EndingVariant[] = [
  { category: 'NATURAL', title: '긴 삶 끝의 고요한 밤', cause: '노쇠로 기력이 다한 뒤 잠든 사이 숨이 잦아들었습니다', setting: '가족과 제자들이 불을 낮춘 집 안', finalChoice: '남은 기록과 도구의 주인을 한 사람씩 정해 두었습니다', aftermath: '당신의 방식은 다음 세대의 일상 속 규칙으로 이어졌습니다', minAge: 72, maxAge: 91 },
  { category: 'ILLNESS', title: '긴 돌봄 뒤 찾아온 마지막 계절', cause: '오랫동안 다른 이를 돌보다 얻은 병이 깊어졌습니다', setting: '약초 향과 빗소리가 번지는 작은 방', finalChoice: '마지막 힘으로 곁의 사람에게 쉬는 법부터 가르쳤습니다', aftermath: '사람들은 당신의 이름보다 서로를 돌보는 순서를 오래 기억했습니다', minAge: 46, maxAge: 68 },
  { category: 'ILLNESS', title: '유행병이 지나간 뒤', cause: '마을을 덮친 유행병에서 끝내 회복하지 못했습니다', setting: '등불을 멀리 띄워 놓은 공동 돌봄소', finalChoice: '자신의 물과 자리를 더 어린 환자에게 내주었습니다', aftermath: '살아남은 이들은 공동 우물 곁에 돌봄 명단을 남겼습니다', minAge: 29, maxAge: 54 },
  { category: 'ACCIDENT', title: '돌아오지 못한 항해', cause: '갑작스러운 폭풍 속에서 배가 항로를 잃었습니다', setting: '별빛이 사라지고 파도 소리만 커진 밤바다', finalChoice: '마지막까지 다른 배가 피할 방향을 불빛으로 알렸습니다', aftermath: '당신이 남긴 항로 표식은 이후 여러 배의 귀환을 도왔습니다', minAge: 24, maxAge: 43 },
  { category: 'ACCIDENT', title: '익숙한 일터에서 벌어진 사고', cause: '무너진 구조물 아래에서 입은 상처로 생을 마쳤습니다', setting: '먼지가 가라앉지 않은 작업장 입구', finalChoice: '밖으로 나온 뒤에도 안에 남은 사람과 출구의 위치를 먼저 알렸습니다', aftermath: '사고 뒤 작업 순서와 안전 표식이 전면적으로 바뀌었습니다', minAge: 31, maxAge: 57 },
  { category: 'DISASTER', title: '큰물이 덮친 새벽', cause: '갑작스러운 홍수가 거처와 길을 삼켰습니다', setting: '수로의 경고 종이 울리던 새벽 골목', finalChoice: '높은 곳으로 오를 기회를 양보하고 아이와 노인을 먼저 올려보냈습니다', aftermath: '구조된 이들이 다음 정착지에 당신의 경고 방식을 전했습니다', minAge: 20, maxAge: 49 },
  { category: 'DISASTER', title: '불길 속에 남겨 둔 길', cause: '시장과 창고를 번진 큰불 속에서 연기를 너무 오래 마셨습니다', setting: '젖은 천과 깨진 등잔이 흩어진 골목', finalChoice: '물건 대신 사람들이 빠져나갈 문을 끝까지 열어 두었습니다', aftermath: '사람들은 재건한 골목마다 두 개의 출구를 만들었습니다', minAge: 27, maxAge: 55 },
  { category: 'CONFLICT', title: '피란길의 마지막 고개', cause: '공동체의 충돌을 피해 사람들을 이끌던 중 입은 상처가 깊어졌습니다', setting: '짐수레가 길게 늘어선 산길의 마지막 고개', finalChoice: '자신은 뒤에 남아 추격을 늦추고 길 표식을 지켰습니다', aftermath: '무사히 도착한 이들은 흩어진 가족의 이름을 다시 모았습니다', minAge: 25, maxAge: 52 },
  { category: 'SACRIFICE', title: '다른 이의 내일과 바꾼 하루', cause: '위험에 갇힌 사람들을 구한 뒤 얻은 상처로 생을 마쳤습니다', setting: '무너지는 창고와 열린 광장 사이', finalChoice: '가장 가까운 탈출구를 자신이 쓰지 않고 뒤따르던 이에게 내주었습니다', aftermath: '살아남은 이들은 희생을 영웅담으로만 남기지 않고 같은 사고를 막는 규칙을 세웠습니다', minAge: 19, maxAge: 61 },
  { category: 'SACRIFICE', title: '기록을 지켜 낸 마지막 선택', cause: '권력이 숨기려 한 명단을 밖으로 옮기는 과정에서 붙잡혔습니다', setting: '새벽 종이 울리기 전 성문 가까운 기록소', finalChoice: '자신의 이름을 지우는 대신 억울하게 사라진 이들의 이름을 남겼습니다', aftermath: '그 명단은 훗날 여러 가족이 서로를 찾는 단서가 되었습니다', minAge: 33, maxAge: 64 },
  { category: 'PERSECUTION', title: '침묵을 거부한 대가', cause: '부당한 명령을 기록하고 증언한 일로 형벌을 받았습니다', setting: '사람들이 숨죽여 지켜보던 도시의 바깥뜰', finalChoice: '마지막 진술에서 동료의 이름을 감추고 자신의 선택만 밝혔습니다', aftermath: '남겨진 기록은 시간이 흐른 뒤 그 시대를 바로잡는 증언이 되었습니다', minAge: 28, maxAge: 58 },
  { category: 'SELF_CHOSEN', title: '아무에게도 다 말하지 못한 마지막 밤', cause: '오래 쌓인 고통 속에서 스스로 삶을 마감했습니다', setting: '미완성 편지와 꺼져 가는 등불이 놓인 조용한 방', finalChoice: '구체적인 방법 대신, 끝내 전하지 못한 미안함과 사랑을 짧은 글로 남겼습니다', aftermath: '남겨진 이들은 그 선택을 미화하지 않았고 서로의 고통을 더 일찍 묻는 약속을 만들었습니다', minAge: 22, maxAge: 49 },
  { category: 'UNKNOWN', title: '기록이 멈춘 먼 여정', cause: '먼 길을 떠난 뒤 돌아오지 않아 마지막 순간은 기록되지 않았습니다', setting: '마지막으로 목격된 강 건너 나루', finalChoice: '동행자에게 지도와 식량을 건네고 혼자 뒤를 확인하러 갔습니다', aftermath: '사람들은 죽음을 단정하지 않은 채 해마다 같은 날 길목에 등불을 놓았습니다', minAge: 21, maxAge: 63 },
];

const endingAdds = ['남은 사람들은 그 선택을 오래 기억했습니다.', '마지막까지 주변 사람의 안전을 먼저 생각했습니다.', '작은 물건 하나가 그날의 기억으로 남았습니다.', '그 이야기는 가까운 사람에게 조용히 전해졌습니다.', '다음 사람은 그 삶에서 한 가지 방법을 배웠습니다.'];
const expandedVariants: readonly EndingVariant[] = variants.flatMap((variant) => endingAdds.map((add, index) => ({ ...variant, title: `${variant.title} ${index + 1}`, aftermath: `${variant.aftermath} ${add}` })));

function stableIndex(seed: string, length: number) {
  let hash = 2_166_136_261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) % length;
}

export function selectLifeEnding(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'eventId' | 'lastMemoryId' | 'locationId'>) {
  const maritimeLocations = new Set(['LOC_VENICE', 'LOC_SWASHILI', 'LOC_POLYNESIA']);
  const candidates = maritimeLocations.has(core.locationId)
    ? expandedVariants
    : variants.filter(({ title, setting }) => !title.includes('항해') && !setting.includes('밤바다'));
  const variant = candidates[stableIndex(`${core.answerHash}:${core.recordNo}:${core.eventId}:${core.lastMemoryId}:ending`, candidates.length)]!;
  const ageRange = variant.maxAge - variant.minAge + 1;
  const ageAtDeath = variant.minAge + stableIndex(`${core.answerHash}:age`, ageRange);
  const lifespanLabel: StoryProfile['lifespanLabel'] = ageAtDeath < 18 ? '짧은 생' : ageAtDeath < 30 ? '이른 생의 끝' : ageAtDeath < 55 ? '중년에 끝난 생' : ageAtDeath < 78 ? '노년까지 이어진 생' : '긴 생';
  const { minAge: _minAge, maxAge: _maxAge, ...ending } = variant;
  return { ageAtDeath, lifespanLabel, reachedOldAge: ageAtDeath >= 60, ending };
}
