import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import {
  STORY_EVENT_TAXONOMY,
  relationshipEventCounts,
  selectRelationshipEvent,
} from '../src/providers/story-event-catalog.js';
import { buildStoryNarrative } from '../src/providers/story-narrative.js';

const core = {
  answerHash: 'relationship-event-fixture',
  recordNo: 8,
  relationshipId: 'REL_COMPANION',
  eraId: 'ERA_ANCIENT_CIV',
  regionId: 'REG_EAST_ASIA',
  locationId: 'LOC_MESOPOTAMIA',
  classId: 'CLASS_SCHOLAR',
  occupationId: 'OCC_01',
  personalityId: 'PERSON_ANALYTIC',
  eventId: 'EVENT_01',
  lastMemoryId: 'MEM_RAIN',
  scores: { tags: {}, axes: {}, topTags: [] },
  basicBlockIds: [],
  libraryImage: { key: 'ancient-east-asia', promptTags: [] },
} as unknown as ResultCore;

describe('story event catalog', () => {
  it('organizes reusable event types by narrative category', () => {
    expect(STORY_EVENT_TAXONOMY.RELATIONSHIP).toEqual(expect.arrayContaining([
      'ENCOUNTER', 'LOVE', 'SEPARATION', 'CONFLICT', 'RIVALRY', 'RECONCILIATION', 'MENTORSHIP', 'ROLE_REVERSAL',
    ]));
    expect(STORY_EVENT_TAXONOMY.WORK).toEqual(expect.arrayContaining([
      'FAILURE', 'DISCOVERY', 'COMMISSION', 'CRAFT_CONFLICT', 'LEGACY',
    ]));
    expect(STORY_EVENT_TAXONOMY.COMMUNITY).toEqual(expect.arrayContaining([
      'DISASTER', 'SHORTAGE', 'MIGRATION', 'FESTIVAL', 'POWER_SHIFT', 'COLLECTIVE_DECISION',
    ]));
    expect(STORY_EVENT_TAXONOMY.JOURNEY).toEqual(expect.arrayContaining([
      'DEPARTURE', 'LOST_ROUTE', 'RESCUE', 'RETURN', 'EXPLORATION',
    ]));
    expect(STORY_EVENT_TAXONOMY.INNER).toEqual(expect.arrayContaining([
      'PROMISE', 'SECRET', 'REGRET', 'MORAL_DILEMMA', 'REDEMPTION',
    ]));
  });

  it('selects the same relationship episode for the same scored result', () => {
    expect(selectRelationshipEvent(core)).toEqual(selectRelationshipEvent(core));
  });

  it('offers eight authored variants for every relationship type', () => {
    expect(relationshipEventCounts()).toEqual({
      REL_COMPANION: 8,
      REL_FAMILY: 8,
      REL_LOST_LOVE: 8,
      REL_STUDENT: 8,
    });
  });

  it('weaves the selected relationship episode into the concrete location incident', () => {
    const relationshipEvent = selectRelationshipEvent(core);
    const story = buildStoryNarrative(core).map(({ body }) => body).join('\n');

    expect(story).toContain(relationshipEvent.setup);
    expect(story).toContain(relationshipEvent.otherAction);
    expect(story).toContain(relationshipEvent.aftermath);
  });
});
