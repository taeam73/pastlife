import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewMode } from '../session/store';
import { buildTimeline } from '../results/timeline';
import { colors, spacing } from '../theme/tokens';
import { ResultBlock } from './ResultBlock';

type Block = { id: string; title: string; body: string };
type ImageAsset = { uri: string; alt: string; sourceType: 'AI' | 'LIBRARY'; status: 'READY' | 'FALLBACK' };

export function ResultExperience(props: {
  image: ImageAsset;
  blocks: Block[];
  viewMode: ViewMode;
  durationMs: number;
  muted: boolean;
  reduceMotion: boolean;
  onMutedChange: (muted: boolean) => void;
  onViewModeChange: (mode: ViewMode) => void | Promise<void>;
}) {
  const { blocks, durationMs, viewMode } = props;
  const timeline = useMemo(() => buildTimeline(blocks, durationMs), [blocks, durationMs]);
  const [playing, setPlaying] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const captionOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (viewMode !== 'VIDEO' || !playing || elapsedMs >= durationMs) return;
    const timer = setInterval(() => setElapsedMs((value) => Math.min(durationMs, value + 250)), 250);
    return () => clearInterval(timer);
  }, [durationMs, elapsedMs, playing, viewMode]);

  const activeIndex = timeline.find(({ startMs, endMs }) => elapsedMs >= startMs && elapsedMs < endMs)?.index ?? Math.max(0, blocks.length - 1);
  const activeBlock = blocks[activeIndex];
  const showRemoteImage = /^https?:\/\//.test(props.image.uri);

  useEffect(() => {
    if (props.reduceMotion) { captionOpacity.setValue(1); return; }
    captionOpacity.setValue(0);
    Animated.timing(captionOpacity, { toValue: 1, duration: 350, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [activeIndex, captionOpacity, props.reduceMotion]);

  return <View style={styles.container}>
    <View accessible accessibilityLabel={blocks.map(({ title, body }) => `${title}. ${body}`).join(' ')} style={styles.accessibleSummary} />
    <View style={styles.modeRow} accessibilityRole="tablist">
      {(['VIDEO', 'TEXT'] as const).map((mode) => <Pressable key={mode} accessibilityRole="tab" accessibilityState={{ selected: viewMode === mode }} onPress={() => void props.onViewModeChange(mode)} style={[styles.modeButton, viewMode === mode && styles.modeSelected]}><Text style={styles.modeText}>{mode === 'VIDEO' ? '영상으로 보기' : '텍스트로 보기'}</Text></Pressable>)}
    </View>
    {viewMode === 'VIDEO' ? <View style={[styles.cinematic, props.reduceMotion && styles.reducedMotion]}>
      {showRemoteImage ? <Image accessibilityLabel={props.image.alt} source={{ uri: props.image.uri }} resizeMode="cover" style={styles.image} /> : <View accessible accessibilityLabel={props.image.alt} style={styles.imageFallback}><Text style={styles.imageFallbackText}>전생 기록 이미지</Text></View>}
      <View style={styles.scrim} />
      {activeBlock ? <Animated.View style={[styles.caption, { opacity: captionOpacity }]}><Text style={styles.captionTitle}>{activeBlock.title}</Text><Text style={styles.captionBody}>{activeBlock.body}</Text></Animated.View> : null}
      <Text style={styles.progress}>{Math.min(activeIndex + 1, blocks.length)} / {blocks.length}</Text>
    </View> : <View style={styles.textView}>{blocks.map((block) => <ResultBlock key={block.id} title={block.title} body={block.body} />)}</View>}
    {viewMode === 'VIDEO' ? <View style={styles.controls}>
      <Control label={playing ? '일시 정지' : '재생'} onPress={() => setPlaying((value) => !value)} />
      <Control label="다시 보기" onPress={() => { setElapsedMs(0); setPlaying(true); }} />
      <Control label="건너뛰기" onPress={() => { setElapsedMs(durationMs); setPlaying(false); }} />
      <Control label={props.muted ? '소리 켜기' : '음소거'} onPress={() => props.onMutedChange(!props.muted)} />
    </View> : null}
  </View>;
}

function Control({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.control}><Text style={styles.controlText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  accessibleSummary: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeButton: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, alignItems: 'center' },
  modeSelected: { backgroundColor: colors.surfaceRaised, borderColor: colors.accent },
  modeText: { color: colors.text, fontWeight: '700' },
  cinematic: { minHeight: 430, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surface, justifyContent: 'flex-end' },
  reducedMotion: { minHeight: 390 },
  image: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  imageFallback: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  imageFallbackText: { color: colors.muted, fontSize: 17 },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(5, 10, 18, 0.55)' },
  caption: { padding: spacing.lg, gap: spacing.sm },
  captionTitle: { color: colors.accent, fontSize: 18, fontWeight: '700' },
  captionBody: { color: colors.text, fontSize: 20, lineHeight: 31, fontWeight: '600' },
  progress: { position: 'absolute', right: spacing.md, top: spacing.md, color: colors.text },
  textView: { gap: spacing.md },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  control: { borderColor: colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  controlText: { color: colors.text, fontSize: 14 },
});
