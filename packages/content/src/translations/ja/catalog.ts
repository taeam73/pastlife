import catalogJson from './catalog.json';
import type { StoryTextTranslation } from '../story-text.js';

type CatalogEntry = { sourceSha256: string; model: string; reviewStatus: 'draft'; translation: StoryTextTranslation };
const catalog = catalogJson as Record<string, CatalogEntry>;

export function findJapaneseStoryTranslation(storyId: string): StoryTextTranslation | undefined {
  return catalog[storyId]?.translation;
}

export function japaneseStoryDraftIds(): string[] { return Object.keys(catalog); }
