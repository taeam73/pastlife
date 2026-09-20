import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { buildStoryNarrative, buildStoryProfile } from '../src/providers/story-narrative.js';

const core = {
  contentVersion: '2.5.0',
  answerHash: 'concrete-story-fixture',
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

describe('buildStoryNarrative', () => {
  it('builds a deterministic six-chapter lifetime around a complete character dossier', () => {
    const blocks = buildStoryNarrative(core);
    const fullStory = blocks.map(({ body }) => body).join('\n');

    expect(blocks.map(({ id }) => id)).toEqual([
      'LIFE_BIRTH',
      'LIFE_CHILDHOOD',
      'LIFE_YOUTH',
      'LIFE_MIDLIFE',
      'LIFE_LATER_YEARS',
      'LIFE_DEATH',
    ]);
    expect(fullStory.length).toBeGreaterThanOrEqual(1_600);
    expect(blocks.every(({ body }) => body.length >= 140 && body.length <= 1_000)).toBe(true);
    expect(fullStory).toContain('이제 기록의 먼지를 천천히 걷어 보겠습니다');
    expect(fullStory).toContain('그곳에서 당신은');
    expect(fullStory).toContain('가장 중요한 오랜 동료');
    expect(fullStory).toContain('동이 트기 전');
    expect(fullStory).toContain('서쪽 창고');
    expect(fullStory).toContain('금이 간 점토판');
    expect(fullStory).toContain('배급 명단을 꺼내 들었');
    expect(fullStory).toContain('곡물 배급 명단');
    expect(fullStory).toContain('사흘 뒤');
    expect(fullStory).toContain('열두 가구');
    expect(fullStory).not.toContain('밤바다');
    expect(fullStory).not.toMatch(/점토패을|동료을|수프을|신뢰이라|꾸러미이|빗소리이|것이라는 꿈/);
    expect(fullStory).not.toMatch(/실제로 살았|틀림없는 전생|확실한 전생/);
    expect(fullStory).not.toMatch(/사용자의 실제 정체성|창작 서사|창작 설정|서사용 이름|마지막 장의 제목|선택을 바탕으로/);
    expect(blocks.every(({ body }) => body.split('\n\n').length >= 4)).toBe(true);
    expect(buildStoryNarrative(core)).toEqual(blocks);

    const profile = buildStoryProfile(core);
    expect(profile.identity.fictional).toBe(true);
    expect(['여성', '남성']).toContain(profile.identity.gender);
    expect(profile.identity.name).not.toBe('');
    expect(profile.background.familyStructure).not.toBe('');
    expect(profile.innerLife.formativeWound).not.toBe('');
    expect(profile.dailyLife.hobby).not.toBe('');
    expect(profile.dailyLife.dream).not.toBe('');
    expect(profile.ending.category).not.toBe('');
    expect(profile.highlights).toHaveLength(8);
    expect(buildStoryProfile(core)).toEqual(profile);
  });

  it('changes scene details when the scored location and work change', () => {
    const oceanStory = buildStoryNarrative({
      ...core,
      eraId: 'ERA_AGE_OF_EXPLORATION',
      regionId: 'REG_SUBSAHARAN_AFRICA',
      locationId: 'LOC_SWASHILI',
      classId: 'CLASS_MERCHANT',
      occupationId: 'OCC_05',
      eventId: 'EVENT_05',
      lastMemoryId: 'MEM_SEA',
    } as ResultCore).map(({ body }) => body).join('\n');

    expect(oceanStory).toContain('산호석 부두');
    expect(oceanStory).toContain('매듭을 묶은 항해줄');
    expect(oceanStory).toContain('계절풍');
    expect(oceanStory).not.toContain('곡물 배급 명단');
  });

  it('creates varied but internally ordered character dossiers', () => {
    const profiles = Array.from({ length: 160 }, (_, index) => buildStoryProfile({
      ...core,
      answerHash: `character-${index}`,
      recordNo: (index % 99) + 1,
    }));

    expect(new Set(profiles.map(({ identity }) => `${identity.gender}:${identity.name}`)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(profiles.map(({ background }) => background.familyStructure)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(profiles.map(({ innerLife }) => innerLife.formativeWound)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(profiles.map(({ dailyLife }) => dailyLife.hobby)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(profiles.map(({ ending }) => ending.category)).size).toBeGreaterThanOrEqual(7);
    expect(profiles.every(({ timeline }) => timeline.every((entry, index) => index === 0 || entry.age >= timeline[index - 1]!.age))).toBe(true);
  });
});
