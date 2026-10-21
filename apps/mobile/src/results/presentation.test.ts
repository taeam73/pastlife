import { describe, expect, it } from 'vitest';
import { presentChapters, presentHeadline } from './presentation';

const highlights = [
  { id: 'PRESENT_ECHO', title: '현재의 흔적', summary: '긴 현재 요약 문장입니다. 지금의 관계와 선택에 이어지는 흔적을 남겼습니다.', detail: '긴 상세 문장이지만 앱에서는 한 장 안에 읽히도록 줄여야 합니다. '.repeat(12) },
  { id: 'KEY_RELATIONSHIP', title: '가장 중요한 인연', summary: '관계를 통해 배운 사람', detail: '인연의 상세 내용' },
  { id: 'LIFE_LEGACY', title: '남겨진 것', summary: '사람들에게 남긴 영향', detail: '선택의 상세 내용' },
  { id: 'DECISIVE_EVENT', title: '결정적 사건', summary: '삶의 방향을 바꾼 사건', detail: '시련의 상세 내용' },
];

describe('result presentation', () => {
  it('shortens display headline', () => expect(presentHeadline('아주 긴 시대와 지역과 직업을 모두 설명하는 결과 헤드라인입니다.').length).toBeLessThanOrEqual(42));
  it('returns four chapters in cinematic order with bounded body copy', () => {
    const result = presentChapters(highlights);
    expect(result.map((item) => item.shortTitle)).toEqual(['만남', '시련', '선택', '지금']);
    expect(result.every((item) => item.body.length <= 140)).toBe(true);
  });
});
