import { describe, expect, it } from 'vitest';
import { paginateText } from './paginate';

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
});
