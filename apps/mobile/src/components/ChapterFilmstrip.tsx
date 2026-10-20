import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { resolveLibraryImage } from '../results/libraryImages';

type Chapter = { id: string; title: string; summary: string; detail: string };

type Props = {
  chapters: Chapter[];
  imageUri: string;
  imageAlt: string;
};

export function ChapterFilmstrip({ chapters, imageUri, imageAlt }: Props) {
  const source = resolveLibraryImage(imageUri) ?? (/^https?:\/\//.test(imageUri) ? { uri: imageUri } : undefined);
  if (!source) return null;

  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>나의 전생 이야기</Text>
    <Text style={styles.sectionHint}>원하는 장면을 선택하면 그 시절의 이야기가 펼쳐집니다.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} accessibilityLabel="전생 이야기 챕터 목록">
      {chapters.map((chapter, index) => <Pressable key={chapter.id} accessibilityRole="button" accessibilityLabel={`${index + 1}장 ${chapter.title}`} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <Image accessibilityLabel={imageAlt} source={source} resizeMode="cover" style={styles.image} />
        <View style={styles.shade} />
        <Text style={styles.chapterNumber}>{String(index + 1).padStart(2, '0')}</Text>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
      </Pressable>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: spacing.xs, marginTop: spacing.md },
  sectionTitle: { color: colors.accent, fontSize: 17, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  sectionHint: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: spacing.sm },
  rail: { gap: spacing.sm, paddingVertical: 4, paddingHorizontal: 2 },
  card: { width: 148, height: 112, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end' },
  pressed: { borderColor: colors.accent, transform: [{ scale: 0.98 }] },
  image: StyleSheet.absoluteFill,
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 18, 0.38)' },
  chapterNumber: { color: colors.accent, fontSize: 12, fontWeight: '700', paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  chapterTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '700', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
});
