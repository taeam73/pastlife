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
  return selectQuestion({ stage, sessionSeed, contentVersion, excludedQuestionIds: [] });
}

export function selectQuestion(input: {
  stage: Stage;
  sessionSeed: string;
  contentVersion: string;
  excludedQuestionIds: readonly string[];
}): Question {
  const { stage, sessionSeed, contentVersion } = input;
  const candidates = questions.filter((question) => question.stage === stage).sort((left, right) => left.id.localeCompare(right.id));
  if (candidates.length !== 6) {
    throw new Error(`Expected six questions for stage ${stage}, received ${candidates.length}`);
  }
  const excluded = new Set(input.excludedQuestionIds);
  const fresh = candidates.filter(({ id }) => !excluded.has(id));
  const selectable = fresh.length > 0 ? fresh : candidates;
  return selectable[stableHash(`${sessionSeed}:${contentVersion}:stage:${stage}`) % selectable.length]!;
}

export function findChoice(questionId: string, choiceId: string) {
  return questions.find((question) => question.id === questionId)?.choices.find((choice) => choice.id === choiceId);
}
