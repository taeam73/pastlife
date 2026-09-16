import { Injectable } from '@nestjs/common';
import type { AnswerInput } from '@pastlife/scoring';
import type { AssessmentRepository, StoredResult, StoredSession } from './assessment.repository.js';

@Injectable()
export class MemoryAssessmentRepository implements AssessmentRepository {
  private readonly sessions = new Map<string, StoredSession>();
  private readonly results = new Map<string, StoredResult>();
  private readonly adEvents = new Map<string, { sessionId: string; slot: number }>();

  async createSession(input: Omit<StoredSession, 'answers' | 'unlocks'>) {
    const session: StoredSession = { ...input, answers: [], unlocks: [] };
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
