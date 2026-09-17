import { Injectable } from '@nestjs/common';
import type { AnswerInput } from '@pastlife/scoring';
import type { AssessmentRepository, StoredImage, StoredResult, StoredSession } from './assessment.repository.js';

@Injectable()
export class MemoryAssessmentRepository implements AssessmentRepository {
  private readonly sessions = new Map<string, StoredSession>();
  private readonly results = new Map<string, StoredResult>();
  private readonly adEvents = new Map<string, { sessionId: string; slot: number }>();

  async createSession(input: Omit<StoredSession, 'answers' | 'questions' | 'unlocks'>) {
    const session: StoredSession = { ...input, answers: [], questions: [], unlocks: [] };
    this.sessions.set(session.id, session);
    return structuredClone(session);
  }

  async getSession(id: string) {
    const session = this.sessions.get(id);
    return session ? structuredClone(session) : undefined;
  }

  async saveAnswer(sessionId: string, answer: AnswerInput) {
    const session = this.requireSession(sessionId);
    const withoutStage = session.answers.filter(({ stage }) => stage !== answer.stage);
    session.answers = [...withoutStage, answer].sort((left, right) => left.stage - right.stage);
    session.status = session.answers.length === 6 ? 'QUESTION_COMPLETE' : 'QUESTION_IN_PROGRESS';
    return structuredClone(session);
  }

  async lockQuestion(sessionId: string, stage: number, questionId: string) {
    const session = this.requireSession(sessionId);
    const existing = session.questions.find((question) => question.stage === stage);
    if (existing) return existing.questionId;
    session.questions.push({ stage, questionId });
    session.questions.sort((left, right) => left.stage - right.stage);
    return questionId;
  }

  async getQuestionHistory(subjectKey: string, excludeSessionId: string, sessionLimit: number) {
    return [...this.sessions.values()]
      .filter((session) => session.anonymousId === subjectKey && session.id !== excludeSessionId)
      .reverse()
      .slice(0, sessionLimit)
      .flatMap((session) => session.questions.map(({ questionId }) => questionId));
  }

  async setViewMode(sessionId: string, viewMode: 'VIDEO' | 'TEXT') {
    this.requireSession(sessionId).viewMode = viewMode;
    return viewMode;
  }

  async setSessionStatus(sessionId: string, status: string) {
    this.requireSession(sessionId).status = status;
  }

  async saveResult(result: StoredResult) {
    const existing = await this.getResultBySession(result.sessionId);
    if (existing) return existing;
    this.results.set(result.id, result);
    const session = this.requireSession(result.sessionId);
    session.resultId = result.id;
    session.status = 'RESULT_READY';
    return structuredClone(result);
  }

  async getResult(id: string) {
    const result = this.results.get(id);
    return result ? structuredClone(result) : undefined;
  }

  async getResultBySession(sessionId: string) {
    const result = [...this.results.values()].find((candidate) => candidate.sessionId === sessionId);
    return result ? structuredClone(result) : undefined;
  }

  async saveResultImage(resultId: string, image: StoredImage) {
    const result = this.results.get(resultId);
    if (!result) throw new Error(`Result ${resultId} not found`);
    if (result.image) return structuredClone(result.image);
    result.image = image;
    return structuredClone(image);
  }

  async completeAd(sessionId: string, slot: number, providerEventId: string) {
    const prior = this.adEvents.get(providerEventId);
    if (prior && (prior.sessionId !== sessionId || prior.slot !== slot)) throw new Error('Provider event was already used');
    const session = this.requireSession(sessionId);
    this.adEvents.set(providerEventId, { sessionId, slot });
    const unlock = slot === 1 ? 'BASIC' : slot === 2 ? 'DEEP' : 'GUIDE';
    if (!session.unlocks.includes(unlock)) session.unlocks.push(unlock);
    if (slot === 1) session.status = 'BASIC_UNLOCKED';
    if (slot === 2) session.status = 'DEEP_UNLOCKED';
    if (slot === 3) session.status = 'GUIDE_UNLOCKED';
    return true;
  }

  private requireSession(id: string) {
    const session = this.sessions.get(id);
    if (!session) throw new Error(`Session ${id} not found`);
    return session;
  }
}
