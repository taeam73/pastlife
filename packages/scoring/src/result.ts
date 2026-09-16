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
} from '@pastlife/content';
import { answerHash, hashText } from './hash.js';
import { pickCandidate } from './filter.js';
import { calculateScores } from './score.js';
import type { CalculateResultInput, ResultCore } from './types.js';

export function calculateResult({ answers, contentVersion }: CalculateResultInput): ResultCore {
  const digest = answerHash(answers);
  const seed = `${digest}:${contentVersion}`;
  const scores = calculateScores(answers);

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

  return {
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
      key: `library/${location.id.toLowerCase()}.jpg`,
      promptTags: [era.code, region.code, occupation.id, ...scores.topTags.map(({ tag }) => tag)],
    },
  };
}
