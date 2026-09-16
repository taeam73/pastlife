import { questionsByStage, type Stage } from '@pastlife/content';
import type { AnswerInput } from '../src/index.js';

export function answersFor(seed = 'session-seed', choiceIndex = 0): AnswerInput[] {
  return ([1, 2, 3, 4, 5, 6] as Stage[]).map((stage) => {
    const question = questionsByStage(stage, seed, '2.0.0');
    return { stage, questionId: question.id, choiceId: question.choices[choiceIndex]!.id };
  });
}
