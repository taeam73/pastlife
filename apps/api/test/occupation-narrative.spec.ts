import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { buildCharacterIntroduction, describeOccupation } from '../src/providers/occupation-narrative.js';
import { buildStoryProfile } from '../src/providers/story-narrative.js';

const core = {
  answerHash: 'immersive-character-fixture',
  recordNo: 21,
  locationId: 'LOC_MESOPOTAMIA',
  occupationId: 'OCC_01',
  eventId: 'EVENT_01',
  relationshipId: 'REL_COMPANION',
  lastMemoryId: 'MEM_RAIN',
} as ResultCore;

describe('occupation and character narrative', () => {
  it('introduces the character through appearance, personality, work, preferences, talent, and dream', () => {
    const profile = buildStoryProfile(core);
    const occupation = describeOccupation(core);
    const introduction = buildCharacterIntroduction(profile, occupation);

    expect(occupation).toContain('서기관');
    expect(occupation).toContain('점토판');
    expect(introduction).toContain(profile.identity.name);
    expect(introduction).toContain(profile.identity.appearance);
    expect(introduction).toContain(profile.dailyLife.favoritePlace);
    expect(introduction).toContain(profile.dailyLife.favoriteFood);
    expect(introduction).toContain(profile.dailyLife.dream);
    expect(introduction).not.toMatch(/라은 사람들|나은 사람들|아은 사람들|야은 사람들|능력에 능했습니다|이었습니다이었습니다|것이라는 꿈/);
  });
});
