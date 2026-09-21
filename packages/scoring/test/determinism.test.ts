import { describe, expect, it } from 'vitest';
import { findHistoricalSettingExpansion, historicalSettings } from '@pastlife/content';
import { answerHash, calculateResult } from '../src/index.js';
import { answersFor } from './fixtures.js';

describe('result determinism', () => {
  it('returns the same hash and result regardless of answer array order', () => {
    const answers = answersFor();
    const reversed = [...answers].reverse();
    expect(answerHash(answers)).toBe(answerHash(reversed));
    const first = calculateResult({ answers, sessionSeed: 'session-seed', contentVersion: '2.0.0' });
    const second = calculateResult({ answers: reversed, sessionSeed: 'session-seed', contentVersion: '2.0.0' });
    expect(second).toEqual(first);
    for (let index = 0; index < 100; index += 1) {
      expect(calculateResult({ answers, sessionSeed: 'session-seed', contentVersion: '2.0.0' })).toEqual(first);
    }
  });

  it('changes the hash when one answer changes', () => {
    const first = answersFor();
    const second = answersFor();
    const changed = second[0]!;
    const questionPrefix = changed.choiceId.slice(0, -1);
    second[0] = { ...changed, choiceId: `${questionPrefix}2` };
    expect(answerHash(first)).not.toBe(answerHash(second));
  });

  it('chooses only occupations allowed by the selected historical setting', () => {
    for (let choiceIndex = 0; choiceIndex < 6; choiceIndex += 1) {
      const result = calculateResult({ answers: answersFor(`v3-${choiceIndex}`, choiceIndex), sessionSeed: `v3-${choiceIndex}`, contentVersion: '3.0.0' });
      const setting = historicalSettings.find(({ id }) => id === result.locationId)!;
      expect(setting.occupationIds).toContain(result.occupationId);
      expect(findHistoricalSettingExpansion(setting.id)?.imageAssetKeys).toContain(result.libraryImage.key);
      expect(result.libraryImage.key).toMatch(/^library\/v4\/.+-(daily|work|turning)\.(webp|png)$/);
    }
  });
});
