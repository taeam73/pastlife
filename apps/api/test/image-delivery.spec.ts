import { describe, expect, it, vi } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import type { AssessmentRepository, StoredResult, StoredSession } from '../src/repositories/assessment.repository.js';
import type { ImageProvider } from '../src/providers/image.provider.js';
import type { ImageStorage } from '../src/providers/storage.provider.js';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { ResultsService } from '../src/results/results.service.js';

const core = {
  contentVersion: '2.5.0', answerHash: 'image-delivery',
  recordNo: 1,
  eraId: 'ERA_ANCIENT_CIV',
  regionId: 'REG_EAST_ASIA',
  locationId: 'LOC_MESOPOTAMIA',
  classId: 'CLASS_SCHOLAR',
  occupationId: 'OCC_01',
  personalityId: 'PERSON_ANALYTIC', relationshipId: 'REL_COMPANION', eventId: 'EVENT_01', lastMemoryId: 'MEM_RAIN',
  scores: { tags: {}, axes: {}, topTags: [] }, basicBlockIds: [],
  libraryImage: { key: 'ancient-east-asia', promptTags: [] },
} as unknown as ResultCore;

const result = {
  id: 'result-1',
  sessionId: 'session-1',
  status: 'READY',
  core,
  blocks: Array.from({ length: 6 }, (_, index) => ({ id: `block-${index}`, title: 'title', body: 'body' })),
  image: { sourceType: 'AI', uri: 's3://pastlife-private/results/hash.webp', alt: 'generated result', status: 'READY', attemptCount: 1 },
} satisfies StoredResult;

const session = { id: 'session-1', unlocks: ['BASIC'] } as StoredSession;

function createService(getDownloadUrl: ImageStorage['getDownloadUrl']) {
  const repository = {
    getResult: vi.fn(async () => structuredClone(result)),
    getSession: vi.fn(async () => structuredClone(session)),
  } as unknown as AssessmentRepository;
  const imageProvider = { getImage: vi.fn() } as unknown as ImageProvider;
  const storage = { putObject: vi.fn(), getDownloadUrl } as unknown as ImageStorage;
  return { service: new ResultsService(repository, imageProvider, storage, new LibraryImageProvider()), storage };
}

describe('private result image delivery', () => {
  it('replaces a stable S3 reference with a signed URL at response time', async () => {
    const { service, storage } = createService(vi.fn(async () => 'https://signed.invalid/results/hash.webp?X-Amz-Expires=900'));
    const response = await service.basic(result.id);
    expect(response.image.uri).toContain('https://signed.invalid/results/hash.webp');
    expect(storage.getDownloadUrl).toHaveBeenCalledWith('s3://pastlife-private/results/hash.webp');
    expect(result.image.uri).toBe('s3://pastlife-private/results/hash.webp');
  });

  it('uses the library image when signing fails', async () => {
    const { service } = createService(vi.fn(async () => { throw new Error('signing unavailable'); }));
    const response = await service.basic(result.id);
    expect(response.image.sourceType).toBe('LIBRARY');
    expect(response.image.uri).toContain('asset://');
  });
});
