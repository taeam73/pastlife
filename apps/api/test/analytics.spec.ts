import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { AnalyticsService } from '../src/analytics/analytics.service.js';

describe('analytics ingestion', () => {
  let app!: INestApplication;
  let analytics!: AnalyticsService;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalUseInMemoryDb = process.env.USE_IN_MEMORY_DB;

  beforeAll(async () => {
    process.env.USE_IN_MEMORY_DB = 'true';
    delete process.env.DATABASE_URL;
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    analytics = module.get(AnalyticsService);
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    if (originalUseInMemoryDb === undefined) delete process.env.USE_IN_MEMORY_DB;
    else process.env.USE_IN_MEMORY_DB = originalUseInMemoryDb;
  });

  it('accepts allowlisted identifiers without storing free text', async () => {
    const before = analytics.countForTesting();
    const response = await request(app.getHttpServer()).post('/api/v1/analytics/events').send({
      name: 'question_shown',
      metadata: { sessionId: '3d594650-3436-4929-8758-8bde924568e6', questionId: 'Q1_01', stage: 1, platform: 'web' },
    }).expect(201);
    expect(response.body).toMatchObject({ accepted: true });
    expect(response.body.eventId).toMatch(/^[0-9a-f-]{36}$/);
    expect(analytics.countForTesting()).toBe(before + 1);
  });

  it('rejects unknown events and arbitrary metadata', async () => {
    await request(app.getHttpServer()).post('/api/v1/analytics/events').send({ name: 'unknown_event', metadata: {} }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/analytics/events').send({ name: 'answer_selected', metadata: { answerText: 'private response' } }).expect(400);
  });
});
