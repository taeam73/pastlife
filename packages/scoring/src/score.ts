import { axes, questions, tags, type AxisCode, type CoreTag, type Stage } from '@pastlife/content';
import { canonicalAnswers } from './hash.js';
import type { AnswerInput, ScoreSummary } from './types.js';

const stageWeights: Record<Stage, number> = { 1: 1.3, 2: 1.3, 3: 1.4, 4: 1.4, 5: 1.3, 6: 1.5 };

const materialityByTag: Partial<Record<CoreTag, number>> = {
  stability: 2,
  survival: 2,
  protection: 1,
  achievement: 1,
  freedom: -1,
  adventure: -1,
  spirituality: -1,
  creativity: -1,
};

function derivedMateriality(choice: { tagScores: Array<{ tag: CoreTag; score: number }>; axisScores: Array<{ axis: AxisCode }> }) {
  if (choice.axisScores.some(({ axis }) => axis === 'materiality')) return 0;
  const raw = choice.tagScores.reduce((total, { tag, score }) => total + (materialityByTag[tag] ?? 0) * score, 0);
  return raw === 0 ? 0 : raw > 0 ? 1 : -1;
}

export function calculateScores(answers: AnswerInput[]): ScoreSummary {
  if (answers.length !== 6) throw new Error('Exactly six answers are required');
  if (new Set(answers.map(({ stage }) => stage)).size !== 6) throw new Error('Each answer must have a unique stage');

  const tagTotals = Object.fromEntries(tags.map((tag) => [tag, 0])) as Record<CoreTag, number>;
  const axisTotals = Object.fromEntries(axes.map((axis) => [axis, 0])) as Record<AxisCode, number>;

  for (const answer of canonicalAnswers(answers)) {
    const question = questions.find(({ id }) => id === answer.questionId);
    if (!question || question.stage !== answer.stage) throw new Error(`Question ${answer.questionId} does not match stage ${answer.stage}`);
    const choice = question.choices.find(({ id }) => id === answer.choiceId);
    if (!choice) throw new Error(`Choice ${answer.choiceId} does not belong to ${answer.questionId}`);
    const weight = stageWeights[answer.stage];
    for (const { tag, score } of choice.tagScores) tagTotals[tag] += score * weight;
    for (const { axis, score } of choice.axisScores) axisTotals[axis] += score * weight;
    axisTotals.materiality += derivedMateriality(choice) * weight;
  }

  const topTags = Object.entries(tagTotals)
    .map(([tag, score]) => ({ tag: tag as CoreTag, score }))
    .sort((left, right) => right.score - left.score || left.tag.localeCompare(right.tag))
    .slice(0, 4);

  return { tags: tagTotals, axes: axisTotals, topTags };
}
