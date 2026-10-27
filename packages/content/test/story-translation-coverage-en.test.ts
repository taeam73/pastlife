import { describe, expect, it } from 'vitest';
import { clownEnglish, clownEnglishEpisode, clownEnglishFinalMoment, renderClownEnglishEpisode } from '../src/translations/en/CLOWN.js';
import { storyCards } from '../src/story-catalog.js';
import { englishStoryDraftIds, findEnglishStoryTranslation } from '../src/translations/en/catalog.js';
import { englishStoryTranslationCoverage, isEnglishStoryReady } from '../src/translations/en/coverage.js';

describe('English story translation coverage', () => {
  it('counts the complete story and every selectable event path', () => {
    const coverage = englishStoryTranslationCoverage();
    expect(coverage.totalStories).toBe(120);
    expect(coverage.totalSignalPaths).toBe(360);
    expect(coverage.readyStories).toBe(englishStoryDraftIds().length);
    expect(coverage.readySignalPaths).toBe(coverage.readyStories * 3);
    expect(coverage.readyStoryIds).toContain('CLOWN');
    expect([...(storyCards.find(({ id }) => id === 'CLOWN')?.signals ?? [])].sort()).toEqual(Object.keys(clownEnglishEpisode.signalMoments).sort());
    for (const id of coverage.readyStoryIds) {
      const story = findEnglishStoryTranslation(id);
      const card = storyCards.find((entry) => entry.id === id);
      expect(story).toBeTruthy();
      expect(Object.keys(story!.manuscript.episode.signalMoments).sort()).toEqual([...(card?.signals ?? [])].sort());
      expect(isEnglishStoryReady(id)).toBe(true);
      expect(JSON.stringify(story)).not.toMatch(/[가-힣]/u);
    }
  });

  it('keeps every translated field in English', () => {
    expect(JSON.stringify({ clownEnglish, clownEnglishEpisode, clownEnglishFinalMoment })).not.toMatch(/[가-힣]/u);
    for (const part of [clownEnglishEpisode.beforeSignal, clownEnglishEpisode.afterSignal, ...Object.values(clownEnglishEpisode.signalMoments)]) {
      expect(part.trim().length).toBeGreaterThan(0);
    }
    expect(renderClownEnglishEpisode('speak')).toBe(clownEnglish.episode);
  });
});
