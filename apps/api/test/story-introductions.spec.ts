import { describe, expect, it } from 'vitest';
import { findStoryManuscript, storyCards } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { buildContentStoryResult } from '../src/results/story-result.js';
import storyIntros from '../src/results/story-intros.json';

describe('chapter 01 introduction', () => {
  it('provides a concise introduction in every release language for all 120 stories', () => {
    expect(Object.keys(storyIntros)).toHaveLength(storyCards.length);
    for (const card of storyCards) {
      const entry = (storyIntros as Record<string, Record<string, { summary: string; hook: string }>>)[card.id];
      expect(entry, card.id).toBeDefined();
      for (const locale of ['ko', 'en', 'th', 'ja']) {
        expect(entry?.[locale]?.summary.trim(), `${card.id}/${locale} summary`).toBeTruthy();
        expect(entry?.[locale]?.hook.trim(), `${card.id}/${locale} hook`).toBeTruthy();
        if (locale !== 'ko') expect(`${entry?.[locale]?.summary} ${entry?.[locale]?.hook}`).not.toMatch(/[가-힣]/u);
      }
      expect(entry?.ko?.summary).toContain('당신');
      expect(entry?.en?.summary).toMatch(/\byou\b/iu);
      expect(entry?.th?.summary).toContain('คุณ');
      expect(entry?.ja?.summary).toContain('あなた');
    }
  });

  it('places the teaser before Halil’s profile without mixing it into PDF profile pages', async () => {
    const core = { contentVersion: '3.0.0', storyId: 'PIER_BEFORE_WORK', storySignals: ['notice'], recordNo: 68 } as unknown as ResultCore;
    const image = await new LibraryImageProvider().getImage(core);
    const originalPages = findStoryManuscript('PIER_BEFORE_WORK')!.identity.profilePages;
    for (const locale of ['ko', 'en', 'th', 'ja'] as const) {
      const result = buildContentStoryResult(`halil-${locale}`, core, image, false, locale);
      const chapter = result.presentation?.chapters[0];
      expect(chapter?.introPage?.summary).toBeTruthy();
      expect(chapter?.introPage?.invitation).toBeTruthy();
      expect(chapter?.profilePages).toHaveLength(originalPages?.length ?? 0);
      expect(chapter?.profilePages?.[0]?.title).not.toBe(chapter?.introPage?.title);
    }
  });
});
