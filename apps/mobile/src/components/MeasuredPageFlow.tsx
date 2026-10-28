import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

export type PageSource = { title?: string; body: string; kind?: 'intro' };
type Page = { sourceIndex: number; body: string };
type Progress = {
  key: string;
  sourceIndex: number;
  start: number;
  low: number;
  high: number;
  best: number;
  candidate: number;
  pages: Page[];
  done: boolean;
};

// Keep spaces and paragraph breaks with the preceding word. Splitting very long
// words also guarantees that a single token cannot overflow a narrow device.
function pageTokens(body: string): string[] {
  return (body.match(/\S+\s*|\s+/gu) ?? []).flatMap((part) => {
    // Keep combining marks with their base character when Thai and other
    // scripts have no spaces between words.
    const letters = Array.from(part.matchAll(/\P{M}\p{M}*|\p{M}+/gu), (match) => match[0]);
    if (letters.length <= 12) return [part];
    const pieces: string[] = [];
    for (let index = 0; index < letters.length; index += 12) pieces.push(letters.slice(index, index + 12).join(''));
    return pieces;
  });
}

function initialPageMeasurement(key: string, tokens: string[][]): Progress {
  if (!tokens.length) return { key, sourceIndex: 0, start: 0, low: 0, high: 0, best: 0, candidate: 0, pages: [], done: true };
  const length = tokens[0]!.length;
  return { key, sourceIndex: 0, start: 0, low: 1, high: length, best: 0, candidate: Math.max(1, Math.ceil(length / 2)), pages: [], done: false };
}

function advancePageMeasurement(progress: Progress, tokens: string[][], fits: boolean): Progress {
  if (progress.done) return progress;
  const source = tokens[progress.sourceIndex] ?? [];
  const best = fits ? progress.candidate : progress.best;
  const low = fits ? progress.candidate + 1 : progress.low;
  const high = fits ? progress.high : progress.candidate - 1;
  if (low <= high) return { ...progress, low, high, best, candidate: Math.floor((low + high) / 2) };
  const end = Math.max(progress.start + 1, best);
  const pages = [...progress.pages, { sourceIndex: progress.sourceIndex, body: source.slice(progress.start, end).join('').trim() }];
  if (end < source.length) {
    const nextLow = end + 1;
    return { ...progress, start: end, low: nextLow, high: source.length, best: end, candidate: Math.floor((nextLow + source.length) / 2), pages };
  }
  const nextSourceIndex = progress.sourceIndex + 1;
  if (nextSourceIndex >= tokens.length) return { ...progress, pages, done: true };
  const nextLength = tokens[nextSourceIndex]!.length;
  return { ...progress, sourceIndex: nextSourceIndex, start: 0, low: 1, high: nextLength, best: 0, candidate: Math.max(1, Math.ceil(nextLength / 2)), pages };
}

export function MeasuredPageFlow({ sources, pageIndex, onPageCountChange, renderPage, testID }: {
  sources: PageSource[];
  pageIndex: number;
  onPageCountChange?: ((count: number) => void) | undefined;
  renderPage: (source: PageSource, body: string, measuring: boolean) => ReactNode;
  testID?: string | undefined;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const sourceKey = JSON.stringify(sources);
  const tokens = useMemo(() => sources.map((source) => pageTokens(source.body)), [sourceKey]);
  const key = `${sourceKey}:${size.width}:${size.height}`;
  const [progress, setProgress] = useState(() => initialPageMeasurement(key, tokens));
  const current = progress.key === key ? progress : initialPageMeasurement(key, tokens);

  useEffect(() => { if (progress.key !== key) setProgress(initialPageMeasurement(key, tokens)); }, [key, progress.key, tokens]);
  useEffect(() => { if (current.done && size.width && size.height) onPageCountChange?.(current.pages.length); }, [current.done, current.pages.length, onPageCountChange, size.height, size.width]);

  const measuredSource = sources[current.sourceIndex];
  const candidate = tokens[current.sourceIndex]?.slice(current.start, current.candidate).join('').trim() ?? '';
  const visible = current.pages[Math.min(pageIndex, Math.max(0, current.pages.length - 1))];
  const onSize = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    const height = Math.round(event.nativeEvent.layout.height);
    if (width > 0 && height > 0) setSize((prior) => prior.width === width && prior.height === height ? prior : { width, height });
  };
  const onMeasured = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    setProgress((prior) => {
      const latest = prior.key === key ? prior : initialPageMeasurement(key, tokens);
      if (latest.done || latest.sourceIndex !== current.sourceIndex || latest.start !== current.start || latest.candidate !== current.candidate) return latest;
      return advancePageMeasurement(latest, tokens, measuredHeight <= size.height - 8);
    });
  };
  return <View testID={testID} onLayout={onSize} style={styles.frame}>
    {current.done && visible ? <View testID="measured-visible-page" style={styles.visible}>{renderPage(sources[visible.sourceIndex]!, visible.body, false)}</View> : <ActivityIndicator style={styles.loading} />}
    {size.width > 0 && size.height > 0 && !current.done && measuredSource ? <View key={`${key}:${current.sourceIndex}:${current.start}:${current.candidate}`} onLayout={onMeasured} pointerEvents="none" style={styles.measure}>
      {renderPage(measuredSource, candidate, true)}
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  frame: { flex: 1, width: '100%', overflow: 'hidden' },
  visible: { width: '100%' },
  measure: { position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0 },
  loading: { flex: 1 },
});
