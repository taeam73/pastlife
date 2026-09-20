import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { IMAGE_PROVIDER, type ImageProvider } from '../src/providers/image.provider.js';

describe('anonymous vertical flow', () => {
  let app!: INestApplication;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalUseInMemoryDb = process.env.USE_IN_MEMORY_DB;
  const originalUseMockGoogle = process.env.USE_MOCK_GOOGLE;

  beforeAll(async () => {
    process.env.USE_IN_MEMORY_DB = 'true';
    process.env.USE_MOCK_GOOGLE = 'true';
    delete process.env.DATABASE_URL;
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    if (originalUseInMemoryDb === undefined) delete process.env.USE_IN_MEMORY_DB;
    else process.env.USE_IN_MEMORY_DB = originalUseInMemoryDb;
    if (originalUseMockGoogle === undefined) delete process.env.USE_MOCK_GOOGLE;
    else process.env.USE_MOCK_GOOGLE = originalUseMockGoogle;
  });

  it('completes six stages, remains idempotent, and unlocks basic once', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/archive').expect(401);
    process.env.ADMIN_TOKEN = 'test-admin-token';
    await request(app.getHttpServer()).get('/api/v1/admin/content/summary').expect(401);
    await request(app.getHttpServer()).get('/api/v1/admin/content/summary').set('x-admin-token', 'test-admin-token').expect(200);
    delete process.env.ADMIN_TOKEN;
    await request(app.getHttpServer()).get('/api/v1/admin/content/summary').expect(200).expect(({ body }) => { expect(body.questions).toBe(36); expect(body.choices).toBe(216); });
    await request(app.getHttpServer()).get('/api/v1/admin/content/questions').expect(200).expect(({ body }) => expect(body.items).toHaveLength(36));
    await request(app.getHttpServer()).put('/api/v1/admin/content/questions/Q1_01/draft').send({ text: 'draft' }).expect(200);
    await request(app.getHttpServer()).get('/api/v1/admin/content/drafts').expect(200).expect(({ body }) => expect(body.items).toHaveLength(1));
    await request(app.getHttpServer()).post('/api/v1/admin/content/publish').send().expect(201).expect(({ body }) => expect(body.published).toBe(1));
    const history = await request(app.getHttpServer()).get('/api/v1/admin/content/publish-history').expect(200);
    expect(history.body.items[0].published).toBe(1);
    await request(app.getHttpServer()).post(`/api/v1/admin/content/rollback?digest=${history.body.items[0].digest}`).expect(201).expect(({ body }) => expect(body.restored).toBe(1));
    const created = await request(app.getHttpServer()).post('/api/v1/sessions').send({ locale: 'ko', deviceId: 'test-install-0001', preferredViewMode: 'VIDEO' }).expect(201);
    const sessionId = created.body.sessionId as string;
    expect(created.body.viewMode).toBe('TEXT');

    await request(app.getHttpServer()).patch(`/api/v1/sessions/${sessionId}/view-mode`).send({ viewMode: 'TEXT' }).expect(200).expect(({ body }) => expect(body.viewMode).toBe('TEXT'));
    await request(app.getHttpServer()).patch(`/api/v1/sessions/${sessionId}/view-mode`).send({ viewMode: 'VIDEO' }).expect(400).expect(({ body }) => expect(body.code).toBe('FEATURE_UNAVAILABLE'));

    const firstSessionQuestionIds: string[] = [];

    for (let stage = 1; stage <= 6; stage += 1) {
      const question = await request(app.getHttpServer()).get(`/api/v1/sessions/${sessionId}/questions/${stage}`).expect(200);
      const retry = await request(app.getHttpServer()).get(`/api/v1/sessions/${sessionId}/questions/${stage}`).expect(200);
      expect(retry.body.id).toBe(question.body.id);
      firstSessionQuestionIds.push(question.body.id);
      expect(question.body.choices).toHaveLength(6);
      await request(app.getHttpServer())
        .put(`/api/v1/sessions/${sessionId}/answers/${stage}`)
        .send({ questionId: question.body.id, choiceId: question.body.choices[0].id })
        .expect(200);
    }

    const completions = await Promise.all([1, 2, 3].map(() => request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/complete`).send().expect(202)));
    const resultIds = completions.map(({ body }) => body.resultId);
    expect(new Set(resultIds).size).toBe(1);
    const resultId = resultIds[0];

    const imageProvider = app.get<ImageProvider>(IMAGE_PROVIDER);
    const imageGeneration = vi.spyOn(imageProvider, 'getImage');
    await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/status`).expect(200).expect(({ body }) => {
      expect(body.status).toBe('RESULT_READY');
      expect(body.viewMode).toBe('TEXT');
      expect(body.imageStatus).toBe('FALLBACK');
    });
    expect(imageGeneration).toHaveBeenCalledTimes(1);
    await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/status`).expect(200).expect(({ body }) => {
      expect(body.imageStatus).toBe('FALLBACK');
    });
    expect(imageGeneration).toHaveBeenCalledTimes(1);
    await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/basic`).expect(403).expect(({ body }) => expect(body.slot).toBe(1));

    const providerEventId = `fake-ad-1-${sessionId}`;
    await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/ads/1/complete`).send({ providerEventId }).expect(201);
    await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/ads/1/complete`).send({ providerEventId }).expect(201);

    const basic = await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/basic`).expect(200);
    expect(basic.body).toMatchObject({
      resultId,
      image: { sourceType: 'LIBRARY', status: 'FALLBACK' },
    });
    expect(basic.body.blocks).toHaveLength(6);
    expect(basic.body.blocks.map(({ body }: { body: string }) => body).join('\n').length).toBeGreaterThanOrEqual(1_600);
    expect(basic.body.blocks[0].body).toContain(`당신의 ${basic.body.recordNo}번째 삶`);
    expect(basic.body.character.fictional).toBe(true);
    expect(basic.body.highlights).toHaveLength(8);
    expect(basic.body.recordNo).toBeGreaterThanOrEqual(1);
    expect(basic.body.disclaimer).toContain('창작 스토리텔링');

    await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/deep`).expect(403).expect(({ body }) => expect(body.slot).toBe(2));
    await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/ads/2/complete`).send({ providerEventId: `fake-ad-2-${sessionId}` }).expect(201);
    await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/ads/2/complete`).send({ providerEventId: `fake-ad-2-${sessionId}` }).expect(201);
    await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/deep`).expect(200).expect(({ body }) => expect(body.blocks).toHaveLength(4));
    await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/guide`).expect(403).expect(({ body }) => expect(body.slot).toBe(3));
    await request(app.getHttpServer()).post(`/api/v1/sessions/${sessionId}/ads/3/complete`).send({ providerEventId: `fake-ad-3-${sessionId}` }).expect(201);
    await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/guide`).expect(200).expect(({ body }) => expect(body.blocks).toHaveLength(4));
    const share = await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/share`).expect(200);
    expect(share.body.resultId).toBe(resultId);
    expect(share.body.shareToken).toHaveLength(24);
    expect(share.body.shareUrl).toContain(share.body.shareToken);
    const shareAgain = await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/share`).expect(200);
    expect(shareAgain.body.shareToken).toBe(share.body.shareToken);
    const imageShare = await request(app.getHttpServer()).post(`/api/v1/results/${resultId}/share-assets`).send({ type: 'IMAGE', locale: 'ko' }).expect(201);
    expect(imageShare.body.type).toBe('IMAGE');
    expect(imageShare.body.sourceImageUri).toBe(basic.body.image.uri);
    await request(app.getHttpServer()).post(`/api/v1/results/${resultId}/share-assets`).send({ type: 'VIDEO', locale: 'ko' }).expect(400).expect(({ body }) => expect(body.code).toBe('FEATURE_UNAVAILABLE'));

    const nextSession = await request(app.getHttpServer()).post('/api/v1/sessions').send({ locale: 'ko', deviceId: 'test-install-0001' }).expect(201);
    for (let stage = 1; stage <= 6; stage += 1) {
      const question = await request(app.getHttpServer()).get(`/api/v1/sessions/${nextSession.body.sessionId}/questions/${stage}`).expect(200);
      expect(question.body.id).not.toBe(firstSessionQuestionIds[stage - 1]);
    }
    const auth = await request(app.getHttpServer()).post('/api/v1/auth/google/exchange').send({ idToken: 'mock-google:test@example.com' }).expect(201);
    const repeatedAuth = await request(app.getHttpServer()).post('/api/v1/auth/google/exchange').send({ idToken: 'mock-google:test@example.com' }).expect(201);
    expect(repeatedAuth.body.user.id).toBe(auth.body.user.id);
    const bearer = { Authorization: `Bearer ${auth.body.accessToken}` };
    await request(app.getHttpServer()).post(`/api/v1/auth/archive/${resultId}`).set(bearer).expect(201);
    await request(app.getHttpServer()).get('/api/v1/auth/archive').set(bearer).expect(200).expect(({ body }) => expect(body.items[0].resultId).toBe(resultId));
    await request(app.getHttpServer()).get(`/api/v1/auth/archive/${resultId}`).set(bearer).expect(200).expect(({ body }) => {
      expect(body.resultId).toBe(resultId);
      expect(body.blocks).toHaveLength(6);
      expect(body.viewMode).toBe('TEXT');
    });
    const otherAuth = await request(app.getHttpServer()).post('/api/v1/auth/google/exchange').send({ idToken: 'mock-google:other@example.com' }).expect(201);
    await request(app.getHttpServer()).get(`/api/v1/auth/archive/${resultId}`).set({ Authorization: `Bearer ${otherAuth.body.accessToken}` }).expect(403);
    await request(app.getHttpServer()).delete(`/api/v1/auth/archive/${resultId}`).set(bearer).expect(204);
    await request(app.getHttpServer()).delete(`/api/v1/auth/archive/${resultId}`).set(bearer).expect(204);
    await request(app.getHttpServer()).get('/api/v1/auth/archive').set(bearer).expect(200).expect(({ body }) => expect(body.items).toHaveLength(0));
    await request(app.getHttpServer()).get(`/api/v1/auth/archive/${resultId}`).set(bearer).expect(403);
    await request(app.getHttpServer()).get(`/api/v1/results/${resultId}/basic`).expect(200);
  });
});
