export const tags = [
  'freedom',
  'stability',
  'achievement',
  'honor',
  'knowledge',
  'spirituality',
  'adventure',
  'survival',
  'courage',
  'independence',
  'creativity',
  'connection',
  'devotion',
  'empathy',
  'protection',
  'calm',
  'longing',
  'regret',
] as const;

export const axes = [
  'mobility',
  'urbanity',
  'authority',
  'collectivism',
  'risk',
  'materiality',
] as const;

export type CoreTag = (typeof tags)[number];
export type AxisCode = (typeof axes)[number];
export type Stage = 1 | 2 | 3 | 4 | 5 | 6;
export type TagScore = { tag: CoreTag; score: 1 | 2 | 3 };
export type AxisScore = { axis: AxisCode; score: -2 | -1 | 0 | 1 | 2 };

export type Choice = {
  id: string;
  text: string;
  displayOrder: number;
  tagScores: TagScore[];
  axisScores: AxisScore[];
};

export type Question = {
  id: string;
  stage: Stage;
  text: string;
  choices: Choice[];
};

export type Candidate = {
  id: string;
  label: string;
  affinityTags: CoreTag[];
  fallback?: boolean;
};
