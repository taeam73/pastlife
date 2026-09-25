import type { Candidate, CoreTag } from './types.js';
import { historicalOccupations } from './historical/occupations.js';
import { historicalSettings } from './historical/settings.js';

export type Era = Candidate & { code: string; yearStart: number; yearEnd: number };
export type Region = Candidate & { code: string };
export type HistoricalLocation = Candidate & {
  eraId: string;
  regionId: string;
  presentDayContext: string;
};
export type Occupation = Candidate & {
  classId: string;
  allowedEraIds: string[];
  allowedLocationIds: string[];
};

const tagSets: CoreTag[][] = [
  ['knowledge', 'stability'],
  ['honor', 'courage'],
  ['devotion', 'protection'],
  ['creativity', 'achievement'],
  ['adventure', 'freedom'],
  ['achievement', 'survival'],
  ['connection', 'empathy'],
  ['spirituality', 'calm'],
];

export const eras: Era[] = [
  ['ERA_ANCIENT_CIV', '고대 문명기', -3500, -500],
  ['ERA_CLASSICAL', '고전 고대', -500, 500],
  ['ERA_MEDIEVAL', '중세', 500, 1450],
  ['ERA_RENAISSANCE_EARLY_MODERN', '르네상스 근세', 1450, 1650],
  ['ERA_AGE_OF_EXPLORATION', '대항해 시대', 1450, 1750],
  ['ERA_INDUSTRIAL', '근대 산업화 시대', 1750, 1914],
  ['ERA_20C_EARLY', '20세기 전반', 1914, 1945],
  ['ERA_20C_LATE', '20세기 후반', 1945, 1999],
].map(([id, label, yearStart, yearEnd], index) => ({
  id: id as string,
  code: id as string,
  label: label as string,
  yearStart: yearStart as number,
  yearEnd: yearEnd as number,
  affinityTags: tagSets[index]!,
  fallback: index === 0,
}));

const regionRows = [
  ['REG_EAST_ASIA', '동아시아'],
  ['REG_SOUTH_ASIA', '남아시아'],
  ['REG_MENA', '중동 북아프리카'],
  ['REG_EUROPE', '유럽'],
  ['REG_SUBSAHARAN_AFRICA', '사하라 이남 아프리카'],
  ['REG_AMERICAS', '아메리카 대륙'],
  ['REG_CENTRAL_ASIA', '중앙아시아 유목권'],
  ['REG_OCEANIA', '오세아니아'],
 ] as const;

export const regions: Region[] = regionRows.map(([id, label], index) => ({
  id,
  code: id,
  label,
  affinityTags: tagSets[index]!,
  fallback: index === 0,
}));

export const historicalLocations: HistoricalLocation[] = historicalSettings.map((setting) => ({
  id: setting.id,
  label: setting.label,
  presentDayContext: setting.presentDayContext,
  eraId: setting.eraId,
  regionId: setting.regionId,
  affinityTags: [...setting.affinityTags],
  ...(setting.fallback === undefined ? {} : { fallback: setting.fallback }),
}));

const socialClassRows = [
  ['CLASS_ROYAL_NOBLE', '왕족 귀족'],
  ['CLASS_ADMIN', '관료 행정가'],
  ['CLASS_SCHOLAR', '학자 교육자'],
  ['CLASS_RELIGIOUS', '종교인 수행자'],
  ['CLASS_MILITARY', '군인 무사'],
  ['CLASS_MERCHANT', '상인 무역인'],
  ['CLASS_ARTISAN', '장인 기술자'],
  ['CLASS_AGRICULTURE', '농업 생산 종사자'],
  ['CLASS_ARTIST', '예술가 창작자'],
  ['CLASS_EXPLORER', '탐험가 항해자'],
  ['CLASS_HEALER', '의료 치유 종사자'],
  ['CLASS_COMMON_LABOR', '서민 노동 생활직'],
] as const;

