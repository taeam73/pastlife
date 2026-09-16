import { describe, expect, it } from 'vitest';

import { axes, questions, questionsByStage, tags } from '../src/index.js';

describe('canonical content', () => {
  it('contains the exact question and choice counts with unique IDs', () => {
    expect(questions).toHaveLength(36);
    expect(new Set(questions.map((question) => question.id)).size).toBe(36);
    expect(questions.every((question) => question.choices.length === 6)).toBe(true);
    expect(new Set(questions.flatMap((question) => question.choices.map((choice) => choice.id))).size).toBe(216);
  });

  it('keeps scores within the published domains', () => {
    expect(tags).toHaveLength(18);
    expect(axes).toHaveLength(6);
    expect(questions.every((question) => question.choices.every((choice) => choice.tagScores.length >= 2))).toBe(true);
    expect(questions.every((question) => question.choices.every((choice) => choice.tagScores.every((score) => score.score >= 1 && score.score <= 3)))).toBe(true);
    expect(questions.every((question) => question.choices.every((choice) => choice.axisScores.every((score) => score.score >= -2 && score.score <= 2)))).toBe(true);
  });

  it('selects the same stage question for the same seed and version', () => {
    const first = questionsByStage(3, 'seed-42', '2.0.0');
    const second = questionsByStage(3, 'seed-42', '2.0.0');
    expect(first.id).toBe(second.id);
    expect(first.stage).toBe(3);
  });
});
