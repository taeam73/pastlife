import { describe, expect, it } from 'vitest';
import { calculateScores } from '../src/index.js';
import { answersFor } from './fixtures.js';

describe('weighted scoring', () => {
  it('aggregates all six stages with published weights', () => {
    const scores = calculateScores(answersFor());
    expect(Object.values(scores.tags).some((value) => value > 0)).toBe(true);
    expect(scores.topTags).toHaveLength(4);
    expect(scores.topTags).toEqual([...scores.topTags].sort((left, right) => right.score - left.score || left.tag.localeCompare(right.tag)));
  });

  it('rejects duplicate or incomplete stages', () => {
    expect(() => calculateScores(answersFor().slice(0, 5))).toThrow(/six answers/i);
    const answers = answersFor();
    answers[5] = { ...answers[5]!, stage: 5 };
    expect(() => calculateScores(answers)).toThrow(/unique stage/i);
  });
});
