import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BasicResultResponseSchema, ExtendedResultResponseSchema, FinalMomentReadResponseSchema, QuestionResponseSchema, StoryFinalMomentResponseSchema } from '@pastlife/contracts';
import { storyCards, storyFinalMoments, findStoryManuscript } from '@pastlife/content';
import { AppModule } from '../src/app.module.js';
import { storyImageAssets } from '../src/providers/library-image.provider.js';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../src/repositories/assessment.repository.js';

describe('story-first content 3.0 vertical flow', () => {
  let app!: INestApplication;
  const original = {
    databaseUrl: process.env.DATABASE_URL,
    memory: process.env.USE_IN_MEMORY_DB,
    version: process.env.CONTENT_VERSION,
    mockGoogle: process.env.USE_MOCK_GOOGLE,
  };

  beforeAll(async () => {
    process.env.USE_IN_MEMORY_DB = 'true';
    process.env.USE_MOCK_GOOGLE = 'true';
    process.env.CONTENT_VERSION = '3.0.0';
    delete process.env.DATABASE_URL;
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    for (const [key, value] of Object.entries({ DATABASE_URL: original.databaseUrl, USE_IN_MEMORY_DB: original.memory,
      CONTENT_VERSION: original.version, USE_MOCK_GOOGLE: original.mockGoogle })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });

  it('shows new questions and one coherent story throughout the result', async () => {
    const summary = await request(app.getHttpServer()).get('/api/v1/admin/content/summary').expect(200);
    expect(summary.body).toMatchObject({ contentVersion: '3.0.0', questions: 24, choices: 144 });

    const created = await request(app.getHttpServer()).post('/api/v1/sessions').send({ locale: 'ko' }).expect(201);
    expect(created.body.contentVersion).toBe('3.0.0');
    const sessionId = created.body.sessionId as string;
    for (let stage = 1; stage <= 6; stage += 1) {
      const question = await request(app.getHttpServer()).get(`/api/v1/sessions/${sessionId}/questions/${stage}`).expect(200);
      expect(() => QuestionResponseSchema.parse(question.body)).not.toThrow();
      expect(question.body.id).toMatch(/^SQ/);
      expect(question.body.choices).toHaveLength(6);
      await request(app.getHttpServer()).put(`/api/v1/sessions/${sessionId}/answers/${stage}`)
        .send({ questionId: question.body.id, choiceId: question.body.choices[stage === 1 ? 4 : stage === 2 ? 5 : stage % 6].id }).expect(200);
    }
    const completion = await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/complete`).send().expect(202);
    const resultId = completion.body.resultId as string;
    await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/ads/1/complete`).send({ providerEventId: `fake-ad-1-story-${sessionId}` }).expect(201);
    const basic = await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/basic`).expect(200);
    expect(() => BasicResultResponseSchema.parse(basic.body)).not.toThrow();
    expect(basic.body.character.occupation).not.toBe('');
    expect(basic.body.character.name).not.toBe('이야기 속 당신');
    expect(basic.body.character.favoritePlace).not.toBe('');
    expect(basic.body.presentation.hero.lifeSummary).toContain(basic.body.character.name);
    expect(basic.body.presentation.hero.lifeSummary).toContain(basic.body.character.favoritePlace);
    const matchedCard = storyCards.find((card) => card.name === basic.body.character.name);
    expect(matchedCard).toBeDefined();
    const manuscript = findStoryManuscript(matchedCard!.id)!;
    expect(basic.body.character.gender).toBe(manuscript.identity.gender === '성별 없음' ? null : manuscript.identity.gender);
    expect(basic.body.lifeSummary.ageAtDeath).toBe(manuscript.identity.ageAtDeath);
    expect(basic.body.presentation.chapters).toHaveLength(4);
    expect(basic.body.presentation.chapters.map((chapter: { title: string }) => chapter.title)).toEqual(['전생의 나', '에피소드', '삶의 기록', '전생의 기억']);
    expect(basic.body.presentation.chapters[1].body.length).toBeGreaterThan(550);
    expect(basic.body.presentation.chapters.every((chapter: { body: string }) => chapter.body.trim().length > 0)).toBe(true);
    expect(basic.body.blocks).toHaveLength(6);
    expect(basic.body.blocks.every((block: { body: string }) => block.body.trim().length > 0)).toBe(true);
    expect(basic.body.disclaimer).toContain('상상으로 엮은');
    const art = storyImageAssets[matchedCard!.id];
    expect(art).toBeDefined();
    expect(basic.body.image.layers).toHaveLength(2);
    expect(basic.body.image.uri).toBe(art!.backgroundUri);
    expect(basic.body.presentation.hero.characterUri).toBe(art!.characterUri);
    const visible = [basic.body.headline, ...basic.body.blocks.map((block: { body: string }) => block.body)].join(' ');
    expect(visible).not.toMatch(/메소포타미아|서아프리카|사용자의 실제 정체성|당신은 실제로/);

    await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/ads/2/complete`).send({ providerEventId: `fake-ad-2-story-${sessionId}` }).expect(201);
    const deep = await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/deep`).expect(200);
    expect(() => ExtendedResultResponseSchema.parse(deep.body)).not.toThrow();
    await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/ads/3/complete`).send({ providerEventId: `fake-ad-3-story-${sessionId}` }).expect(201);
    const guide = await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/guide`).expect(200);
    expect(() => ExtendedResultResponseSchema.parse(guide.body)).not.toThrow();

    const repository = app.get<AssessmentRepository>(ASSESSMENT_REPOSITORY);
    const sourceResult = await repository.getResult(resultId);
    expect(sourceResult).toBeDefined();
    const finalSessionId = `final-moment-${sessionId}`;
    const finalResultId = `final-moment-${resultId}`;
    await repository.createSession({ id: finalSessionId, anonymousId: 'final-moment-test', locale: 'ko', seed: 'final-moment-test', contentVersion: '3.0.0', status: 'RESULT_READY', viewMode: 'TEXT', expiresAt: new Date(Date.now() + 60000) });
    await repository.saveResult({ ...sourceResult!, id: finalResultId, sessionId: finalSessionId, core: { ...sourceResult!.core, storyId: 'NIGER_SANDBAR' } });
    await request(app.getHttpServer()).post(`/api/v1/sessions/${finalSessionId}/ads/1/complete`).send({ providerEventId: `fake-ad-1-${finalSessionId}` }).expect(201);
    await request(app.getHttpServer()).get(`/api/v1/results/${finalResultId}/final-moment`).expect(403).expect(({ body }) => expect(body.slot).toBe(2));
    await request(app.getHttpServer()).post(`/api/v1/results/${finalResultId}/final-moment/read`).expect(403);
    await request(app.getHttpServer()).post(`/api/v1/sessions/${finalSessionId}/ads/2/complete`).send({ providerEventId: `fake-ad-2-${finalSessionId}` }).expect(201);
    const finalMoment = await request(app.getHttpServer()).get(`/api/v1/results/${finalResultId}/final-moment`).expect(200);
    expect(() => StoryFinalMomentResponseSchema.parse(finalMoment.body)).not.toThrow();
    expect(finalMoment.body.storyId).toBe('NIGER_SANDBAR');
    expect(finalMoment.body.scene).toContain('사리');
    expect(finalMoment.body.afterword).toContain('전생록');
    expect(finalMoment.body.illustration.uri).toContain('niger-sandbar-final-moment');
    await request(app.getHttpServer()).post(`/api/v1/results/${finalResultId}/share-assets`).send({ type: 'IMAGE', locale: 'ko' }).expect(403).expect(({ body }) => expect(body.code).toBe('FINAL_MOMENT_REQUIRED'));
    const beforeRead = await request(app.getHttpServer()).get(`/api/v1/results/${finalResultId}/basic`).expect(200);
    expect(beforeRead.body.finalMomentRead).toBe(false);
    expect(beforeRead.body.finalMomentAvailable).toBe(true);
    const read = await request(app.getHttpServer()).post(`/api/v1/results/${finalResultId}/final-moment/read`).expect(201);
    expect(() => FinalMomentReadResponseSchema.parse(read.body)).not.toThrow();
    const readAgain = await request(app.getHttpServer()).post(`/api/v1/results/${finalResultId}/final-moment/read`).expect(201);
    expect(readAgain.body.readAt).toBe(read.body.readAt);
    const afterRead = await request(app.getHttpServer()).get(`/api/v1/results/${finalResultId}/basic`).expect(200);
    expect(afterRead.body.finalMomentRead).toBe(true);
    await request(app.getHttpServer()).post(`/api/v1/results/${finalResultId}/share-assets`).send({ type: 'IMAGE', locale: 'ko' }).expect(201);

    for (const [index, moment] of storyFinalMoments.entries()) {
      if (moment.storyId === 'NIGER_SANDBAR') continue;
      const catalogSessionId = `final-catalog-session-${index}`;
      const catalogResultId = `final-catalog-result-${index}`;
      await repository.createSession({ id: catalogSessionId, anonymousId: 'final-catalog-test', locale: 'ko', seed: 'final-catalog-test', contentVersion: '3.0.0', status: 'RESULT_READY', viewMode: 'TEXT', expiresAt: new Date(Date.now() + 60000) });
      await repository.saveResult({ ...sourceResult!, id: catalogResultId, sessionId: catalogSessionId, core: { ...sourceResult!.core, storyId: moment.storyId } });
      await request(app.getHttpServer()).post(`/api/v1/sessions/${catalogSessionId}/ads/1/complete`).send({ providerEventId: `fake-ad-1-${catalogSessionId}` }).expect(201);
      await request(app.getHttpServer()).post(`/api/v1/sessions/${catalogSessionId}/ads/2/complete`).send({ providerEventId: `fake-ad-2-${catalogSessionId}` }).expect(201);
      const response = await request(app.getHttpServer()).get(`/api/v1/results/${catalogResultId}/final-moment`).expect(200);
      expect(StoryFinalMomentResponseSchema.parse(response.body).storyId).toBe(moment.storyId);
      expect(response.body.illustration.uri).toBe(moment.artUri);
    }

    const auth = await request(app.getHttpServer()).post('/api/v1/auth/google/exchange').send({ idToken: 'mock-google:story-reader@example.com' }).expect(201);
    const bearer = { Authorization: `Bearer ${auth.body.accessToken}` };
    await request(app.getHttpServer()).post(`/api/v1/auth/archive/${resultId}`).set(bearer).expect(201);
    const archive = await request(app.getHttpServer()).get('/api/v1/auth/archive').set(bearer).expect(200);
    expect(archive.body.items[0].headline).toBe(basic.body.headline);
    const archivedDetail = await request(app.getHttpServer()).get(`/api/v1/auth/archive/${resultId}`).set(bearer).expect(200);
    expect(archivedDetail.body.headline).toBe(basic.body.headline);
  });
});
