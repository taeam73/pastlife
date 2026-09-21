import { axes, questions, tags, type AxisCode, type CoreTag } from '@pastlife/content';

export type ScoringAuditReport = {
  questionCount: number;
  choiceCount: number;
  stageChoiceCounts: Record<number, number>;
  tagCoverage: Record<CoreTag, number>;
  axisCoverage: Record<AxisCode, number>;
  warnings: string[];
};

export function auditQuestionScoring(): ScoringAuditReport {
  const stageChoiceCounts: Record<number, number> = {};
  const tagCoverage = Object.fromEntries(tags.map((tag) => [tag, 0])) as Record<CoreTag, number>;
  const axisCoverage = Object.fromEntries(axes.map((axis) => [axis, 0])) as Record<AxisCode, number>;

  for (const question of questions) {
    stageChoiceCounts[question.stage] = (stageChoiceCounts[question.stage] ?? 0) + question.choices.length;
    for (const choice of question.choices) {
      for (const score of choice.tagScores) tagCoverage[score.tag] += 1;
      for (const score of choice.axisScores) axisCoverage[score.axis] += 1;
      if (!choice.axisScores.some(({ axis }) => axis === 'materiality')) axisCoverage.materiality += 1;
    }
  }

  const warnings: string[] = [];
  if (questions.length !== 36) warnings.push(`Expected 36 question candidates, received ${questions.length}`);
  if (Object.values(stageChoiceCounts).some((count) => count !== 36)) warnings.push('Every stage should expose 36 choices across its six candidates');
  for (const tag of tags) if (tagCoverage[tag] === 0) warnings.push(`Tag ${tag} has no scored choices`);
  for (const axis of axes) if (axisCoverage[axis] === 0) warnings.push(`Axis ${axis} has no scored choices`);

  return {
    questionCount: questions.length,
    choiceCount: questions.reduce((total, question) => total + question.choices.length, 0),
    stageChoiceCounts,
    tagCoverage,
    axisCoverage,
    warnings,
  };
}
