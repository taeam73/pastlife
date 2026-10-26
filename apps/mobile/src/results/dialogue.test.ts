import { describe, expect, it } from 'vitest';
import { separateDialogueParagraphs, splitDialogueSegments } from './dialogue';

describe('splitDialogueSegments', () => {
  it('puts embedded dialogue in its own segment', () => {
    expect(splitDialogueSegments('톨라가 말했습니다. “사장님 같지는 않아요.” 비시는 고개를 들었습니다.')).toEqual([
      { kind: 'narration', text: '톨라가 말했습니다.' },
      { kind: 'dialogue', text: '“사장님 같지는 않아요.”' },
      { kind: 'narration', text: '비시는 고개를 들었습니다.' },
    ]);
  });

  it('supports straight quotation marks', () => {
    expect(splitDialogueSegments('그가 물었습니다. "정말입니까?"')).toEqual([
      { kind: 'narration', text: '그가 물었습니다.' },
      { kind: 'dialogue', text: '"정말입니까?"' },
    ]);
  });

  it('places dialogue on paragraph boundaries before pagination', () => {
    expect(separateDialogueParagraphs('톨라가 말했습니다. “사장님 같지는 않아요.” 비시는 고개를 들었습니다.')).toBe(
      '톨라가 말했습니다.\n\n“사장님 같지는 않아요.”\n\n비시는 고개를 들었습니다.',
    );
  });
});
