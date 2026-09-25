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
    const childhood = blocks.find(({ id }) => id === 'LIFE_CHILDHOOD')!;
    const profile = buildStoryProfile(core);
    expect(childhood.title).toBe('어린 시절 · 책임감을 배운 순간');
    expect(childhood.body).toContain('여덟 살 무렵');
    expect(childhood.body).toContain('당신은');
    expect(childhood.body).toContain('이 일을 겪은 뒤');
    expect(childhood.body).not.toContain(profile.innerLife.formativeWound);
    expect(childhood.body).not.toContain(profile.innerLife.coreFear);
    expect(childhood.body).not.toContain(profile.identity.stressResponse);
    expect(fullStory.length).toBeGreaterThanOrEqual(1_600);
    expect(blocks.every(({ body }) => body.length >= 140 && body.length <= 1_000)).toBe(true);
    expect(fullStory).not.toMatch(/즐겼습니다[.!]?\s*(을|를)\s*즐겼습니다/);
    expect(fullStory).not.toMatch(/했습니다[.!]?이었습니다/);
    expect(fullStory).toContain('당신의 17번째 삶입니다');
    expect(fullStory).toContain('전생 이름은');
    expect(fullStory).toContain('함께 일하던 동료와 가까워졌습니다');
    expect(fullStory).toContain('당신의 직업은 서기관이었습니다');
    expect(fullStory).toContain('이 경험은 잘못을 보았을 때 모른 척하지 않는 태도로 남았습니다');
    expect(fullStory).not.toContain('배급 명단에서 한 사람의 이름이 빠진');
    expect(fullStory).not.toContain('사건을 겪었습니다');
    expect((fullStory.match(/당신은 /g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(fullStory).not.toContain('밤바다');
    expect(fullStory).not.toMatch(/점토패을|동료을|수프을|신뢰이라|꾸러미이|빗소리이|것이라는 꿈|이었습니다\.는|능력 작은/);
    expect(fullStory).not.toMatch(/실제로 살았|틀림없는 전생|확실한 전생/);
    expect(fullStory).not.toContain('이 이야기는 실제 전생을 증명하는 기록이 아니라');
    expect(fullStory).not.toMatch(/사용자의 실제 정체성|창작 서사|창작 설정|서사용 이름|마지막 장의 제목|선택을 바탕으로/);
    expect(blocks.every(({ id, body }) => body.split('\n\n').length >= (id === 'LIFE_CHILDHOOD' ? 3 : 4))).toBe(true);
    expect(buildStoryNarrative(core)).toEqual(blocks);

    expect(fullStory).not.toContain(profile.identity.appearance);
    expect(fullStory).not.toContain(profile.dailyLife.hobby);
    expect(fullStory).not.toContain(profile.dailyLife.dream);
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

  it('keeps childhood chapters focused and free of fragment-like transitions across varied results', () => {
    const samples = Array.from({ length: 500 }, (_, index) => {
      const sampleCore = {
        ...core,
        answerHash: `readable-${index}`,
        recordNo: (index % 99) + 1,
      } as ResultCore;
      const profile = buildStoryProfile(sampleCore);
      const childhood = buildStoryNarrative(sampleCore).find(({ id }) => id === 'LIFE_CHILDHOOD')!;
      return { childhood, profile };
    });

    for (const { childhood, profile } of samples) {
      expect(childhood.body).not.toContain(profile.innerLife.formativeWound);
      expect(childhood.body).not.toContain(profile.innerLife.coreFear);
      expect(childhood.body).not.toContain(profile.identity.stressResponse);
      expect(childhood.body).not.toMatch(/이 일은 마음에 오래 남았습니다|힘들 때는|경험\.\s|두려움\.\s/);
      expect(childhood.body.split('\n\n')).toHaveLength(3);
    }
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

    expect(oceanStory).toContain('스와힐리 해안 도시권');
    expect(oceanStory).toContain('당신의 직업은 항해 길잡이였습니다');
    expect(oceanStory).toContain('계절풍');
    expect(oceanStory).not.toContain('곡물 배급 명단');
  });

  it('turns internal relationship labels and generic traits into a concrete youth story', () => {
    const youthStory = buildStoryNarrative({
      ...core,
      answerHash: 'textile-family-readable',
      occupationId: 'OCC_TEXTILE',
      relationshipId: 'REL_FAMILY',
    } as ResultCore).find(({ id }) => id === 'LIFE_YOUTH')!.body;

    expect(youthStory).toContain('당신의 직업은 직물 장인이었습니다');
    expect(youthStory).toContain('작은 색 차이와 반복되는 무늬');
    expect(youthStory).toContain('사람들이 입고 생활하는 데 필요한 천');
    expect(youthStory).toContain('가족은 당신이 지쳐 돌아온 날');
    expect(youthStory).not.toContain('끝까지 지키려 한 가족');
    expect(youthStory).not.toContain('이 시기에 가족을 만나');
    expect(youthStory).not.toContain('한 가족은');
    expect(youthStory).not.toContain('낯선 길에서도 방향과 반복되는 표식');
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
