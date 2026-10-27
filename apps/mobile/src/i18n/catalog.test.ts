import { describe, expect, it } from 'vitest';
import { english } from './en';
import { thai } from './th';
import { japanese } from './ja';

describe('Thai UI preview catalog', () => {
  it('covers every English UI key without Korean fallback text', () => {
    expect(Object.keys(thai).sort()).toEqual(Object.keys(english).sort());
    for (const [key, value] of Object.entries(thai)) {
      expect(value.trim(), key).not.toBe('');
      expect(value, key).not.toMatch(/[가-힣]/u);
    }
  });
});

describe('Japanese UI catalog', () => {
  it('covers every UI key without Korean fallback text', () => {
    expect(Object.keys(japanese).sort()).toEqual(Object.keys(english).sort());
    for (const [key, value] of Object.entries(japanese)) {
      expect(value.trim(), key).not.toBe('');
      expect(value, key).not.toMatch(/[가-힣]/u);
    }
  });
});
