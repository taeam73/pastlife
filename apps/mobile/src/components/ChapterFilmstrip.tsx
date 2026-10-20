import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { colors, spacing } from '../theme/tokens';
import { resolveLibraryImage } from '../results/libraryImages';

type Chapter = { id: string; title: string; summary: string; detail: string };

type Props = {
  chapters: Chapter[];
  imageUri: string;
  imageAlt: string;
};

export function ChapterFilmstrip({ chapters, imageUri, imageAlt }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const source = resolveLibraryImage(imageUri) ?? (/^https?:\/\//.test(imageUri) ? { uri: imageUri } : undefined);
  if (!source) return null;

  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>나의 전생 이야기</Text>
    <Text style={styles.sectionHint}>원하는 장면을 선택하면 그 시절의 이야기가 펼쳐집니다.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} accessibilityLabel="전생 이야기 챕터 목록">
      {chapters.map((chapter, index) => <Pressable key={chapter.id} accessibilityRole="button" accessibilityLabel={`${index + 1}장 ${chapter.title}`} accessibilityState={{ selected: selectedIndex === index }} onPress={() => setSelectedIndex(index)} style={({ pressed }) => [styles.card, selectedIndex === index && styles.selected, pressed && styles.pressed]}>
        <Image accessibilityLabel={imageAlt} source={source} resizeMode="cover" style={styles.image} />
        <View style={styles.shade} />
        <Text style={styles.chapterNumber}>{String(index + 1).padStart(2, '0')}</Text>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
      </Pressable>)}
    </ScrollView>
    {chapters[selectedIndex] ? <View style={styles.detailCard}><Text style={styles.detailTitle}>{chapters[selectedIndex].title}</Text><Text style={styles.detailSummary}>{chapters[selectedIndex].summary}</Text><Text style={styles.detailBody}>{chapters[selectedIndex].detail}</Text></View> : null}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: spacing.xs, marginTop: spacing.md },
  sectionTitle: { color: colors.accent, fontSize: 17, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  sectionHint: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: spacing.sm },
  rail: { gap: spacing.sm, paddingVertical: 4, paddingHorizontal: 2 },
  card: { width: 148, height: 112, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end' },
  pressed: { borderColor: colors.accent, transform: [{ scale: 0.98 }] },
  selected: { borderColor: colors.accent, borderWidth: 2 },
  image: StyleSheet.absoluteFill,
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 18, 0.38)' },
  chapterNumber: { color: colors.accent, fontSize: 12, fontWeight: '700', paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  chapterTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '700', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
  detailCard: { borderLeftColor: colors.accent, borderLeftWidth: 3, backgroundColor: 'rgba(23, 34, 53, 0.86)', borderRadius: 12, padding: spacing.md, gap: 4 },
  detailTitle: { color: colors.accent, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  detailSummary: { color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '700' },
  detailBody: { color: colors.muted, fontSize: 14, lineHeight: 22 },
});
