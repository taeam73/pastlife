import { describe, expect, it } from 'vitest';
import { auditQuestionScoring } from '../src/index.js';

describe('question scoring audit', () => {
  it('reports the six-stage catalog shape', () => {
    const report = auditQuestionScoring();
    expect(report.questionCount).toBe(36);
    expect(report.choiceCount).toBe(216);
    expect(Object.values(report.stageChoiceCounts)).toEqual([36, 36, 36, 36, 36, 36]);
  });

  it('reports effective materiality coverage from the fallback mapping', () => {
    const report = auditQuestionScoring();
    expect(report.axisCoverage.materiality).toBe(216);
    expect(report.warnings).not.toContain('Axis materiality has no scored choices');
  });
});
