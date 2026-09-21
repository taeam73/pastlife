import { describe, expect, it } from 'vitest';
import { historicalOccupations, historicalSettings, historicalSettingExpansions, validateHistoricalContent } from '../src/index.js';

describe('historical production content', () => {
  it('contains at least 16 settings and 32 valid setting/occupation combinations', () => {
    expect(historicalSettings.length).toBeGreaterThanOrEqual(16);
    expect(historicalSettings.reduce((sum, item) => sum + item.occupationIds.length, 0)).toBeGreaterThanOrEqual(32);
  });

  it('covers every launch region and avoids one-to-one job locking', () => {
    expect(new Set(historicalSettings.map(({ regionId }) => regionId)).size).toBeGreaterThanOrEqual(8);
    expect(historicalSettings.every(({ occupationIds }) => occupationIds.length >= 2)).toBe(true);
    const reusedJobs = historicalOccupations.filter(({ id }) => historicalSettings.filter(({ occupationIds }) => occupationIds.includes(id)).length >= 2);
    expect(reusedJobs.length).toBeGreaterThanOrEqual(8);
  });

  it('has no structural or editorial validation issues', () => {
    expect(validateHistoricalContent(historicalSettings, historicalOccupations)).toEqual([]);
  });

  it('has three images and setting-specific narrative depth per setting', () => {
    expect(historicalSettingExpansions).toHaveLength(historicalSettings.length);
    expect(historicalSettingExpansions.every(({ imageAssetKeys }) => imageAssetKeys.length === 3)).toBe(true);
    expect(historicalSettingExpansions.every(({ workEpisodes }) => workEpisodes.length >= 4)).toBe(true);
    expect(historicalSettingExpansions.every(({ lifeEvents }) => lifeEvents.length >= 4)).toBe(true);
    expect(new Set(historicalSettingExpansions.flatMap(({ imageAssetKeys }) => imageAssetKeys)).size).toBeGreaterThanOrEqual(48);
  });
});