export const socialClasses = socialClassRows.map(([id, label], index) => ({ id, label, affinityTags: tagSets[index % tagSets.length]! }));

const retiredOccupationIds = new Set(['OCC_01', 'OCC_02', 'OCC_03', 'OCC_04', 'OCC_05', 'OCC_06', 'OCC_07', 'OCC_08']);

export const occupations: Occupation[] = historicalOccupations.filter(({ id }) => !retiredOccupationIds.has(id)).map((occupation, index) => ({
  id: occupation.id,
  label: occupation.label,
  classId: occupation.classId,
  allowedEraIds: [...new Set(historicalSettings.filter(({ occupationIds }) => occupationIds.includes(occupation.id)).map(({ eraId }) => eraId))],
  allowedLocationIds: historicalSettings.filter(({ occupationIds }) => occupationIds.includes(occupation.id)).map(({ id }) => id),
  affinityTags: [...occupation.affinityTags],
  fallback: index === 0,
}));

const basePersonalities: Candidate[] = [
  { id: 'PERSON_ANALYTIC', label: '탐구적이고 조용한 완성주의자', affinityTags: ['knowledge', 'calm'], fallback: true },
  { id: 'PERSON_GUARDIAN', label: '사람을 먼저 지키는 수호자', affinityTags: ['protection', 'devotion'] },
  { id: 'PERSON_PIONEER', label: '낯선 길을 두려워하지 않는 개척자', affinityTags: ['adventure', 'courage'] },
  { id: 'PERSON_ARTISAN', label: '손끝으로 의미를 남기는 창작자', affinityTags: ['creativity', 'achievement'] },
];

export const relationships: Candidate[] = [
  { id: 'REL_COMPANION', label: '오랜 동료', affinityTags: ['connection', 'honor'], fallback: true },
  { id: 'REL_FAMILY', label: '끝까지 지키려 한 가족', affinityTags: ['protection', 'devotion'] },
  { id: 'REL_LOST_LOVE', label: '다시 만나지 못한 사랑', affinityTags: ['longing', 'regret'] },
  { id: 'REL_STUDENT', label: '배움을 이어받은 제자', affinityTags: ['knowledge', 'empathy'] },
];

export const additionalPersonalities: Candidate[] = [
  { id: 'PERSON_MEDIATOR', label: '서로 다른 사람의 말을 번역해 합의점을 찾는 중재자', affinityTags: ['connection', 'empathy'] },
  { id: 'PERSON_ARCHIVIST', label: '사라질지 모를 기록과 이름을 끝까지 보존하는 관찰자', affinityTags: ['knowledge', 'stability'] },
  { id: 'PERSON_CAREGIVER', label: '위험을 먼저 살피고 조용히 사람을 돌보는 보호자', affinityTags: ['protection', 'devotion'] },
  { id: 'PERSON_REBEL', label: '정해진 질서에 질문을 던지고 새로운 길을 여는 개척자', affinityTags: ['courage', 'freedom'] },
  { id: 'PERSON_MAKER', label: '망가진 물건에서 다시 쓸 가능성을 발견하는 제작자', affinityTags: ['creativity', 'survival'] },
  { id: 'PERSON_WITNESS', label: '사건의 한가운데서도 사실과 사람의 표정을 기억하는 증언자', affinityTags: ['knowledge', 'honor'] },
  { id: 'PERSON_CONNECTOR', label: '멀어진 사람과 지역 사이에 연락망을 만드는 연결자', affinityTags: ['connection', 'adventure'] },
  { id: 'PERSON_STEADFAST', label: '오래 걸리더라도 매일 같은 약속을 지키는 꾸준한 사람', affinityTags: ['stability', 'calm'] },
];

export const personalities: Candidate[] = [...basePersonalities, ...additionalPersonalities];

