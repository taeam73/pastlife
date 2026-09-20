import {
  eras,
  historicalLocations,
  lastMemories,
  lifeEvents,
  occupations,
  personalities,
  relationships,
  socialClasses,
} from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';

function catalogLabel(items: readonly { id: string; label: string }[], id: string) {
  return items.find((item) => item.id === id)?.label ?? id;
}

function safePromptTags(tags: readonly string[]) {
  return tags
    .slice(0, 12)
    .map((tag) => tag.replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().slice(0, 40))
    .filter(Boolean)
    .join(', ');
}

export function buildAiImagePrompt(core: ResultCore) {
  const tags = safePromptTags(core.libraryImage.promptTags);
  return [
    'Create one cinematic historical illustration for a fictional past-life result.',
    `Era: ${catalogLabel(eras, core.eraId)} (${core.eraId}).`,
    `Location: ${catalogLabel(historicalLocations, core.locationId)} (${core.locationId}); region ${core.regionId}.`,
    `Social class: ${catalogLabel(socialClasses, core.classId)} (${core.classId}).`,
    `Occupation: ${catalogLabel(occupations, core.occupationId)} (${core.occupationId}).`,
    `Personality: ${catalogLabel(personalities, core.personalityId)} (${core.personalityId}).`,
    `Relationship: ${catalogLabel(relationships, core.relationshipId)} (${core.relationshipId}).`,
    `Life event: ${catalogLabel(lifeEvents, core.eventId)} (${core.eventId}).`,
    `Last memory: ${catalogLabel(lastMemories, core.lastMemoryId)} (${core.lastMemoryId}).`,
    ...(tags ? [`Visual tags: ${tags}.`] : []),
    'Use restrained colors, period-appropriate clothing, tools, and surroundings, with a character-centered composition.',
    'No modern objects. No anachronistic clothing. No explicit violence or corpses. No real-person likeness. No ethnic or religious caricature. No sexualization.',
  ].join(' ');
}
