import questionsJson from './generated/questions.ko.json';

import type { Question, Stage } from './types.js';
import { storyQuestions } from './story-questions.js';
import { localizeStoryQuestion } from './translations/questions.js';

export * from './catalogs.js';
export * from './types.js';
export * from './locales.js';
export * from './historical/types.js';
export * from './historical/validate.js';
export * from './historical/occupations.js';
export * from './historical/settings.js';
export * from './historical/expansions.js';
export * from './story-catalog.js';
export * from './story-manuscripts.js';
export * from './story-final-moments.js';
export * from './translations/en/coverage.js';
export * from './translations/en/catalog.js';
export * from './translations/th/catalog.js';
export * from './translations/th/coverage.js';
export * from './translations/ja/catalog.js';
export * from './translations/ja/coverage.js';

export const questions = questionsJson as Question[];
export { storyQuestions };
export { localizeStoryQuestion } from './translations/questions.js';
export { englishStoryQuestionIds } from './translations/en/questions.js';
export { clownEnglish, clownEnglishEpisode, clownEnglishFinalMoment, renderClownEnglishEpisode } from './translations/en/CLOWN.js';
export { clownThai, clownThaiEpisode, clownThaiFinalMoment, renderClownThaiEpisode } from './translations/th/CLOWN.js';
export { thaiStoryQuestionIds } from './translations/th/questions.js';
export { japaneseStoryQuestionIds } from './translations/ja/questions.js';

export function questionsForVersion(contentVersion: string): Question[] {
  return contentVersion.startsWith('3.') ? storyQuestions : questions;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  // Mix high bits into the low bits before the four-way question choice.
  // FNV's low two bits alone couple otherwise separate stage selections.
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
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
  const candidates = questionsForVersion(contentVersion).filter((question) => question.stage === stage).sort((left, right) => left.id.localeCompare(right.id));
  const expectedCount = contentVersion.startsWith('3.') ? 4 : 6;
  if (candidates.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} questions for stage ${stage}, received ${candidates.length}`);
  }
  const excluded = new Set(input.excludedQuestionIds);
  const fresh = candidates.filter(({ id }) => !excluded.has(id));
  const selectable = fresh.length > 0 ? fresh : candidates;
  return selectable[stableHash(`${sessionSeed}:${contentVersion}:stage:${stage}`) % selectable.length]!;
}

export function findChoice(questionId: string, choiceId: string) {
  return [...questions, ...storyQuestions].find((question) => question.id === questionId)?.choices.find((choice) => choice.id === choiceId);
}
