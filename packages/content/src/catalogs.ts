import type { Candidate, CoreTag } from './types.js';

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

const locationLabels = [
  ['LOC_MESOPOTAMIA', '수메르 도시 국가', '오늘날 이라크 남부'],
  ['LOC_GANGES', '마가다 문화권', '오늘날 인도 북동부'],
  ['LOC_ABBASID', '아바스 왕조 문화권', '오늘날 이라크와 주변 지역'],
  ['LOC_VENICE', '베네치아 공화국', '오늘날 이탈리아 북부'],
  ['LOC_SWASHILI', '스와힐리 해안 도시권', '오늘날 동아프리카 해안'],
  ['LOC_ANDES', '안데스 고원 공동체', '오늘날 페루와 볼리비아 일대'],
  ['LOC_STEPPE', '중앙아시아 초원 공동체', '오늘날 몽골과 중앙아시아 일대'],
  ['LOC_POLYNESIA', '폴리네시아 항해 공동체', '오늘날 남태평양 도서 지역'],
] as const;

export const historicalLocations: HistoricalLocation[] = locationLabels.map(
  ([id, label, presentDayContext], index) => ({
    id,
    label,
    presentDayContext,
    eraId: eras[index]!.id,
    regionId: regions[index]!.id,
    affinityTags: tagSets[index]!,
    fallback: index === 0,
  }),
);

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

const occupationLabels = ['서기관', '기록 교사', '의례 담당자', '지도 제작자', '항해사', '공방 기술자', '공동체 돌봄이', '별과 바람을 읽는 길잡이'];
export const occupations: Occupation[] = historicalLocations.map((location, index) => ({
  id: `OCC_${String(index + 1).padStart(2, '0')}`,
  label: occupationLabels[index]!,
  classId: socialClasses[(index + 2) % socialClasses.length]!.id,
  allowedEraIds: [location.eraId],
  allowedLocationIds: [location.id],
  affinityTags: tagSets[index]!,
  fallback: index === 0,
}));

export const personalities: Candidate[] = [
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

export const lifeEvents: Candidate[] = eras.map((era, index) => ({
  id: `EVENT_${String(index + 1).padStart(2, '0')}`,
  label: `${era.label}의 변화를 기록으로 남긴 일`,
  affinityTags: tagSets[index]!,
  fallback: index === 0,
}));

export const lastMemories: Candidate[] = [
  { id: 'MEM_RAIN', label: '창밖의 비와 손에 남은 미완성 기록', affinityTags: ['calm', 'regret'], fallback: true },
  { id: 'MEM_SEA', label: '해 질 무렵의 바다와 먼 약속', affinityTags: ['freedom', 'longing'] },
  { id: 'MEM_LIGHTS', label: '사람들이 밝힌 등불과 따뜻한 손', affinityTags: ['connection', 'protection'] },
  { id: 'MEM_MOUNTAIN', label: '눈 덮인 산과 고요한 숨', affinityTags: ['independence', 'spirituality'] },
  { id: 'MEM_TOOL', label: '마지막까지 놓지 못한 작업 도구', affinityTags: ['creativity', 'achievement'] },
  { id: 'MEM_FACE', label: '곁을 지켜 준 한 사람의 얼굴', affinityTags: ['connection', 'devotion'] },
];

export const basicTemplates = [
  { id: 'BASIC_COVER', title: '전생 기록 표지' },
  { id: 'BASIC_PERSON', title: '나는 어떤 사람이었는가' },
  { id: 'BASIC_DAILY', title: '삶의 풍경' },
  { id: 'BASIC_RELATIONSHIP', title: '중요한 인연' },
  { id: 'BASIC_EVENT', title: '삶을 바꾼 사건' },
  { id: 'BASIC_LAST_MEMORY', title: '마지막 기억' },
  { id: 'BASIC_TRACE', title: '현생에 남은 흔적' },
] as const;

export const bonusTemplates = [
  { id: 'BONUS_MOTIVE', title: '삶을 움직인 욕망', body: '당신의 선택은 가장 오래 지키고 싶은 가치를 향해 조용히 모였습니다.' },
  { id: 'BONUS_TURNING_POINT', title: '운명의 갈림길', body: '위기의 순간에도 한 가지 원칙을 놓지 않으려는 결이 보입니다.' },
  { id: 'BONUS_UNFINISHED', title: '끝내 남은 미련', body: '완성되지 않은 기록은 다음 선택을 위한 질문으로 남아 있습니다.' },
  { id: 'BONUS_RELATIONSHIP', title: '이어진 인연의 결', body: '멀어진 뒤에도 마음속에서 이어지는 관계의 온도가 느껴집니다.' },
] as const;

export const guideTemplates = [
  { id: 'GUIDE_TEMPO', title: '지금의 속도', body: '빠르게 결론내리기보다 충분히 머무는 시간이 선택의 감각을 선명하게 해줍니다.' },
  { id: 'GUIDE_RELATIONSHIP', title: '관계의 온도', body: '소중한 사람에게 먼저 안부를 건네는 작은 행동이 오래 남는 인연을 만듭니다.' },
  { id: 'GUIDE_WORK', title: '일과 재능', body: '이미 익숙한 기술을 다른 사람과 나누는 일이 다음 가능성을 열어줍니다.' },
  { id: 'GUIDE_MINDSET', title: '마음가짐', body: '모든 답을 확정하려 하기보다 오늘의 선택을 기록해 보세요.' },
] as const;
