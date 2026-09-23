import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { historicalSettings } from '@pastlife/content';
import { selectDiverseLifeEvents, storyDiversityCounts } from '../src/providers/story-diversity-catalog.js';

const core = {
  answerHash: 'diversity-fixture', recordNo: 21,
  locationId: 'LOC_MESOPOTAMIA', occupationId: 'OCC_SCRIBE',
  personalityId: 'PERSON_ANALYTIC', relationshipId: 'REL_COMPANION',
  eventId: 'EVENT_01', lastMemoryId: 'MEM_RAIN',
} as ResultCore;

describe('story diversity catalog', () => {
  it('meets the configured doubled candidate targets', () => {
    expect(storyDiversityCounts()).toEqual({
      childhoodPerSetting: 48,
      workPerOccupation: 48,
      turningTypes: 64,
      variantsPerTurningType: 12,
      relationshipPerType: 16,
      costs: 16,
      aftermaths: 16,
    });
  });

  it('is deterministic, grounded, and does not repeat a theme inside one life', () => {
    const selected = selectDiverseLifeEvents(core);
    expect(selectDiverseLifeEvents(core)).toEqual(selected);
    expect(new Set([selected.childhood.theme, selected.work.theme, selected.turning.theme]).size).toBe(3);
    expect(JSON.stringify(selected)).toContain('수메르 도시 국가');
    expect(JSON.stringify(selected)).toContain('서기관');
    expect(JSON.stringify(selected)).not.toMatch(/undefined|배급 명단에서 한 사람의 이름이 빠진/);
  });

  it('produces broad visible variation across changed answers', () => {
    const samples = Array.from({ length: 1_000 }, (_, index) => selectDiverseLifeEvents({
      ...core,
      answerHash: `different-answers-${index}`,
      recordNo: (index % 99) + 1,
      eventId: `EVENT_0${(index % 8) + 1}`,
      relationshipId: ['REL_COMPANION', 'REL_FAMILY', 'REL_LOST_LOVE', 'REL_STUDENT'][index % 4]!,
    }));
    expect(new Set(samples.map(({ childhood }) => childhood.id)).size).toBeGreaterThanOrEqual(40);
    expect(new Set(samples.map(({ work }) => work.id)).size).toBeGreaterThanOrEqual(40);
    expect(new Set(samples.map(({ turning }) => turning.id)).size).toBeGreaterThanOrEqual(500);
  });

  it('builds complete, distinct stage events for every historical setting', () => {
    for (const [index, setting] of historicalSettings.entries()) {
      const selected = selectDiverseLifeEvents({
        ...core,
        answerHash: `setting-${setting.id}`,
        recordNo: (index % 99) + 1,
        locationId: setting.id,
        occupationId: setting.occupationIds[0]!,
      });
      const text = JSON.stringify(selected);
      expect(text).toContain(setting.label);
      expect(text).not.toMatch(/undefined|배급 명단에서 한 사람의 이름이 빠진/);
      expect(new Set([selected.childhood.theme, selected.work.theme, selected.turning.theme]).size).toBe(3);
    }
  });
});
