import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AiNarrativeProvider } from '../src/providers/ai-narrative.provider.js';
import { AiImageProvider } from '../src/providers/ai-image.provider.js';
import { TemplateNarrativeProvider } from '../src/providers/template-narrative.provider.js';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { S3StorageProvider } from '../src/providers/s3-storage.provider.js';
import { buildAiImagePrompt } from '../src/providers/ai-image-request.js';
import type { ImageStorage } from '../src/providers/storage.provider.js';
import type { ResultCore } from '@pastlife/scoring';
const fixture = { contentVersion: '2.0.0', answerHash: 'a', recordNo: 1, scores: { tags: {}, axes: {}, topTags: [] }, eraId: 'ERA_ANCIENT_CIV', regionId: 'REG_EAST_ASIA', locationId: 'LOC_MESOPOTAMIA', classId: 'CLASS_COMMON_LABOR', occupationId: 'OCC_01', personalityId: 'PERSON_ANALYTIC', relationshipId: 'REL_COMPANION', eventId: 'EVENT_01', lastMemoryId: 'MEM_RAIN', basicBlockIds: [], libraryImage: { key: 'ancient-east-asia', promptTags: [] } } as unknown as ResultCore;
const createStorage = (): ImageStorage => ({
  putObject: vi.fn(async (key: string) => `s3://pastlife-test/${key}`),
  getDownloadUrl: vi.fn(async (reference: string) => reference.replace('s3://pastlife-test/', 'https://signed.invalid/')),
});

