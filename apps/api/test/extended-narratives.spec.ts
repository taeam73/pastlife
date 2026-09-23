import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { buildDeepNarrative, buildPresentGuideNarrative } from '../src/providers/extended-narratives.js';
import { buildStoryProfile } from '../src/providers/story-narrative.js';

const core = {
  contentVersion: '2.5.0',
  answerHash: 'extended-narrative-fixture',
  recordNo: 17,
  scores: { tags: {}, axes: {}, topTags: [] },
  eraId: 'ERA_ANCIENT_CIV',
  regionId: 'REG_EAST_ASIA',
  locationId: 'LOC_MESOPOTAMIA',
  classId: 'CLASS_SCHOLAR',
  occupationId: 'OCC_01',
  personalityId: 'PERSON_ANALYTIC',
  relationshipId: 'REL_COMPANION',
  eventId: 'EVENT_01',
  lastMemoryId: 'MEM_RAIN',
  basicBlockIds: [],
  libraryImage: { key: 'ancient-east-asia', promptTags: [] },
} as unknown as ResultCore;

function expectWebNovelShape(blocks: Array<{ title: string; body: string }>) {
  expect(blocks).toHaveLength(4);
  expect(blocks.every(({ title }) => title.length >= 4)).toBe(true);
  expect(blocks.every(({ body }) => body.split('\n\n').length >= 3)).toBe(true);
  expect(blocks.every(({ body }) => body.length >= 250)).toBe(true);
  expect(blocks.map(({ body }) => body).join('\n').length).toBeGreaterThanOrEqual(1_200);
}

describe('extended web-novel narratives', () => {
  it('builds four personalized deep-story chapters', () => {
    const profile = buildStoryProfile(core);
    const blocks = buildDeepNarrative(core, profile);
    const fullStory = blocks.map(({ body }) => body).join('\n');

    expectWebNovelShape(blocks);
    expect(fullStory).toContain(profile.identity.name);
    expect(fullStory).toContain('오랜 동료');
    expect(fullStory).toContain(profile.innerLife.deepestPain);
    expect(buildDeepNarrative(core, profile)).toEqual(blocks);
  });

  it('builds four present-day story chapters with optional, concrete actions', () => {
    const profile = buildStoryProfile(core);
    const blocks = buildPresentGuideNarrative(core, profile);
    const fullStory = blocks.map(({ body }) => body).join('\n');

    expectWebNovelShape(blocks);
    expect(fullStory).toContain('오늘');
    expect(fullStory).toContain('해볼 수 있어요');
    expect(fullStory).toContain(profile.identity.name);
    expect(fullStory).not.toContain('이 이야기가 지금의 당신을 단정하는 것은 아닙니다');
    expect(fullStory).not.toMatch(/반드시|틀림없이|미래에는/);
    expect(buildPresentGuideNarrative(core, profile)).toEqual(blocks);
  });
});
