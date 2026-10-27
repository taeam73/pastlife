import { describe, expect, it } from 'vitest';
import { localizeStoryQuestion, storyQuestions } from '../src/index.js';
import { japaneseStoryQuestionIds } from '../src/translations/ja/questions.js';

describe('Japanese story questions', () => {
  it('translates every question and choice without changing scoring IDs or signals', () => {
    expect(japaneseStoryQuestionIds).toHaveLength(24);
    for (const original of storyQuestions) {
      const translated = localizeStoryQuestion(original, 'ja');
      expect(translated.id).toBe(original.id);
      expect(translated.text).toMatch(/[ぁ-んァ-ン一-龥]/u);
      expect(translated.text).not.toMatch(/[가-힣]/u);
      expect(translated.choices).toHaveLength(6);
      translated.choices.forEach((choice, index) => {
        expect(choice.id).toBe(original.choices[index]?.id);
        expect(choice.storySignals).toEqual(original.choices[index]?.storySignals);
        expect(choice.text).not.toMatch(/[가-힣]/u);
      });
    }
  });
});
