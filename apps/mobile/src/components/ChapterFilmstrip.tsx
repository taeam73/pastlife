import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { resolveLibraryImage } from '../results/libraryImages';
import { CroppedScene } from './CroppedScene';
import type { Crop } from '../results/crop';

type Chapter = { id: string; title: string; summary: string; detail: string; imageUri?: string | undefined; crop?: Crop | undefined };
type Props = { chapters: Chapter[]; imageUri: string; imageAlt: string; selectedIndex: number; onSelect: (index: number) => void };

export function ChapterFilmstrip({ chapters, imageUri, imageAlt, selectedIndex, onSelect }: Props) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 760) - spacing.lg * 2;
  const cardWidth = Math.max(94, Math.floor((contentWidth - spacing.md * 2 - spacing.sm * 3) / 4));
  const fallback = resolveLibraryImage(imageUri) ?? (/^https?:\/\//.test(imageUri) ? { uri: imageUri } : undefined);
  if (!fallback) return null;
  return <View style={styles.section}>
    <View style={styles.headingRow}><View style={styles.headingLine} /><Text style={styles.sectionTitle}>나의 전생 이야기</Text><View style={styles.headingLine} /></View>
    <View style={styles.railWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} accessibilityLabel="전생 이야기 챕터 목록">
        {chapters.map((chapter, index) => {
          return <Pressable key={chapter.id} accessibilityRole="button" accessibilityLabel={`${index + 1}장 ${chapter.title}`} accessibilityState={{ selected: selectedIndex === index }} onPress={() => onSelect(index)} style={({ pressed }) => [styles.card, { width: cardWidth }, selectedIndex === index && styles.selected, pressed && styles.pressed]}>
            <View style={styles.image}><CroppedScene uri={imageUri} crop={chapter.crop ?? { focusX: (index + 1) / 5, focusY: 0.5, zoom: 1.55 }} accessibilityLabel={`${imageAlt} · ${chapter.title} 미리보기`} /></View>
            <View style={styles.shade} />
            <View style={styles.cardCopy}><Text style={styles.chapterNumber}>{String(index + 1).padStart(2, '0')}</Text><Text numberOfLines={2} style={styles.chapterTitle}>{chapter.title}</Text></View>
          </Pressable>;
        })}
      </ScrollView>
      <View pointerEvents="none" style={styles.timeline}><View style={styles.timelineLine} />{chapters.map((chapter, index) => <View key={`${chapter.id}-dot`} style={[styles.timelineDot, index === selectedIndex && styles.timelineDotActive]} />)}</View>
    </View>
    <View style={styles.hint}><Text style={styles.arrow}>‹</Text><Text style={styles.hintText}>좌우로 밀어 보세요</Text><Text style={styles.arrow}>›</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.md, paddingVertical: spacing.md, backgroundColor: '#10100f', gap: spacing.sm },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  headingLine: { flex: 1, maxWidth: 72, height: 1, backgroundColor: '#b89456' },
  sectionTitle: { color: '#d8b66a', fontSize: 20, lineHeight: 28, fontWeight: '700' },
  railWrap: { position: 'relative', width: '100%', maxWidth: 760, alignSelf: 'center' },
  rail: { gap: 7, paddingHorizontal: spacing.sm, paddingBottom: 21 },
  card: { width: 94, height: 137, overflow: 'hidden', borderRadius: 8, borderWidth: 1, borderColor: '#6b5128', backgroundColor: '#211a12', justifyContent: 'flex-end' },
  selected: { borderColor: '#f0c75e', borderWidth: 2, shadowColor: '#e7b94c', shadowOpacity: 0.65, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  pressed: { transform: [{ scale: 0.97 }] },
  image: { ...StyleSheet.absoluteFill },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4, 5, 6, 0.25)' },
  cardCopy: { padding: 7, backgroundColor: 'rgba(8, 8, 8, 0.38)' },
  chapterNumber: { color: '#f0c75e', fontSize: 16, lineHeight: 21, fontWeight: '700' },
  chapterTitle: { color: '#fff8e8', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  timeline: { position: 'absolute', left: 31, right: 31, bottom: 7, height: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#c7983e' },
  timelineDot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1, borderColor: '#d7a847', backgroundColor: '#10100f' },
  timelineDotActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f0c75e' },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  arrow: { color: '#e0c48b', fontSize: 27, lineHeight: 27 },
  hintText: { color: '#d8d0c2', fontSize: 13 },
});
