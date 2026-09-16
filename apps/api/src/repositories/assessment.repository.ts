import type { ResultCore, AnswerInput } from '@pastlife/scoring';

export type StoredSession = {
  id: string;
  anonymousId: string;
  locale: string;
  seed: string;
  contentVersion: string;
  status: string;
  expiresAt: Date;
  answers: AnswerInput[];
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
};

export const ASSESSMENT_REPOSITORY = Symbol('ASSESSMENT_REPOSITORY');

export interface AssessmentRepository {
  createSession(input: Omit<StoredSession, 'answers' | 'unlocks'>): Promise<StoredSession>;
  getSession(id: string): Promise<StoredSession | undefined>;
  saveAnswer(sessionId: string, answer: AnswerInput): Promise<StoredSession>;
  setSessionStatus(sessionId: string, status: string): Promise<void>;
  saveResult(result: StoredResult): Promise<StoredResult>;
  getResult(id: string): Promise<StoredResult | undefined>;
  getResultBySession(sessionId: string): Promise<StoredResult | undefined>;
  completeAd(sessionId: string, slot: number, providerEventId: string): Promise<boolean>;
}
