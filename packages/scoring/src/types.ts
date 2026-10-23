import type { AxisCode, CoreTag, Stage, StorySignal } from '@pastlife/content';

export type AnswerInput = {
  stage: Stage;
  questionId: string;
  choiceId: string;
};

export type ScoreSummary = {
  tags: Record<CoreTag, number>;
  axes: Record<AxisCode, number>;
  topTags: Array<{ tag: CoreTag; score: number }>;
};

export type ResultCore = {
  storyId?: string;
  storySignals?: StorySignal[];
  contentVersion: string;
  answerHash: string;
  recordNo: number;
  scores: ScoreSummary;
  eraId: string;
  regionId: string;
  locationId: string;
  classId: string;
  occupationId: string;
  personalityId: string;
  relationshipId: string;
  eventId: string;
  lastMemoryId: string;
  basicBlockIds: string[];
  libraryImage: {
    key: string;
    promptTags: string[];
  };
};

export type CalculateResultInput = {
  answers: AnswerInput[];
  sessionSeed: string;
  contentVersion: string;
};
