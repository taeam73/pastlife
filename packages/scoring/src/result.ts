import {
  basicTemplates,
  eras,
  historicalLocations,
  lastMemories,
  lifeEvents,
  occupations,
  personalities,
  regions,
  relationships,
  historicalSettings,
  findHistoricalSettingExpansion,
  findChoice,
  storyCards,
  type StorySignal,
} from '@pastlife/content';
import { answerHash, canonicalAnswers, hashText } from './hash.js';
import { pickCandidate } from './filter.js';
import { calculateScores } from './score.js';
import { deterministicIndex } from './prng.js';
import type { CalculateResultInput, ResultCore } from './types.js';

export function calculateResult({ answers, contentVersion, recentStoryIds = [] }: CalculateResultInput): ResultCore {
  if (contentVersion.startsWith('3.') && answers.some(({ questionId }) => !questionId.startsWith('SQ'))) {
    throw new Error('Content 3.x results require story-first questions');
  }
  const digest = answerHash(answers);
  const seed = `${digest}:${contentVersion}`;
  const scores = calculateScores(answers);
  const storySignals = contentVersion.startsWith('3.')
    ? canonicalAnswers(answers).flatMap(({ questionId, choiceId }) => findChoice(questionId, choiceId)?.storySignals ?? [])
    : [];
  const signalCount = (signal: StorySignal) => storySignals.filter((value) => value === signal).length;
  // The rare, non-human card needs an unusually close match and a stable gate.
  // A general preference for quiet or release alone is not enough.
  const rareGate = Number.parseInt(hashText(`${seed}:rare`).slice(0, 8), 16) % 20 === 0;
  const rareCard = rareGate ? storyCards.find((card) => card.rare && card.signals.every((signal) => signalCount(signal) > 0)) : undefined;
  const affinities = storyCards.filter((card) => !card.rare).map((card) => ({ card, score: card.signals.reduce((total, signal) => total + Math.min(2, signalCount(signal)), 0) }));
  const maxAffinity = Math.max(...affinities.map(({ score }) => score));
  const closeMatches = affinities.filter(({ score }) => score > 0 && score >= maxAffinity - 1).sort((a, b) => a.card.id.localeCompare(b.card.id));
  let storyId = contentVersion.startsWith('3.')
    ? rareCard?.id ?? closeMatches[Number.parseInt(hashText(`${seed}:story-pick`).slice(0, 8), 16) % closeMatches.length]?.card.id
    : undefined;
  if (storyId && !rareCard && recentStoryIds.includes(storyId)) {
    const freshBest = affinities
      .filter(({ card, score }) => score === maxAffinity && !recentStoryIds.includes(card.id))
      .sort((left, right) => left.card.id.localeCompare(right.card.id));
    if (freshBest.length > 0) {
      storyId = freshBest[Number.parseInt(hashText(`${seed}:fresh-story-pick`).slice(0, 8), 16) % freshBest.length]!.card.id;
    }
  }
  if (contentVersion.startsWith('3.') && !storyId) throw new Error('No story card matched the answers');

  const location = pickCandidate(historicalLocations, scores.tags, `${seed}:location`, historicalLocations);
  const era = eras.find(({ id }) => id === location.eraId);
  const region = regions.find(({ id }) => id === location.regionId);
  if (!era || !region) throw new Error(`Location ${location.id} has an invalid era or region`);

  const compatibleOccupations = occupations.filter(
    ({ allowedEraIds, allowedLocationIds }) => allowedEraIds.includes(era.id) && allowedLocationIds.includes(location.id),
  );
  const occupation = pickCandidate(compatibleOccupations, scores.tags, `${seed}:occupation`, occupations);
  const personality = pickCandidate(personalities, scores.tags, `${seed}:personality`);
  const relationship = pickCandidate(relationships, scores.tags, `${seed}:relationship`);
  const event = pickCandidate(lifeEvents, scores.tags, `${seed}:event`);
  const lastMemory = pickCandidate(lastMemories, scores.tags, `${seed}:last-memory`);
  const setting = historicalSettings.find(({ id }) => id === location.id);
  const settingExpansion = findHistoricalSettingExpansion(location.id);
  const imageKeys = settingExpansion
    ? [...settingExpansion.imageAssetKeys, ...(settingExpansion.additionalImageAssetKeys ?? [])]
    : [setting?.visual.fallbackAssetKey ?? `library/${location.id.toLowerCase()}.jpg`];
  const imageKey = imageKeys[deterministicIndex(`${seed}:${occupation.id}:library-image`, imageKeys.length)]!;

  return {
    ...(storyId ? { storyId, storySignals } : {}),
    contentVersion,
    answerHash: digest,
    recordNo: (Number.parseInt(hashText(digest).slice(0, 8), 16) % 99) + 1,
    scores,
    eraId: era.id,
    regionId: region.id,
    locationId: location.id,
    classId: occupation.classId,
    occupationId: occupation.id,
    personalityId: personality.id,
    relationshipId: relationship.id,
    eventId: event.id,
    lastMemoryId: lastMemory.id,
    basicBlockIds: basicTemplates.map(({ id }) => id),
    libraryImage: {
      key: imageKey,
      promptTags: [era.code, region.code, occupation.id, ...scores.topTags.map(({ tag }) => tag)],
    },
  };
}
