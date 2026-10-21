import { forwardRef, useImperativeHandle } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { ResultHero } from './ResultHero';

type Chapter = { id: string; title: string; summary: string; detail: string };
type Layer = { uri: string; role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT'; alt: string };
type Props = { chapters: Chapter[]; imageUri: string; imageAlt: string; compositeUri?: string | undefined; layers?: Layer[]; title: string; characterLabel?: string | undefined; characterDescription?: string | undefined; introductionSummary: string; selectedIndex: number; onSelect: (index: number) => void };
export type CinematicChapterPagerHandle = { scrollToIndex: (index: number) => void };

export const CinematicChapterPager = forwardRef<CinematicChapterPagerHandle, Props>(function CinematicChapterPager({ chapters, imageUri, imageAlt, compositeUri, layers, title, characterLabel, characterDescription, introductionSummary, selectedIndex, onSelect }, ref) {
  useImperativeHandle(ref, () => ({ scrollToIndex: onSelect }), [onSelect]);
  const chapter = chapters[selectedIndex];
  if (!chapter) return null;
  return <View style={styles.wrapper}>
    <ResultHero imageUri={imageUri} imageAlt={imageAlt} compositeUri={compositeUri} layers={layers} title={title} characterLabel={characterLabel} characterDescription={characterDescription} introductionSummary={introductionSummary} chapterTitle={chapter.title} chapterDetail={chapter.detail} index={selectedIndex} />
    <View style={styles.dots}>{chapters.map((item, index) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${index + 1}장 ${item.title} 보기`} accessibilityState={{ selected: index === selectedIndex }} onPress={() => onSelect(index)} style={styles.dotHit}><View style={[styles.dot, index === selectedIndex && styles.activeDot]} /></Pressable>)}</View>
  </View>;
});

const styles = StyleSheet.create({
  wrapper: { width: '100%', minWidth: 0 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 2, paddingTop: spacing.xs },
  dotHit: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  activeDot: { width: 18, backgroundColor: colors.accent },
});
