import { findHistoricalSettingExpansion } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';

function stableIndex(seed: string, length: number) {
  let hash = 2_166_136_261;
  for (const character of seed) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16_777_619); }
  return (hash >>> 0) % length;
}

export function selectHistoricalEpisodes(core: Pick<ResultCore, 'answerHash' | 'recordNo' | 'locationId' | 'occupationId'>) {
  const expansion = findHistoricalSettingExpansion(core.locationId);
  if (!expansion) throw new Error(`Unknown historical setting expansion: ${core.locationId}`);
  const compatible = expansion.workEpisodes.filter(({ occupationIds }) => occupationIds.includes(core.occupationId));
  const workCandidates = compatible.length > 0 ? compatible : expansion.workEpisodes;
  return {
    work: workCandidates[stableIndex(`${core.answerHash}:${core.recordNo}:work`, workCandidates.length)]!,
    life: expansion.lifeEvents[stableIndex(`${core.answerHash}:${core.recordNo}:life`, expansion.lifeEvents.length)]!,
  };
}
