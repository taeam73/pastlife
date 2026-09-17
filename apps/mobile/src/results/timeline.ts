export type TimelineEntry = { index: number; startMs: number; endMs: number };

export function buildTimeline<T>(items: readonly T[], durationMs: number): TimelineEntry[] {
  if (items.length === 0) return [];
  const slice = durationMs / items.length;
  return items.map((_, index) => ({
    index,
    startMs: Math.round(index * slice),
    endMs: index === items.length - 1 ? durationMs : Math.round((index + 1) * slice),
  }));
}