export const lifeEvents: Candidate[] = eras.map((era, index) => ({
  id: `EVENT_${String(index + 1).padStart(2, '0')}`,
  label: `${era.label}의 변화를 기록으로 남긴 일`,
  affinityTags: tagSets[index]!,
  fallback: index === 0,
}));

const baseLastMemories: Candidate[] = [
  { id: 'MEM_RAIN', label: '창밖의 비와 손에 남은 미완성 기록', affinityTags: ['calm', 'regret'], fallback: true },
  { id: 'MEM_SEA', label: '해 질 무렵의 바다와 먼 약속', affinityTags: ['freedom', 'longing'] },
  { id: 'MEM_LIGHTS', label: '사람들이 밝힌 등불과 따뜻한 손', affinityTags: ['connection', 'protection'] },
  { id: 'MEM_MOUNTAIN', label: '눈 덮인 산과 고요한 숨', affinityTags: ['independence', 'spirituality'] },
  { id: 'MEM_TOOL', label: '마지막까지 놓지 못한 작업 도구', affinityTags: ['creativity', 'achievement'] },
  { id: 'MEM_FACE', label: '곁을 지켜 준 한 사람의 얼굴', affinityTags: ['connection', 'devotion'] },
];

export const lastMemories: Candidate[] = [...baseLastMemories, ...Array.from({ length: 24 }, (_, index) => ({ id: `MEM_VARIANT_${String(index + 1).padStart(2, '0')}`, label: '그 시절 누군가의 목소리와 손길이 남은 기억', affinityTags: tagSets[index % tagSets.length]! }))];

export const basicTemplates = [
  { id: 'LIFE_BIRTH', title: '탄생 · 당신의 이야기가 시작된 날' },
  { id: 'LIFE_CHILDHOOD', title: '어린 시절 · 책임감을 배운 순간' },
  { id: 'LIFE_YOUTH', title: '청년 시절 · 일과 소중한 관계가 깊어진 때' },
  { id: 'LIFE_MIDLIFE', title: '인생의 전환점 · 큰 선택을 한 날' },
  { id: 'LIFE_LATER_YEARS', title: '인생의 후반 · 마지막까지 지킨 것' },
  { id: 'LIFE_DEATH', title: '마지막 순간 · 떠오른 기억' },
] as const;

export const bonusTemplates = [
  { id: 'BONUS_MOTIVE', title: '가장 중요하게 여긴 것', body: '당신은 자신이 꼭 지키고 싶은 것을 기준으로 선택했습니다.' },
  { id: 'BONUS_TURNING_POINT', title: '인생을 바꾼 선택', body: '힘든 순간에도 자신만의 원칙을 포기하지 않았습니다.' },
  { id: 'BONUS_UNFINISHED', title: '끝내 하지 못한 일', body: '마치지 못한 일은 다음 선택을 생각하게 하는 질문으로 남았습니다.' },
  { id: 'BONUS_RELATIONSHIP', title: '오래 남은 인연', body: '멀어진 뒤에도 그 사람과의 기억은 마음속에 남아 있었습니다.' },
] as const;

export const guideTemplates = [
  { id: 'GUIDE_TEMPO', title: '조금 천천히 가도 괜찮아요', body: '답을 빨리 정하려 하지 말고, 충분히 생각한 뒤 선택해 보세요.' },
  { id: 'GUIDE_RELATIONSHIP', title: '먼저 안부를 물어보세요', body: '소중한 사람에게 먼저 연락하는 작은 행동이 관계를 오래 이어 줍니다.' },
  { id: 'GUIDE_WORK', title: '잘하는 것을 나눠 보세요', body: '내가 잘하는 일을 다른 사람과 나누면 새로운 기회가 생길 수 있어요.' },
  { id: 'GUIDE_MINDSET', title: '오늘의 선택에 집중하세요', body: '정답을 찾으려 애쓰기보다 오늘 내가 한 선택을 가볍게 적어 보세요.' },
] as const;
