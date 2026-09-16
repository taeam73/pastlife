import type { Candidate, CoreTag } from '@pastlife/content';
import { deterministicIndex } from './prng.js';

export function pickCandidate<T extends Candidate>(
  candidates: readonly T[],
  tagScores: Partial<Record<CoreTag, number>>,
  seed: string,
  fallbackCandidates: readonly T[] = candidates,
): T {
  const source = candidates.length > 0 ? candidates : fallbackCandidates.filter(({ fallback }) => fallback);
  const usable = source.length > 0 ? source : fallbackCandidates;
  if (usable.length === 0) throw new Error('Candidate hierarchy is empty');

  const ranked = usable
    .map((candidate) => ({ candidate, score: candidate.affinityTags.reduce((total, tag) => total + (tagScores[tag] ?? 0), 0) }))
    .sort((left, right) => right.score - left.score || left.candidate.id.localeCompare(right.candidate.id));
  const maximum = ranked[0]!.score;
  const tied = ranked.filter(({ score }) => score === maximum).map(({ candidate }) => candidate);
  return tied[deterministicIndex(seed, tied.length)]!;
}
