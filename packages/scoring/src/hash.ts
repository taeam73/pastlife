import { createHash } from 'node:crypto';
import type { AnswerInput } from './types.js';

export function canonicalAnswers(answers: AnswerInput[]): AnswerInput[] {
  return [...answers].sort((left, right) => left.stage - right.stage);
}

export function hashText(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function answerHash(answers: AnswerInput[]): string {
  const canonical = canonicalAnswers(answers).map(({ stage, questionId, choiceId }) => `${stage}:${questionId}:${choiceId}`).join('|');
  return hashText(canonical);
}