describe('provider fallbacks', () => {
  beforeEach(() => { delete process.env.AI_TEXT_API_URL; delete process.env.AI_IMAGE_API_URL; });
  afterEach(() => { delete process.env.AI_TEXT_API_URL; delete process.env.AI_IMAGE_API_URL; });
  it('uses deterministic template text without an AI endpoint', async () => {
    const provider = new AiNarrativeProvider(new TemplateNarrativeProvider());
    const story = await provider.createBasic(fixture);
    expect(story.blocks).toHaveLength(6);
    expect(story.blocks.map((b) => b.id)).toEqual([
      'LIFE_BIRTH', 'LIFE_CHILDHOOD', 'LIFE_YOUTH', 'LIFE_MIDLIFE', 'LIFE_LATER_YEARS', 'LIFE_DEATH',
    ]);
    expect(story.blocks.map(({ body }) => body).join('\n').length).toBeGreaterThanOrEqual(1_600);
    expect(story.blocks[0]?.body).toContain('당신의 1번째 삶');
    expect(story.blocks.map(({ body }) => body).join(' ')).toContain('고대 문명기');
    expect(story.blocks.map(({ body }) => body).join(' ')).toContain('수메르 도시 국가');
    expect(story.blocks.map(({ body }) => body).join(' ')).toContain('서기관');
    expect(story.blocks.map(({ body }) => body).join(' ')).toContain('오랜 동료');
    expect(story.storyProfile.identity.fictional).toBe(true);
    expect(story.storyProfile.highlights).toHaveLength(8);
    expect(await provider.createBasic(fixture)).toEqual(story);
  });
  it('rejects short AI prose and returns the complete deterministic story', async () => {
    process.env.AI_TEXT_API_URL = 'https://text.invalid/generate';
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify({
      blocks: [
        'LIFE_BIRTH', 'LIFE_CHILDHOOD', 'LIFE_YOUTH', 'LIFE_MIDLIFE', 'LIFE_LATER_YEARS', 'LIFE_DEATH',
      ].map((id) => ({ id, title: id, body: '너무 짧은 설명입니다.' })),
    }), { status: 200 })) as typeof fetch;
    try {
      const story = await new AiNarrativeProvider(new TemplateNarrativeProvider()).createBasic(fixture);
      expect(story.blocks.map(({ body }) => body).join('\n').length).toBeGreaterThanOrEqual(1_600);
      expect(story.blocks[0]?.title).toBe('탄생 · 세상에 처음 닿은 날');
    } finally {
      globalThis.fetch = original;
    }
  });
  it('asks the AI endpoint for a concrete episode in a calm sage narrator voice', async () => {
    process.env.AI_TEXT_API_URL = 'https://text.invalid/generate';
    const original = globalThis.fetch;
    let requestBody: Record<string, unknown> | undefined;
    globalThis.fetch = (async (_input, init) => {
      requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response(null, { status: 503 });
    }) as typeof fetch;
    try {
      await new AiNarrativeProvider(new TemplateNarrativeProvider()).createBasic(fixture);
      expect(requestBody).toMatchObject({
        narrator: {
          role: 'a calm master sage reading an old record directly to the user',
          stance: 'immersive but never claim the story is factual or supernatural truth',
        },
        format: {
          minTotalCharacters: 1_600,
          minChapterCharacters: 140,
          maxChapterCharacters: 1_000,
        },
        requiredSceneElements: [
          'time cue',
          'specific place within the historical location',
          'physical object handled by the protagonist',
          'observable action by the scored relationship',
          'choice with an immediate cost',
          'later consequence with a count or measurable change',
        ],
        eventTaxonomy: {
          RELATIONSHIP: expect.arrayContaining(['LOVE', 'SEPARATION', 'CONFLICT', 'RIVALRY']),
          WORK: expect.arrayContaining(['FAILURE', 'DISCOVERY']),
          COMMUNITY: expect.arrayContaining(['DISASTER', 'SHORTAGE']),
          JOURNEY: expect.arrayContaining(['DEPARTURE', 'RESCUE']),
          INNER: expect.arrayContaining(['PROMISE', 'REGRET']),
        },
        selectedRelationshipEvent: {
          type: expect.any(String),
          title: expect.any(String),
          setup: expect.any(String),
          otherAction: expect.any(String),
          aftermath: expect.any(String),
        },
      });
      expect(requestBody?.constraints).toEqual(expect.arrayContaining([
        'show one connected incident across daily, relationship, event, and last-memory chapters',
        'use concrete actions and sensory details instead of abstract personality summaries',
        'address the user with the warm authority of a wise storyteller',
      ]));
    } finally {
      globalThis.fetch = original;
    }
  });
  it('uses library image without an AI endpoint', async () => {
    const image = await new AiImageProvider(new LibraryImageProvider(), createStorage()).getImage(fixture);
    expect(image.sourceType).toBe('LIBRARY');
    expect(image.uri).toContain('asset://');
  });
  it('builds a deterministic, safety-bounded historical image prompt', () => {
    const promptCore = { ...fixture, libraryImage: { key: 'ancient-east-asia', promptTags: ['rain', 'scribe'] } };
    const prompt = buildAiImagePrompt(promptCore);
    expect(buildAiImagePrompt(promptCore)).toBe(prompt);
    expect(prompt).toContain('ERA_ANCIENT_CIV');
    expect(prompt).toContain('LOC_MESOPOTAMIA');
    expect(prompt).toContain('OCC_01');
    expect(prompt).toContain('rain, scribe');
    expect(prompt).toContain('cinematic historical illustration');
    expect(prompt).toContain('No modern objects');
    expect(prompt).toContain('No real-person likeness');
  });
  it('requests exactly one low-quality AI image', async () => {
    process.env.AI_IMAGE_API_URL = 'https://images.invalid/generate';
    const original = globalThis.fetch;
    const storage = createStorage();
    let requestBody: unknown;
    let requestSignal: AbortSignal | null | undefined;
    globalThis.fetch = (async (input, init) => {
      if (String(input) === process.env.AI_IMAGE_API_URL) {
        requestBody = JSON.parse(String(init?.body));
        requestSignal = init?.signal;
        return new Response(JSON.stringify({ uri: 'https://images.invalid/result.webp', alt: 'generated result' }), { status: 200 });
      }
      return new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'Content-Type': 'image/webp' } });
    }) as typeof fetch;
    try {
      const image = await new AiImageProvider(new LibraryImageProvider(), storage).getImage(fixture);
      expect(requestBody).toMatchObject({
        n: 1,
        quality: 'low',
        idempotencyKey: fixture.answerHash,
        version: '2.5.0',
        prompt: expect.stringContaining('cinematic historical illustration'),
      });
      expect(requestSignal).toBeInstanceOf(AbortSignal);
      expect(image.sourceType).toBe('AI');
      expect(image.uri).toBe('s3://pastlife-test/results/a.webp');
      expect(image.attemptCount).toBe(1);
      expect(storage.putObject).toHaveBeenCalledWith('results/a.webp', new Uint8Array([1, 2, 3]), 'image/webp');
    } finally {
      globalThis.fetch = original;
    }
  });
  it('rejects malformed AI image responses before using the library fallback', async () => {
    process.env.AI_IMAGE_API_URL = 'https://images.invalid/generate';
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response(JSON.stringify(calls === 1
        ? { uri: 'javascript:alert(1)', alt: 'unsafe URI' }
        : { uri: 'https://images.invalid/result.webp', alt: '' }), { status: 200 });
    }) as typeof fetch;
    try {
      const image = await new AiImageProvider(new LibraryImageProvider(), createStorage()).getImage(fixture);
      expect(calls).toBe(2);
      expect(image.sourceType).toBe('LIBRARY');
      expect(image.errorCode).toBe('IMAGE_GENERATION_FAILED');
    } finally {
      globalThis.fetch = original;
    }
  });
  it('rejects non-image downloads before using the library fallback', async () => {
    process.env.AI_IMAGE_API_URL = 'https://images.invalid/generate';
    const original = globalThis.fetch;
    const storage = createStorage();
    let calls = 0;
    globalThis.fetch = (async (input) => {
      calls += 1;
      if (String(input) === process.env.AI_IMAGE_API_URL) return new Response(JSON.stringify({ uri: 'https://images.invalid/result.webp', alt: 'generated result' }), { status: 200 });
      return new Response('not an image', { status: 200, headers: { 'Content-Type': 'text/html' } });
    }) as typeof fetch;
    try {
      const image = await new AiImageProvider(new LibraryImageProvider(), storage).getImage(fixture);
      expect(calls).toBe(4);
      expect(storage.putObject).not.toHaveBeenCalled();
      expect(image.sourceType).toBe('LIBRARY');
      expect(image.errorCode).toBe('IMAGE_GENERATION_FAILED');
    } finally {
      globalThis.fetch = original;
    }
  });
  it('retries storage failures once before using the library fallback', async () => {
    process.env.AI_IMAGE_API_URL = 'https://images.invalid/generate';
    const original = globalThis.fetch;
    const storage = createStorage();
    vi.mocked(storage.putObject).mockRejectedValue(new Error('storage unavailable'));
    let calls = 0;
    globalThis.fetch = (async (input) => {
      calls += 1;
      if (String(input) === process.env.AI_IMAGE_API_URL) return new Response(JSON.stringify({ uri: 'https://images.invalid/result.webp', alt: 'generated result' }), { status: 200 });
      return new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'Content-Type': 'image/webp' } });
    }) as typeof fetch;
    try {
      const image = await new AiImageProvider(new LibraryImageProvider(), storage).getImage(fixture);
      expect(calls).toBe(4);
      expect(storage.putObject).toHaveBeenCalledTimes(2);
      expect(image.sourceType).toBe('LIBRARY');
      expect(image.errorCode).toBe('IMAGE_GENERATION_FAILED');
    } finally {
      globalThis.fetch = original;
    }
  });
  it('retries image generation once before using the library fallback', async () => {
    process.env.AI_IMAGE_API_URL = 'https://images.invalid/generate';
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => { calls += 1; return new Response(null, { status: 503 }); }) as typeof fetch;
    try {
      const image = await new AiImageProvider(new LibraryImageProvider(), createStorage()).getImage(fixture);
      expect(calls).toBe(2);
      expect(image.sourceType).toBe('LIBRARY');
      expect(image.status).toBe('FALLBACK');
      expect(image.errorCode).toBe('IMAGE_GENERATION_FAILED');
    } finally {
      globalThis.fetch = original;
    }
  });
  it('stores stable S3 references and creates 15-minute signed download URLs', async () => {
    Object.assign(process.env, {
      S3_ENDPOINT: 'http://minio:9000',
      S3_REGION: 'us-east-1',
      S3_BUCKET: 'pastlife-test',
      S3_ACCESS_KEY: 'test-access-key',
      S3_SECRET_KEY: 'test-secret-key',
    });
    const send = vi.spyOn(S3Client.prototype, 'send').mockResolvedValue({} as never);
    try {
      const storage = new S3StorageProvider();
      const reference = await storage.putObject('results/a.webp', new Uint8Array([1, 2]), 'image/webp');
      expect(reference).toBe('s3://pastlife-test/results/a.webp');
      expect(send.mock.calls[0]?.[0]).toBeInstanceOf(PutObjectCommand);
      send.mockRestore();
      const signed = new URL(await storage.getDownloadUrl(reference));
      expect(signed.searchParams.get('X-Amz-Expires')).toBe('900');
      expect(signed.pathname).toContain('/pastlife-test/results/a.webp');
    } finally {
      send.mockRestore();
      for (const key of ['S3_ENDPOINT', 'S3_REGION', 'S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY']) delete process.env[key];
    }
  });
});
