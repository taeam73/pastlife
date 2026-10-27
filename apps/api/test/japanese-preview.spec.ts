import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { findJapaneseStoryTranslation, japaneseStoryTranslationCoverage, storyCards } from '@pastlife/content';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { buildContentStoryResult } from '../src/results/story-result.js';

const core = { contentVersion: '3.0.0', storyId: 'CLOWN', storySignals: ['speak'], recordNo: 18 } as unknown as ResultCore;

describe('Japanese stories', () => {
  it('renders every packaged story and selected signal path without Korean text', async () => {
    const images = new LibraryImageProvider();
    expect(japaneseStoryTranslationCoverage().readyStories).toBe(120);
    expect(japaneseStoryTranslationCoverage().readySignalPaths).toBe(360);
    for (const id of japaneseStoryTranslationCoverage().readyStoryIds) {
      const card = storyCards.find((entry) => entry.id === id)!;
      const storyCore = { ...core, storyId: id } as ResultCore;
      const image = await images.getImage(storyCore);
      for (const signal of card.signals) {
        const result = buildContentStoryResult(`japanese-${id}-${signal}`, { ...storyCore, storySignals: [signal] }, image, false, 'ja');
        expect(JSON.stringify(result)).not.toMatch(/[가-힣]/u);
        expect(result.presentation?.chapters.find((chapter) => chapter.id === 'TRIAL')?.body).toContain(findJapaneseStoryTranslation(id)?.manuscript.episode.signalMoments[signal]);
      }
    }
  });
});
