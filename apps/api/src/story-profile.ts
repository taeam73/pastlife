export type LifeEndingCategory =
  | 'NATURAL'
  | 'ILLNESS'
  | 'ACCIDENT'
  | 'DISASTER'
  | 'CONFLICT'
  | 'SACRIFICE'
  | 'PERSECUTION'
  | 'SELF_CHOSEN'
  | 'UNKNOWN';

export type StoryHighlight = {
  id: 'IDENTITY' | 'DREAM_AND_DAILY' | 'LIFE_FOUNDATION' | 'INNER_WOUND' | 'KEY_RELATIONSHIP' | 'DECISIVE_EVENT' | 'LIFE_LEGACY' | 'PRESENT_ECHO';
  title: string;
  summary: string;
  detail: string;
};

export type StoryProfile = {
  version: 1;
  ageAtDeath: number;
  lifespanLabel: '짧은 생' | '이른 생의 끝' | '중년에 끝난 생' | '노년까지 이어진 생' | '긴 생';
  reachedOldAge: boolean;
  identity: {
    fictional: true;
    name: string;
    gender: '여성' | '남성';
    appearance: string;
    voiceAndManner: string;
    temperament: string;
    complex: string;
    socialMask: string;
    stressResponse: string;
  };
  dailyLife: {
    occupationMeaning: string;
    hobby: string;
    talent: string;
    weakness: string;
    favoritePlace: string;
    favoriteFood: string;
    dailyHabit: string;
    belief: string;
    dream: string;
    unrealizedDream: string;
  };
  background: {
    familyStructure: string;
    parentStory: string;
    primaryCaregiver: string;
    siblingStory: string;
    homeAndResources: string;
    education: string;
    health: string;
    displacement: string;
  };
  innerLife: {
    formativeWound: string;
    coreFear: string;
    copingPattern: string;
    lifelongDilemma: string;
    deepestPain: string;
    secretWish: string;
  };
  characterArc: {
    outwardGoal: string;
    innerNeed: string;
    falseBelief: string;
    centralContradiction: string;
    realization: string;
  };
  relationshipNetwork: Array<{
    role: '양육자' | '형제·또래' | '핵심 인연' | '스승·라이벌' | '돌봄을 받은 사람';
    bond: string;
    tension: string;
    change: string;
  }>;
  timeline: Array<{
    age: number;
    stage: '탄생' | '유년기' | '청년기' | '삶의 전환기' | '삶의 끝자락' | '죽음';
    event: string;
    consequence: string;
  }>;
  legacy: string;
  ending: {
    category: LifeEndingCategory;
    title: string;
    cause: string;
    setting: string;
    finalChoice: string;
    aftermath: string;
  };
  highlights: StoryHighlight[];
};
