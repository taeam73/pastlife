import { describe, expect, it } from 'vitest';
import { choiceOutcomeVariantCount, selectChoiceOutcome } from '../src/providers/choice-outcome-catalog.js';

const facts = {
  choice: '당신은 배급 명단을 먼저 구했습니다', cost: '개인 물건과 품삯 장부를 잃었습니다',
  immediateResult: '열두 가구가 식량을 받았습니다', laterTime: '사흘 뒤', laterResult: '창고의 보관 규칙이 바뀌었습니다',
  relationshipAction: '동료가 반대편 문을 열었습니다', legacy: '사람들은 같은 명단을 두 곳에 보관했습니다',
};

describe('choice outcome catalog', () => {
  it('provides six deterministic storytelling structures', () => {
    expect(choiceOutcomeVariantCount()).toBe(6);
    const results = Array.from({ length: 200 }, (_, index) => selectChoiceOutcome({
      answerHash: `choice-${index}`, recordNo: index + 1, eventId: 'EVENT_01', relationshipId: 'REL_COMPANION',
    }, facts));
    expect(new Set(results.map(({ index }) => index)).size).toBe(6);
    expect(selectChoiceOutcome({ answerHash: 'same', recordNo: 1, eventId: 'EVENT_01', relationshipId: 'REL_COMPANION' }, facts))
      .toEqual(selectChoiceOutcome({ answerHash: 'same', recordNo: 1, eventId: 'EVENT_01', relationshipId: 'REL_COMPANION' }, facts));
    expect(results.every(({ text }) => text.length >= 55 && text.length <= 220 && !text.includes('undefined'))).toBe(true);
    expect(results.every(({ text }) => (text.match(/[.!?…]/g) ?? []).length <= 4)).toBe(true);
  });
});
