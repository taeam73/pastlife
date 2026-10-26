import type { ResultCore, AnswerInput } from '@pastlife/scoring';
import type { StoryProfile } from '../story-profile.js';
import type { ImageLayer } from '../providers/image.provider.js';
import type { z } from 'zod';
import type { ResultPresentationSchema } from '@pastlife/contracts';

export type StoredPresentation = z.infer<typeof ResultPresentationSchema>;

export type StoredSession = {
  id: string;
  anonymousId: string;
  locale: string;
  seed: string;
  contentVersion: string;
  status: string;
  viewMode: 'VIDEO' | 'TEXT';
  expiresAt: Date;
  answers: AnswerInput[];
  questions: Array<{ stage: number; questionId: string }>;
  resultId?: string;
  unlocks: string[];
};

export type NarrativeBlock = { id: string; title: string; body: string };
export type StoredResult = {
  id: string;
  sessionId: string;
  status: 'READY' | 'FAILED';
  core: ResultCore;
  blocks: NarrativeBlock[];
  storyProfile?: StoryProfile;
  image?: StoredImage;
  presentation?: StoredPresentation;
  finalMomentReadAt?: Date;
};

export type StoredImage = {
  sourceType: 'AI' | 'LIBRARY';
  uri: string;
  alt: string;
  status: 'READY' | 'FALLBACK';
  attemptCount: number;
  errorCode?: string;
  layers?: ImageLayer[];
  compositeUri?: string;
};

export const ASSESSMENT_REPOSITORY = Symbol('ASSESSMENT_REPOSITORY');

export interface AssessmentRepository {
  createSession(input: Omit<StoredSession, 'answers' | 'questions' | 'unlocks'>): Promise<StoredSession>;
  getSession(id: string): Promise<StoredSession | undefined>;
  saveAnswer(sessionId: string, answer: AnswerInput): Promise<StoredSession>;
  lockQuestion(sessionId: string, stage: number, questionId: string): Promise<string>;
  getQuestionHistory(subjectKey: string, excludeSessionId: string, sessionLimit: number): Promise<string[]>;
  setViewMode(sessionId: string, viewMode: 'VIDEO' | 'TEXT'): Promise<'VIDEO' | 'TEXT'>;
  setSessionStatus(sessionId: string, status: string): Promise<void>;
  saveResult(result: StoredResult): Promise<StoredResult>;
  getResult(id: string): Promise<StoredResult | undefined>;
  getResultBySession(sessionId: string): Promise<StoredResult | undefined>;
  saveResultImage(resultId: string, image: StoredImage): Promise<StoredImage>;
  saveResultPresentation(resultId: string, presentation: StoredPresentation): Promise<StoredPresentation>;
  updateResultPresentation(resultId: string, presentation: StoredPresentation): Promise<StoredPresentation>;
  markFinalMomentRead(resultId: string): Promise<Date>;
  completeAd(sessionId: string, slot: number, providerEventId: string): Promise<boolean>;
}
