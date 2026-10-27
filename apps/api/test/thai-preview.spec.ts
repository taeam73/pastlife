import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { findThaiStoryTranslation, storyCards, thaiStoryTranslationCoverage } from '@pastlife/content';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { buildContentStoryResult } from '../src/results/story-result.js';

const core = { contentVersion: '3.0.0', storyId: 'CLOWN', storySignals: ['speak'], recordNo: 18 } as unknown as ResultCore;

describe('Thai CLOWN preview', () => {
  it.each(['speak', 'connect', 'release'] as const)('localizes the %s signal without Korean', async (signal) => {
    const image = await new LibraryImageProvider().getImage(core);
    const result = buildContentStoryResult('thai-clown', { ...core, storySignals: [signal] }, image, false, 'th');
    expect(result.presentation?.version).toBe(3);
    expect(result.presentation?.chapters.map((chapter) => chapter.id)).toEqual(['MEETING', 'TRIAL', 'CHOICE', 'NOW']);
    expect(JSON.stringify(result)).not.toMatch(/[가-힣]/u);
  });

  it('renders every packaged Thai story and selected signal path', async () => {
    const images = new LibraryImageProvider();
    expect(thaiStoryTranslationCoverage().readyStories).toBe(120);
    expect(thaiStoryTranslationCoverage().readySignalPaths).toBe(360);
    for (const id of thaiStoryTranslationCoverage().readyStoryIds) {
      const card = storyCards.find((entry) => entry.id === id)!;
      const storyCore = { ...core, storyId: id } as ResultCore;
      const image = await images.getImage(storyCore);
      for (const signal of card.signals) {
        const result = buildContentStoryResult(`thai-${id}-${signal}`, { ...storyCore, storySignals: [signal] }, image, false, 'th');
        expect(JSON.stringify(result)).not.toMatch(/[가-힣]/u);
        expect(result.presentation?.chapters.find((chapter) => chapter.id === 'TRIAL')?.body).toContain(findThaiStoryTranslation(id)?.manuscript.episode.signalMoments[signal]);
      }
    }
  });
});
