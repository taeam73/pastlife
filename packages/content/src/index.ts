import questionsJson from './generated/questions.ko.json';

import type { Question, Stage } from './types.js';

export * from './catalogs.js';
export * from './types.js';

export const questions = questionsJson as Question[];

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function questionsByStage(stage: Stage, sessionSeed: string, contentVersion: string): Question {
  const candidates = questions.filter((question) => question.stage === stage).sort((left, right) => left.id.localeCompare(right.id));
  if (candidates.length !== 6) {
    throw new Error(`Expected six questions for stage ${stage}, received ${candidates.length}`);
  }
  return candidates[stableHash(`${sessionSeed}:${contentVersion}:stage:${stage}`) % candidates.length]!;
}

export function findChoice(questionId: string, choiceId: string) {
  return questions.find((question) => question.id === questionId)?.choices.find((choice) => choice.id === choiceId);
}
