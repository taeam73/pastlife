import { randomBytes, randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, GoneException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { questions, selectQuestion, type Stage } from '@pastlife/content';
import { calculateResult } from '@pastlife/scoring';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../repositories/assessment.repository.js';
import { NARRATIVE_PROVIDER, type NarrativeProvider } from '../providers/narrative.provider.js';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(ASSESSMENT_REPOSITORY) private readonly repository: AssessmentRepository,
    @Inject(NARRATIVE_PROVIDER) private readonly narrativeProvider: NarrativeProvider,
  ) {}

  async create(locale = 'ko', deviceId?: string, preferredViewMode: 'VIDEO' | 'TEXT' = 'VIDEO') {
    const session = await this.repository.createSession({
      id: randomUUID(),
      anonymousId: deviceId ?? randomUUID(),
      locale,
      seed: randomBytes(16).toString('hex'),
      contentVersion: process.env.CONTENT_VERSION ?? '2.5.0',
      status: 'CREATED',
      viewMode: preferredViewMode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return { sessionId: session.id, seed: session.seed, contentVersion: session.contentVersion, status: session.status, viewMode: session.viewMode };
  }

  async question(sessionId: string, stageNumber: number) {
    const session = await this.requireSession(sessionId);
    if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 6) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'stage must be between 1 and 6' });
    const locked = session.questions.find(({ stage }) => stage === stageNumber);
    const history = await this.repository.getQuestionHistory(session.anonymousId, session.id, 10);
    const selected = locked
      ? questions.find(({ id }) => id === locked.questionId)
      : selectQuestion({
          stage: stageNumber as Stage,
          sessionSeed: session.seed,
          contentVersion: session.contentVersion,
          excludedQuestionIds: [...history, ...session.questions.map(({ questionId }) => questionId)],
        });
    if (!selected) throw new NotFoundException({ code: 'VALIDATION_ERROR', message: 'Question not found' });
    const lockedQuestionId = await this.repository.lockQuestion(sessionId, stageNumber, selected.id);
    const question = questions.find(({ id }) => id === lockedQuestionId);
    if (!question) throw new NotFoundException({ code: 'VALIDATION_ERROR', message: 'Question not found' });
    return {
      id: question.id,
      stage: question.stage,
      text: question.text,
      choices: question.choices.map(({ id, text, displayOrder }) => ({ id, text, displayOrder })),
    };
  }

  async saveAnswer(sessionId: string, stageNumber: number, questionId: string, choiceId: string) {
    const session = await this.requireSession(sessionId);
    if (['CALCULATING', 'NARRATIVE_GENERATING', 'RESULT_READY', 'BASIC_UNLOCKED'].includes(session.status)) {
      throw new ConflictException({ code: 'INVALID_STATE', message: 'Answers are locked after completion' });
    }
    if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 6) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid stage' });
    const locked = session.questions.find(({ stage }) => stage === stageNumber);
    const expected = locked ? questions.find(({ id }) => id === locked.questionId) : undefined;
    if (!expected) throw new ConflictException({ code: 'INVALID_STATE', message: 'Question must be requested before answering' });
    if (expected.id !== questionId || !expected.choices.some(({ id }) => id === choiceId)) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Question or choice does not match this session stage' });
    }
    const saved = await this.repository.saveAnswer(sessionId, { stage: stageNumber as Stage, questionId, choiceId });
    return { sessionId, answeredStages: saved.answers.map(({ stage }) => stage), status: saved.status };
  }

  async setViewMode(sessionId: string, viewMode: 'VIDEO' | 'TEXT') {
    await this.requireSession(sessionId);
    return { sessionId, viewMode: await this.repository.setViewMode(sessionId, viewMode) };
  }

  async complete(sessionId: string) {
    const session = await this.requireSession(sessionId);
    const existing = await this.repository.getResultBySession(sessionId);
    if (existing) return { resultId: existing.id, status: 'RESULT_READY' };
    if (session.answers.length !== 6) throw new ConflictException({ code: 'INVALID_STATE', message: 'Six answers are required before completion' });

    await this.repository.setSessionStatus(sessionId, 'CALCULATING');
    const core = calculateResult({ answers: session.answers, sessionSeed: session.seed, contentVersion: session.contentVersion });
    await this.repository.setSessionStatus(sessionId, 'NARRATIVE_GENERATING');
    const blocks = await this.narrativeProvider.createBasic(core);
    const result = await this.repository.saveResult({ id: randomUUID(), sessionId, status: 'READY', core, blocks });
    return { resultId: result.id, status: 'RESULT_READY' };
  }

  private async requireSession(id: string) {
    const session = await this.repository.getSession(id);
    if (!session) throw new NotFoundException({ code: 'VALIDATION_ERROR', message: 'Session not found' });
    if (session.expiresAt.getTime() <= Date.now() && !session.resultId) throw new GoneException({ code: 'SESSION_EXPIRED', message: 'Session expired' });
    return session;
  }
}
