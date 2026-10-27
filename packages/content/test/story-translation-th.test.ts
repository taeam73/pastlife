import { describe, expect, it } from 'vitest';
import { clownThai, clownThaiEpisode, clownThaiFinalMoment, renderClownThaiEpisode } from '../src/translations/th/CLOWN.js';
import { thaiStoryTranslationCoverage } from '../src/translations/th/coverage.js';
import { findThaiStoryTranslation, thaiStoryDraftIds } from '../src/translations/th/catalog.js';
import { storyCards } from '../src/story-catalog.js';
import { localizeStoryQuestion, storyQuestions, thaiStoryQuestionIds } from '../src/index.js';

describe('Thai preview coverage', () => {
  it('has a complete manuscript for every packaged story and signal path', () => {
    const coverage = thaiStoryTranslationCoverage();
    expect(coverage.totalStories).toBe(120);
    expect(coverage.totalSignalPaths).toBe(360);
    expect(coverage.readyStories).toBe(thaiStoryDraftIds().length);
    expect(coverage.readySignalPaths).toBe(coverage.readyStories * 3);
    for (const id of coverage.readyStoryIds) {
      const story = findThaiStoryTranslation(id)!;
      const card = storyCards.find((entry) => entry.id === id)!;
      expect(Object.keys(story.manuscript.episode.signalMoments).sort()).toEqual([...card.signals].sort());
      expect(JSON.stringify(story)).not.toMatch(/[가-힣]/u);
    }
    expect(renderClownThaiEpisode('speak')).toBe(clownThai.episode);
    expect(clownThaiFinalMoment.scene.length).toBeGreaterThan(100);
    expect(JSON.stringify({ clownThai, clownThaiEpisode, clownThaiFinalMoment })).not.toMatch(/[가-힣]/u);
  });

  it('translates every question and choice without changing scoring IDs', () => {
    expect(thaiStoryQuestionIds).toHaveLength(24);
    for (const question of storyQuestions) {
      const thai = localizeStoryQuestion(question, 'th');
      expect(thai.text).toMatch(/[ก-๙]/u);
      expect(thai.text).not.toMatch(/[가-힣]/u);
      expect(thai.id).toBe(question.id);
      expect(thai.choices).toHaveLength(6);
      thai.choices.forEach((choice, index) => {
        expect(choice.text).toMatch(/[ก-๙]/u);
        expect(choice.text).not.toMatch(/[가-힣]/u);
        expect(choice.id).toBe(question.choices[index]?.id);
        expect(choice.storySignals).toEqual(question.choices[index]?.storySignals);
        expect(choice.tagScores).toEqual(question.choices[index]?.tagScores);
      });
    }
  });
});
