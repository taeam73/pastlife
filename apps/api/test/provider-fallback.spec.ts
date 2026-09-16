import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { AiNarrativeProvider } from '../src/providers/ai-narrative.provider.js';
import { AiImageProvider } from '../src/providers/ai-image.provider.js';
import { TemplateNarrativeProvider } from '../src/providers/template-narrative.provider.js';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { S3StorageProvider } from '../src/providers/s3-storage.provider.js';
import type { ResultCore } from '@pastlife/scoring';
const fixture = { contentVersion: '2.0.0', answerHash: 'a', recordNo: 1, scores: { tags: {}, axes: {}, topTags: [] }, eraId: 'ERA_ANCIENT_CIV', regionId: 'REG_EAST_ASIA', locationId: 'LOC_MESOPOTAMIA', classId: 'CLASS_COMMON_LABOR', occupationId: 'OCC_01', personalityId: 'PERSON_ANALYTIC', relationshipId: 'REL_COMPANION', eventId: 'EVENT_01', lastMemoryId: 'MEM_RAIN', basicBlockIds: [], libraryImage: { key: 'ancient-east-asia', promptTags: [] } } as unknown as ResultCore;

describe('provider fallbacks', () => {
  beforeEach(() => { delete process.env.AI_TEXT_API_URL; delete process.env.AI_IMAGE_API_URL; });
  afterEach(() => { delete process.env.AI_TEXT_API_URL; delete process.env.AI_IMAGE_API_URL; });
  it('uses deterministic template text without an AI endpoint', async () => {
    const blocks = await new AiNarrativeProvider(new TemplateNarrativeProvider()).createBasic(fixture);
    expect(blocks).toHaveLength(7);
    expect(blocks.map((b) => b.id)).toEqual((await new TemplateNarrativeProvider().createBasic(fixture)).map((b) => b.id));
  });
  it('uses library image without an AI endpoint', async () => {
    const image = await new AiImageProvider(new LibraryImageProvider()).getImage(fixture);
    expect(image.sourceType).toBe('LIBRARY');
    expect(image.uri).toContain('asset://');
  });
  it('uploads objects to the configured S3-compatible endpoint', async () => {
    process.env.S3_ENDPOINT = 'http://minio:9000'; process.env.S3_BUCKET = 'pastlife-test';
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response(null, { status: 200 })) as typeof fetch;
    await expect(new S3StorageProvider().putObject('results/a.webp', new Uint8Array([1, 2]), 'image/webp')).resolves.toBe('http://minio:9000/pastlife-test/results/a.webp');
    globalThis.fetch = original; delete process.env.S3_ENDPOINT; delete process.env.S3_BUCKET;
  });
});
