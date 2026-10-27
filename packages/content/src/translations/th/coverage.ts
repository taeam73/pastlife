import { findThaiStoryTranslation } from './catalog.js';
import { storyCards } from '../../story-catalog.js';
import type { StorySignal } from '../../types.js';

export function isThaiStorySignalReady(storyId: string, signal: StorySignal): boolean {
  const translated = findThaiStoryTranslation(storyId);
  return Boolean(translated?.card.title
    && translated.manuscript.identity.summary
    && translated.manuscript.identity.profilePages?.length
    && translated.manuscript.episode.beforeSignal
    && translated.manuscript.episode.signalMoments[signal]
    && translated.manuscript.episode.afterSignal
    && translated.manuscript.timeline.length
    && translated.manuscript.memories.length
    && translated.finalMoment.scene
    && translated.finalMoment.afterword
    && translated.finalMoment.artAlt);
}

export function isThaiStoryReady(storyId: string): boolean {
  const card = storyCards.find(({ id }) => id === storyId);
  return Boolean(card && card.signals.every((signal) => isThaiStorySignalReady(storyId, signal)));
}

export function thaiStoryTranslationCoverage() {
  const ready = storyCards.filter(({ id }) => isThaiStoryReady(id));
  return {
    totalStories: storyCards.length,
    readyStories: ready.length,
    totalSignalPaths: storyCards.reduce((sum, card) => sum + card.signals.length, 0),
    readySignalPaths: storyCards.reduce((sum, card) => sum + card.signals.filter((signal) => isThaiStorySignalReady(card.id, signal)).length, 0),
    readyStoryIds: ready.map(({ id }) => id),
  };
}
