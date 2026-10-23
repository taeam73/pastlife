import { describe, expect, it } from 'vitest';
import { storyCards } from '../src/story-catalog.js';
import { storyCardsBatch02 } from '../src/story-catalog-batch-02.js';

const newIds = [
  'TASTER', 'CLOUD_PAINTER', 'FESTIVAL_KING', 'SNOW_REFEREE',
  'SHADOW_TAILOR', 'UNDERWATER_SCALE', 'FIREWORKS', 'DOORLESS_KEEPER',
  'LOST_AUTUMN', 'THEATRE_VILLAIN', 'WINDMILL', 'HEAVY_BOX',
];

describe('second story-library group', () => {
  it('contains twelve distinct, fully developed human lives', () => {
    expect(storyCardsBatch02).toHaveLength(12);
    expect(storyCards.filter(({ id }) => newIds.includes(id))).toHaveLength(12);
    expect(storyCards.some(({ id }) => id === 'FIREWORKS')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'TASTER')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'CLOUD_PAINTER')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'FESTIVAL_KING')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'SNOW_REFEREE')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'SHADOW_TAILOR')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'UNDERWATER_SCALE')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'DOORLESS_KEEPER')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'LOST_AUTUMN')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'THEATRE_VILLAIN')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'WINDMILL')).toBe(true);
    expect(storyCards.some(({ id }) => id === 'HEAVY_BOX')).toBe(true);
    expect(storyCards.find(({ id }) => id === 'WINDMILL')?.setting).toEqual({
      worldName: '아르하', year: '바람력 214년', polity: '돌샘 연합', region: '칼렌 고원의 메마른 들판', gender: '여성',
    });
    expect(storyCards.find(({ id }) => id === 'HEAVY_BOX')?.setting).toEqual({
      worldName: '이브란', year: '순회력 73년', polity: '강등 연맹', region: '루헨 계곡 자갈나루', gender: '남성',
    });
    expect(new Set([...storyCards.slice(0, 12), ...storyCardsBatch02].map(({ id }) => id)).size).toBe(24);
    expect(new Set([...storyCards.slice(0, 12), ...storyCardsBatch02].map(({ name }) => name)).size).toBe(24);
    expect(new Set([...storyCards.slice(0, 12), ...storyCardsBatch02].map(({ home }) => home)).size).toBe(24);
    for (const id of newIds) {
      const card = storyCardsBatch02.find((candidate) => candidate.id === id);
      expect(card, `${id} is missing`).toBeDefined();
      expect(card!.rare).toBeUndefined();
      expect(card!.identityLine).toContain(card!.name);
      expect(card!.identityLine).toContain(card!.home);
      for (const key of ['identityLine', 'life', 'turn', 'decision', 'cost', 'after', 'presentEcho', 'secondLook', 'unresolved'] as const) {
        expect(card![key].trim().length, `${id}.${key}`).toBeGreaterThan(35);
      }
      expect(card!.opening.trim().length, `${id}.opening`).toBeGreaterThan(20);
      expect(card!.readerQuestion.trim().length, `${id}.readerQuestion`).toBeGreaterThan(20);
      expect(card!.signals).toHaveLength(3);
      expect(new Set(card!.signals).size).toBe(3);
      for (const signal of card!.signals) {
        expect(card!.signalMoments[signal]?.trim().length, `${id}.signalMoments.${signal}`).toBeGreaterThan(35);
      }
    }
  });
});
