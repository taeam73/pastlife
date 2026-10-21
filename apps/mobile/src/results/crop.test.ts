import { describe, expect, it } from 'vitest';
import { cropLayout } from './crop';

describe('cropLayout', () => {
  it('covers the frame and centers the selected focal point', () => {
    const layout = cropLayout(768, 1024, 160, 130, { focusX: 0.5, focusY: 0.5, zoom: 1.5 })!;
    expect(layout.width).toBeGreaterThanOrEqual(160);
    expect(layout.height).toBeGreaterThanOrEqual(130);
    expect(layout.left + layout.width / 2).toBeCloseTo(80);
    expect(layout.top + layout.height / 2).toBeCloseTo(65);
  });
  it('clamps edge crops without exposing empty space', () => {
    const layout = cropLayout(768, 1024, 320, 180, { focusX: 1, focusY: 0, zoom: 2 })!;
    expect(layout.left).toBeGreaterThanOrEqual(320 - layout.width);
    expect(layout.top).toBeLessThanOrEqual(0);
  });
  it('rejects invalid dimensions', () => expect(cropLayout(0, 100, 100, 100, { focusX: 0.5, focusY: 0.5, zoom: 1 })).toBeNull());
});
