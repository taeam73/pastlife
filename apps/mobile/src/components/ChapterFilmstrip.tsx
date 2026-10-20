import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { resolveLibraryImage } from '../results/libraryImages';

type Chapter = { id: string; title: string; summary: string; detail: string };
type Props = { chapters: Chapter[]; imageUri: string; imageAlt: string; selectedIndex: number; onSelect: (index: number) => void };

export function ChapterFilmstrip({ chapters, imageUri, imageAlt, selectedIndex, onSelect }: Props) {
  const source = resolveLibraryImage(imageUri) ?? (/^https?:\/\//.test(imageUri) ? { uri: imageUri } : undefined);
  if (!source) return null;
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>나의 전생 이야기</Text>
    <Text style={styles.sectionHint}>카드를 누르거나 좌우로 밀어 한 장씩 읽어보세요</Text>
    <View style={styles.railWrap}>
      <View pointerEvents="none" style={styles.timelineLine} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} accessibilityLabel="전생 이야기 챕터 목록">
        {chapters.map((chapter, index) => <Pressable key={chapter.id} accessibilityRole="button" accessibilityLabel={`${index + 1}장 ${chapter.title}`} accessibilityState={{ selected: selectedIndex === index }} onPress={() => onSelect(index)} style={({ pressed }) => [styles.card, selectedIndex === index && styles.selected, pressed && styles.pressed]}>
          <Image accessibilityLabel={imageAlt} source={source} resizeMode="cover" style={styles.image} />
          <View style={styles.shade} />
          <Text style={styles.chapterNumber}>{String(index + 1).padStart(2, '0')}</Text>
          <Text numberOfLines={2} style={styles.chapterTitle}>{chapter.title}</Text>
        </Pressable>)}
      </ScrollView>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: spacing.xs, marginTop: spacing.md },
  sectionTitle: { color: colors.accent, fontSize: 20, lineHeight: 27, fontWeight: '700', textAlign: 'center' },
  sectionHint: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: spacing.sm },
  railWrap: { position: 'relative' },
  timelineLine: { position: 'absolute', left: 24, right: 24, bottom: 16, height: 1, backgroundColor: 'rgba(184, 148, 86, 0.8)' },
  rail: { gap: spacing.sm, paddingVertical: 4, paddingHorizontal: 2 },
  card: { width: 148, height: 112, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end' },
  pressed: { borderColor: colors.accent, transform: [{ scale: 0.98 }] },
  selected: { borderColor: colors.accent, borderWidth: 2 },
  image: StyleSheet.absoluteFill,
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 18, 0.42)' },
  chapterNumber: { color: colors.accent, fontSize: 12, fontWeight: '700', paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  chapterTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '700', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
});
