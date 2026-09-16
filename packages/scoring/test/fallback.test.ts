import { describe, expect, it } from 'vitest';
import { historicalLocations, occupations, type Candidate } from '@pastlife/content';
import { calculateResult, pickCandidate } from '../src/index.js';
import { answersFor } from './fixtures.js';

describe('compatibility and fallback', () => {
  it('returns an explicitly marked fallback when the primary set is empty', () => {
    const fallback: Candidate = { id: 'fallback', label: 'fallback', affinityTags: [], fallback: true };
    expect(pickCandidate([], {}, 'seed', [fallback])).toEqual(fallback);
  });

  it.each([0, 5])('keeps extreme answer set %s historically compatible', (choiceIndex) => {
    const result = calculateResult({ answers: answersFor('session-seed', choiceIndex), sessionSeed: 'session-seed', contentVersion: '2.0.0' });
    const location = historicalLocations.find(({ id }) => id === result.locationId)!;
    const occupation = occupations.find(({ id }) => id === result.occupationId)!;
    expect(location.eraId).toBe(result.eraId);
    expect(location.regionId).toBe(result.regionId);
    expect(occupation.allowedEraIds).toContain(result.eraId);
    expect(occupation.allowedLocationIds).toContain(result.locationId);
  });
});
