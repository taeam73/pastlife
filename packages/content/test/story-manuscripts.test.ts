import { describe, expect, it } from 'vitest';
import { storyCards } from '../src/story-catalog.js';
import { renderStoryEpisode, storyManuscripts } from '../src/story-manuscripts.js';
import { replacedTwentiethCenturyIds } from '../src/story-replacements-20c.js';

describe('complete story manuscripts', () => {
  const signedYear = (value: string) => {
    const year = Number(value.match(/\d+/u)?.[0]);
    return value.includes('기원전') ? -year : year;
  };
  it('covers every selectable life with four distinct sections and every answer branch', () => {
    expect(storyManuscripts).toHaveLength(storyCards.length);
    expect(new Set(storyManuscripts.map(({ id }) => id)).size).toBe(storyCards.length);
    for (const card of storyCards) {
      const manuscript = storyManuscripts.find(({ id }) => id === card.id);
      expect(manuscript, card.id).toBeDefined();
      if (!manuscript) continue;
      expect(manuscript.identity.era).toBeTruthy();
      expect(manuscript.identity.region).toBeTruthy();
      expect(manuscript.identity.region, `${card.id} should name the place shown on its first card`).toContain(card.home);
      expect(manuscript.identity.birthYear).toBeTruthy();
      expect(manuscript.identity.deathYear).toBeTruthy();
      expect(manuscript.identity.summary).toBeTruthy();
      if (manuscript.identity.ageAtDeath !== null) {
        const birth = signedYear(manuscript.identity.birthYear);
        const death = signedYear(manuscript.identity.deathYear);
        const beforeBirthday = card.id === 'FIRST_FLIGHT_CAMERA' ? 1 : 0;
        expect(death - birth - beforeBirthday, card.id).toBe(manuscript.identity.ageAtDeath);
      }
      expect(manuscript.timeline.length, card.id).toBeGreaterThanOrEqual(6);
      expect(manuscript.timeline[0]?.event, card.id).toMatch(/출생|형성/u);
      expect(manuscript.timeline.at(-1)?.event, card.id).toMatch(/생을 마침|갈라짐|죽음/u);
      expect(manuscript.memories.length, card.id).toBeGreaterThanOrEqual(5);
      expect(manuscript.memories.some(({ label }) => label.includes('평가')), card.id).toBe(true);
      expect(manuscript.memories.some(({ label }) => label.includes('말')), card.id).toBe(true);
      for (const signal of card.signals) {
        const episode = renderStoryEpisode(manuscript, signal);
        const minimumEpisodeLength = replacedTwentiethCenturyIds.has(card.id) ? 380 : 550;
        expect(episode.length, `${card.id}/${signal}`).toBeGreaterThan(minimumEpisodeLength);
        if (replacedTwentiethCenturyIds.has(card.id)) {
          expect(card.name.split(' ').some((part) => episode.includes(part)), `${card.id}/${signal}`).toBe(true);
        } else {
          expect(episode, `${card.id}/${signal}`).toContain(card.name);
        }
        expect(episode.split('\n\n').length, `${card.id}/${signal}`).toBeGreaterThanOrEqual(4);
      }
    }
  });
  it('keeps documented setting-register ages consistent with the episode year', () => {
    const ages: Record<string, [number, number]> = {
      WINDMILL: [40, 49], HEAVY_BOX: [30, 34], GRAVITY_SEEDS: [70, 79],
      APOLOGY_COURIER: [19, 19], PAID_LOSS: [50, 59], WARM_STONES: [20, 29],
      GYEONGSEONG_SHEARS: [40, 49], MOON_SIGNAL_WINDOW: [32, 32],
      THIRD_KNOCK: [30, 39], TIDE_MARK: [60, 69], MARKET_CAT_LOT: [40, 49],
      TWELVE_LEFT_SHOES: [39, 39], RAIN_GUTTER: [52, 52], UNSEEN_PORTRAIT: [64, 64], RUNAWAY_WHALE_FLOAT: [43, 43], CROOKED_KITE: [19, 19], HOLLOW_STAGE_WALL: [37, 37], TWO_FINAL_FERRIES: [46, 46], FLOATING_ORCHARD: [33, 33], SILVER_REED_MONSTER: [47, 47], GOLDEN_LIE_SLIP: [42, 42],
    };
    for (const [id, [minimum, maximum]] of Object.entries(ages)) {
      const card = storyCards.find((item) => item.id === id)!;
      const manuscript = storyManuscripts.find((item) => item.id === id)!;
      const year = Number(card.setting!.year.match(/\d+/u)![0]);
      const birth = Number(manuscript.identity.birthYear.match(/\d+/u)![0]);
      expect(year - birth, id).toBeGreaterThanOrEqual(minimum);
      expect(year - birth, id).toBeLessThanOrEqual(maximum);
      const death = Number(manuscript.identity.deathYear.match(/\d+/u)![0]);
      expect(death - birth, id).toBe(manuscript.identity.ageAtDeath);
    }
  });
});
