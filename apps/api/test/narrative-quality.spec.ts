import { describe, expect, it } from 'vitest';
import { editNarrative, inspectNarrative } from '../src/providers/narrative-quality.js';
import { inspectNarrativeCanon } from '../src/providers/narrative-canon.js';

describe('narrative quality gates', () => {
  it('detects repeated phrases and overlong paragraphs', () => {
    const body = `${'사람들은 기억했습니다. '.repeat(3)}${'긴 문장 '.repeat(140)}`;
    const report = inspectNarrative(body);
    expect(report.repeatedPhrases).toContain('사람들은 기억');
    expect(report.overlongParagraphs).toBe(1);
    expect(report.score).toBeLessThan(80);
  });

  it('keeps the opening and ending while removing duplicate sentences', () => {
    const body = ['처음의 장면입니다.', '중간의 선택입니다.', '반복되는 장면입니다.', '반복되는 장면입니다.', '마지막에 남은 의미입니다.'].join('\n\n');
    const edited = editNarrative(body, 4);
    expect(edited).toContain('처음의 장면입니다.');
    expect(edited).toContain('마지막에 남은 의미입니다.');
    expect(edited.match(/반복되는 장면입니다\./g)).toHaveLength(1);
  });

  it('rejects malformed six-block narrative canon', () => {
    expect(inspectNarrativeCanon([{ id: 'same', title: '', body: '' }, { id: 'same', title: '두 번째', body: '내용' }] as never)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'BLOCK_COUNT' }),
      expect.objectContaining({ code: 'EMPTY_TITLE' }),
      expect.objectContaining({ code: 'EMPTY_BODY' }),
      expect.objectContaining({ code: 'DUPLICATE_ID' }),
    ]));
  });
});
