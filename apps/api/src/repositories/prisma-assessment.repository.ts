import { Inject, Injectable } from '@nestjs/common';
import { Prisma, SessionStatus, UnlockType } from '@prisma/client';
import type { Stage } from '@pastlife/content';
import type { AnswerInput, ResultCore } from '@pastlife/scoring';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AssessmentRepository, NarrativeBlock, StoredImage, StoredResult, StoredSession } from './assessment.repository.js';
import type { StoryProfile } from '../story-profile.js';

@Injectable()
export class PrismaAssessmentRepository implements AssessmentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createSession(input: Omit<StoredSession, 'answers' | 'questions' | 'unlocks'>) {
    const row = await this.prisma.session.create({
      data: {
        id: input.id,
        anonymousId: input.anonymousId,
        locale: input.locale,
        seed: input.seed,
        contentVersion: input.contentVersion,
        status: input.status as SessionStatus,
        viewMode: input.viewMode,
        expiresAt: input.expiresAt,
      },
      include: { answers: true, questions: true, unlocks: true, result: true },
    });
    return this.toSession(row);
  }

  async getSession(id: string) {
    const row = await this.prisma.session.findUnique({ where: { id }, include: { answers: true, questions: true, unlocks: true, result: true } });
    return row ? this.toSession(row) : undefined;
  }

  async saveAnswer(sessionId: string, answer: AnswerInput) {
    return this.prisma.$transaction(async (tx) => {
      await tx.sessionAnswer.upsert({
        where: { sessionId_stage: { sessionId, stage: answer.stage } },
        update: { questionId: answer.questionId, choiceId: answer.choiceId, answeredAt: new Date() },
        create: { sessionId, stage: answer.stage, questionId: answer.questionId, choiceId: answer.choiceId },
      });
      const count = await tx.sessionAnswer.count({ where: { sessionId } });
      const row = await tx.session.update({
        where: { id: sessionId },
        data: { status: count === 6 ? 'QUESTION_COMPLETE' : 'QUESTION_IN_PROGRESS' },
        include: { answers: true, questions: true, unlocks: true, result: true },
      });
      return this.toSession(row);
    });
  }

  async lockQuestion(sessionId: string, stage: number, questionId: string) {
    const row = await this.prisma.sessionQuestion.upsert({
      where: { sessionId_stage: { sessionId, stage } },
      update: {},
      create: { sessionId, stage, questionId },
    });
    return row.questionId;
  }

  async getQuestionHistory(subjectKey: string, excludeSessionId: string, sessionLimit: number) {
    const sessions = await this.prisma.session.findMany({
      where: { anonymousId: subjectKey, id: { not: excludeSessionId } },
      orderBy: { createdAt: 'desc' },
      take: sessionLimit,
      include: { questions: { orderBy: { stage: 'asc' } } },
    });
    return sessions.flatMap((session) => session.questions.map(({ questionId }) => questionId));
  }

  async setViewMode(sessionId: string, viewMode: 'VIDEO' | 'TEXT') {
    const session = await this.prisma.session.update({ where: { id: sessionId }, data: { viewMode } });
    return session.viewMode;
  }

  async setSessionStatus(sessionId: string, status: string) {
    await this.prisma.session.update({ where: { id: sessionId }, data: { status: status as SessionStatus } });
  }

  async saveResult(result: StoredResult) {
    const existing = await this.getResultBySession(result.sessionId);
    if (existing) return existing;
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.result.create({
          data: {
            id: result.id,
            sessionId: result.sessionId,
            answerHash: result.core.answerHash,
            contentVersion: result.core.contentVersion,
            recordNo: result.core.recordNo,
            coreJson: result.core as unknown as Prisma.InputJsonValue,
            storyProfileJson: result.storyProfile as unknown as Prisma.InputJsonValue,
            status: 'READY',
            texts: { create: { locale: 'ko', blocksJson: result.blocks as unknown as Prisma.InputJsonValue, generatorVersion: 'template-v1' } },
          },
        });
        await tx.session.update({ where: { id: result.sessionId }, data: { status: 'RESULT_READY' } });
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
    }
    const saved = await this.getResultBySession(result.sessionId);
    if (!saved) throw new Error('Result transaction completed without a readable result');
    return saved;
  }

  async getResult(id: string) {
    const row = await this.prisma.result.findUnique({ where: { id }, include: { texts: true, image: true } });
    return row ? this.toResult(row) : undefined;
  }

  async getResultBySession(sessionId: string) {
    const row = await this.prisma.result.findUnique({ where: { sessionId }, include: { texts: true, image: true } });
    return row ? this.toResult(row) : undefined;
  }

  async saveResultImage(resultId: string, image: StoredImage) {
    const row = await this.prisma.resultImage.upsert({
      where: { resultId },
      update: {},
      create: {
        resultId,
        sourceType: image.sourceType,
        storageUrl: image.uri,
        promptHash: resultId,
        status: image.status,
        altText: image.alt,
        attemptCount: image.attemptCount,
        errorCode: image.errorCode ?? null,
      },
    });
    return {
      sourceType: row.sourceType === 'AI' ? 'AI' as const : 'LIBRARY' as const,
      uri: row.storageUrl,
      alt: row.altText,
      status: row.status === 'FALLBACK' ? 'FALLBACK' as const : 'READY' as const,
      attemptCount: row.attemptCount,
      ...(row.errorCode ? { errorCode: row.errorCode } : {}),
    };
  }

  async completeAd(sessionId: string, slot: number, providerEventId: string) {
    await this.prisma.$transaction(async (tx) => {
      const prior = await tx.adEvent.findUnique({ where: { providerEventId } });
      if (prior && (prior.sessionId !== sessionId || prior.slot !== slot)) throw new Error('Provider event was already used');
      const event = prior ?? await tx.adEvent.create({ data: { sessionId, slot, providerEventId, status: 'VERIFIED' } });
      const unlockType = (slot === 1 ? 'BASIC' : slot === 2 ? 'DEEP' : 'GUIDE') as UnlockType;
      await tx.sessionUnlock.upsert({
        where: { sessionId_unlockType: { sessionId, unlockType } },
        update: {},
        create: { sessionId, unlockType, adEventId: event.id },
      });
      if (slot === 1) await tx.session.update({ where: { id: sessionId }, data: { status: 'BASIC_UNLOCKED' } });
      if (slot === 2) await tx.session.update({ where: { id: sessionId }, data: { status: 'DEEP_UNLOCKED' } });
      if (slot === 3) await tx.session.update({ where: { id: sessionId }, data: { status: 'GUIDE_UNLOCKED' } });
    });
    return true;
  }

  private toSession(row: {
    id: string; anonymousId: string; locale: string; seed: string; contentVersion: string; status: SessionStatus; viewMode: 'VIDEO' | 'TEXT'; expiresAt: Date;
    answers: Array<{ stage: number; questionId: string; choiceId: string }>;
    questions: Array<{ stage: number; questionId: string }>;
    unlocks: Array<{ unlockType: UnlockType }>;
    result: { id: string } | null;
  }): StoredSession {
    return {
      id: row.id,
      anonymousId: row.anonymousId,
      locale: row.locale,
      seed: row.seed,
      contentVersion: row.contentVersion,
      status: row.status,
      viewMode: row.viewMode,
      expiresAt: row.expiresAt,
      answers: row.answers.map(({ stage, questionId, choiceId }) => ({ stage: stage as Stage, questionId, choiceId })).sort((a, b) => a.stage - b.stage),
      questions: row.questions.map(({ stage, questionId }) => ({ stage, questionId })).sort((a, b) => a.stage - b.stage),
      ...(row.result ? { resultId: row.result.id } : {}),
      unlocks: row.unlocks.map(({ unlockType }) => unlockType),
    };
  }

  private toResult(row: { id: string; sessionId: string; status: string; coreJson: Prisma.JsonValue; storyProfileJson: Prisma.JsonValue | null; texts: Array<{ blocksJson: Prisma.JsonValue }>; image: { sourceType: string; storageUrl: string; altText: string; status: string; attemptCount: number; errorCode: string | null } | null }): StoredResult {
    return {
      id: row.id,
      sessionId: row.sessionId,
      status: row.status === 'READY' ? 'READY' : 'FAILED',
      core: row.coreJson as unknown as ResultCore,
      ...(row.storyProfileJson ? { storyProfile: row.storyProfileJson as unknown as StoryProfile } : {}),
      blocks: (row.texts[0]?.blocksJson ?? []) as unknown as NarrativeBlock[],
      ...(row.image ? { image: {
        sourceType: row.image.sourceType === 'AI' ? 'AI' : 'LIBRARY',
        uri: row.image.storageUrl,
        alt: row.image.altText,
        status: row.image.status === 'FALLBACK' ? 'FALLBACK' : 'READY',
        attemptCount: row.image.attemptCount,
        ...(row.image.errorCode ? { errorCode: row.image.errorCode } : {}),
      } satisfies StoredImage } : {}),
    };
  }
}
