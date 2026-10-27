import { describe, expect, it } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { englishStoryTranslationCoverage, findEnglishStoryTranslation, storyCards } from '@pastlife/content';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { buildContentStoryResult } from '../src/results/story-result.js';

const core = {
  contentVersion: '3.0.0', storyId: 'CLOWN', storySignals: ['speak'], recordNo: 18,
} as unknown as ResultCore;

describe('English CLOWN preview', () => {
  it.each(['speak', 'connect', 'release'] as const)('contains no Korean for the %s signal and preserves chapter IDs', async (signal) => {
    const image = await new LibraryImageProvider().getImage(core);
    const result = buildContentStoryResult('english-clown', { ...core, storySignals: [signal] }, image, false, 'en');
    expect(result.presentation?.version).toBe(3);
    expect(result.presentation?.chapters.map((chapter) => chapter.id)).toEqual(['MEETING', 'TRIAL', 'CHOICE', 'NOW']);
    expect(JSON.stringify(result)).not.toMatch(/[가-힣]/u);
  });

  it('keeps the selected event distinct across signals', async () => {
    const image = await new LibraryImageProvider().getImage(core);
    const episodes = (['speak', 'connect', 'release'] as const).map((signal) => buildContentStoryResult(
      'english-clown', { ...core, storySignals: [signal] }, image, false, 'en',
    ).presentation?.chapters.find((chapter) => chapter.id === 'TRIAL')?.body);
    expect(new Set(episodes).size).toBe(3);
  });

  it('renders another story through the shared English catalog', async () => {
    const room = { ...core, storyId: 'ROOM7', storySignals: ['rest'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(room);
    const result = buildContentStoryResult('english-room7', room, image, false, 'en');
    expect(result.headline).toBe(findEnglishStoryTranslation('ROOM7')?.card.title);
    expect(result.presentation?.chapters.find((chapter) => chapter.id === 'TRIAL')?.body).toContain('Iru');
    expect(JSON.stringify(result)).not.toMatch(/[가-힣]/u);
  });

  it('renders every catalog story and all three selected paths without Korean text', async () => {
    const images = new LibraryImageProvider();
    for (const id of englishStoryTranslationCoverage().readyStoryIds) {
      const card = storyCards.find((entry) => entry.id === id)!;
      const storyCore = { ...core, storyId: id } as ResultCore;
      const image = await images.getImage(storyCore);
      for (const signal of card.signals) {
        const result = buildContentStoryResult(`english-${id}-${signal}`, { ...storyCore, storySignals: [signal] }, image, false, 'en');
        expect(JSON.stringify(result)).not.toMatch(/[가-힣]/u);
        expect(result.presentation?.chapters.find((chapter) => chapter.id === 'TRIAL')?.body).toContain(findEnglishStoryTranslation(id)?.manuscript.episode.signalMoments[signal]);
      }
    }
  });

  it('refuses an untranslated story', async () => {
    const missing = storyCards.find((card) => !findEnglishStoryTranslation(card.id));
    if (!missing) {
      expect(englishStoryTranslationCoverage().readyStories).toBe(120);
      return;
    }
    const image = await new LibraryImageProvider().getImage(core);
    expect(() => buildContentStoryResult('english-missing', { ...core, storyId: missing.id, storySignals: [missing.signals[0]!] }, image, false, 'en')).toThrow(/English preview unavailable/u);
  });
});
