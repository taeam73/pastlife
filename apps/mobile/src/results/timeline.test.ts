import { describe, expect, it } from 'vitest';
import { buildTimeline } from './timeline';

describe('buildTimeline', () => {
  it('spreads result blocks across the requested non-blocking duration', () => {
    const timeline = buildTimeline(['a', 'b', 'c'], 15_000);
    expect(timeline).toHaveLength(3);
    expect(timeline[0]).toEqual({ index: 0, startMs: 0, endMs: 5_000 });
    expect(timeline.at(-1)?.endMs).toBe(15_000);
  });
});
