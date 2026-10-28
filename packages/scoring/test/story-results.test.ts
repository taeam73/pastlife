import { describe, expect, it } from 'vitest';
import { findStoryCard, selectQuestion, storyCards } from '@pastlife/content';
import { calculateResult } from '../src/index.js';

function answersFor(seed: string, offset: number) {
  return ([1, 2, 3, 4, 5, 6] as const).map((stage) => {
    const question = selectQuestion({ stage, sessionSeed: seed, contentVersion: '3.0.0', excludedQuestionIds: [] });
    return { stage, questionId: question.id, choiceId: question.choices[(stage + Math.floor(offset / 6 ** (stage - 1))) % 6]!.id };
  });
}

describe('story-first result matching', () => {
  it('is stable and only attaches a card with a visible answer signal', () => {
    const answers = answersFor('reader-one', 2);
    const first = calculateResult({ answers, sessionSeed: 'reader-one', contentVersion: '3.0.0' });
    const repeated = calculateResult({ answers: [...answers].reverse(), sessionSeed: 'reader-one', contentVersion: '3.0.0' });
    expect(repeated).toEqual(first);
    const card = findStoryCard(first.storyId!);
    expect(card).toBeDefined();
    expect(card!.signals.some((signal) => first.storySignals?.includes(signal))).toBe(true);
  });

  it('keeps the non-human surprise scarce across varied routes', () => {
    const chosen = Array.from({ length: 4096 }, (_, index) => {
      const seed = `reader-${index}`;
      return calculateResult({ answers: answersFor(seed, index), sessionSeed: seed, contentVersion: '3.0.0' }).storyId!;
    });
    const rareCount = chosen.filter((id) => findStoryCard(id)?.rare).length;
    expect(storyCards.filter((card) => card.rare)).toHaveLength(1);
    expect(rareCount).toBeGreaterThan(0);
    expect(rareCount).toBeLessThanOrEqual(208);
    expect(new Set(chosen.filter((id) => !findStoryCard(id)?.rare))).toEqual(new Set(storyCards.filter((card) => !card.rare).map((card) => card.id)));
  });

  it('rejects legacy questions in a new-version result', () => {
    const answers = answersFor('reader-two', 1);
    answers[0] = { stage: 1, questionId: 'Q1_01', choiceId: 'Q1_01_C1' };
    expect(() => calculateResult({ answers, sessionSeed: 'reader-two', contentVersion: '3.0.0' })).toThrow('story-first questions');
  });

  it('avoids a recent story only when a fresh card has equal best affinity', () => {
    let tiedCase: ReturnType<typeof calculateResult> | undefined;
    let tiedAnswers: ReturnType<typeof answersFor> | undefined;
    let uniqueCase: ReturnType<typeof calculateResult> | undefined;
    let uniqueAnswers: ReturnType<typeof answersFor> | undefined;
    for (let index = 0; index < 4096 && (!tiedCase || !uniqueCase); index++) {
      const answers = answersFor(`history-${index}`, index);
      const result = calculateResult({ answers, sessionSeed: `history-${index}`, contentVersion: '3.0.0' });
      if (findStoryCard(result.storyId!)?.rare) continue;
      const scores = storyCards.filter((card) => !card.rare).map((card) => ({
        id: card.id,
        score: card.signals.reduce((total, signal) => total + Math.min(2, result.storySignals!.filter((item) => item === signal).length), 0),
      }));
      const best = Math.max(...scores.map(({ score }) => score));
      const bestIds = scores.filter(({ score }) => score === best).map(({ id }) => id);
      if (bestIds.includes(result.storyId!) && bestIds.length > 1 && !tiedCase) { tiedCase = result; tiedAnswers = answers; }
      if (bestIds.length === 1 && bestIds[0] === result.storyId && !uniqueCase) { uniqueCase = result; uniqueAnswers = answers; }
    }
    expect(tiedCase).toBeDefined();
    expect(uniqueCase).toBeDefined();
    const changed = calculateResult({ answers: tiedAnswers!, sessionSeed: 'same', contentVersion: '3.0.0', recentStoryIds: [tiedCase!.storyId!] });
    expect(changed.storyId).not.toBe(tiedCase!.storyId);
    expect(calculateResult({ answers: uniqueAnswers!, sessionSeed: 'same', contentVersion: '3.0.0', recentStoryIds: [uniqueCase!.storyId!] }).storyId).toBe(uniqueCase!.storyId);
  });
});
