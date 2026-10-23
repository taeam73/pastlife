import { describe, expect, it } from 'vitest';
import { paginateMemoryItems, paginateText } from './paginate';

describe('paginateText', () => {
  it('keeps every word in order across pages', () => {
    const source = '시련이 찾아왔습니다. 사람들은 서로를 도왔습니다. 그 뒤에 선택을 내렸습니다.';
    expect(paginateText(source, 25).join(' ')).toBe(source);
    expect(paginateText(source, 25).length).toBeGreaterThan(1);
  });
  it('does not create a blank page', () => expect(paginateText('  ', 100)).toEqual([]));
  it('prefers complete sentences when they fit a page', () => {
    expect(paginateText('첫 장면입니다. 다음 이야기가 이어집니다.', 17)).toEqual(['첫 장면입니다.', '다음 이야기가 이어집니다.']);
  });
  it('does not strand a short ending on its own page', () => {
    const source = '첫 이야기가 시작됐습니다. 다음 장면에서 손을 잡았습니다. 오래 기다린 뒤에 문을 열었습니다. 결국 웃었습니다.';
    const pages = paginateText(source, 65);
    expect(pages.join(' ')).toBe(source);
    expect(pages.every((page) => page.length > 20)).toBe(true);
  });
  it('keeps paragraph and timeline breaks in a long manuscript', () => {
    const source = '첫 장면입니다. 인물이 문을 엽니다.\n\n두 번째 장면입니다. 마을 사람이 등장합니다.\n마지막 기록입니다.';
    const pages = paginateText(source, 90);
    expect(pages.join(' ')).toContain('두 번째 장면입니다.');
    expect(pages.some((page) => page.includes('\n\n'))).toBe(true);
    expect(pages.every((page) => Array.from(page).length <= 90)).toBe(true);
  });
  it('keeps each memory label with its detail', () => {
    const source = '지키려 한 곳\n도서관\n\n남긴 말\n“기록해 줘.”\n\n라엔의 평가\n“잘 들었어.”';
    expect(paginateMemoryItems(source, 2)).toEqual(['지키려 한 곳\n도서관\n\n남긴 말\n“기록해 줘.”', '라엔의 평가\n“잘 들었어.”']);
  });
});
