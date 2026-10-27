import { describe, expect, it } from 'vitest';
import { englishStoryQuestionIds, localizeStoryQuestion, storyQuestions } from '../src/index.js';

describe('English story questions', () => {
  it('covers all 24 prompts and 144 choices while keeping scoring IDs and signals', () => {
    expect(englishStoryQuestionIds).toHaveLength(24);
    for (const question of storyQuestions) {
      const english = localizeStoryQuestion(question, 'en');
      expect(english.text).toMatch(/[A-Za-z]/);
      expect(english.text).not.toMatch(/[가-힣]/);
      expect(english.id).toBe(question.id);
      expect(english.choices).toHaveLength(6);
      english.choices.forEach((choice, index) => {
        expect(choice.text).not.toMatch(/[가-힣]/);
        expect(choice.id).toBe(question.choices[index]?.id);
        expect(choice.storySignals).toEqual(question.choices[index]?.storySignals);
        expect(choice.tagScores).toEqual(question.choices[index]?.tagScores);
      });
    }
  });
});
