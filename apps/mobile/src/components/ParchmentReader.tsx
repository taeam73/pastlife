import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { separateDialogueParagraphs, splitDialogueSegments } from '../results/dialogue';
import { paginateMemoryItems, paginateText } from '../results/paginate';
import { spacing } from '../theme/tokens';
import { ParchmentLineReveal } from './ParchmentLineReveal';

function ProsePage({ body, separateDialogue = false }: { body: string; separateDialogue?: boolean }) {
  const paragraphs = body.split(/\n{2,}/u).filter(Boolean);
  const segments = separateDialogue
    ? paragraphs.flatMap(splitDialogueSegments)
    : paragraphs.map((text) => ({ kind: 'narration' as const, text }));
  return <ParchmentLineReveal items={segments.map((segment, index) => <Text key={index} style={[styles.body, segment.kind === 'dialogue' && styles.dialogue]}>{segment.text}</Text>)} style={styles.proseList} />;
}

function TimelinePage({ body }: { body: string }) {
  const items = body.split('\n').filter(Boolean).map((line, index) => {
    const [label, ...rest] = line.split(/\s*·\s*/u);
    const detail = rest.join(' · ');
    return <View key={`${label}-${index}`} style={styles.entry}>
      {detail ? <Text style={styles.entryLabel}>{label}</Text> : null}
      <Text style={styles.entryBody}>{detail || line}</Text>
    </View>;
  });
  return <ParchmentLineReveal items={items} style={styles.entryList} />;
}

function MemoryPage({ body }: { body: string }) {
  const items = body.split(/\n{2,}/u).filter(Boolean).map((item, index) => {
    const [label, ...detailLines] = item.split('\n');
    const detail = detailLines.join('\n');
    return <View key={`${label}-${index}`} style={styles.memoryEntry}>
      <Text style={styles.entryLabel}>{label}</Text>
      <Text style={[styles.entryBody, /^[“"]/u.test(detail) && styles.quote]}>{detail}</Text>
    </View>;
  });
  return <ParchmentLineReveal items={items} style={styles.entryList} />;
}

function FormattedPage({ chapterKey, body }: { chapterKey: string; body: string }) {
  if (chapterKey === '삶의 기록') return <TimelinePage body={body} />;
  if (chapterKey === '전생의 기억') return <MemoryPage body={body} />;
  return <ProsePage body={body} separateDialogue={chapterKey === '에피소드'} />;
}

export function ParchmentReader({ title, body, chapterKey, pageIndex = 0, onPageChange }: { title: string; body: string; chapterKey: string; pageIndex?: number; onPageChange?: ((index: number) => void) | undefined }) {
  const { width } = useWindowDimensions();
  const paginatedBody = chapterKey === '에피소드' ? separateDialogueParagraphs(body) : body;
  const pages = chapterKey === '전생의 기억'
    ? paginateMemoryItems(body, width < 600 ? 2 : 3)
    : paginateText(paginatedBody, chapterKey === '에피소드' ? 160 : 190);
  const visibleIndex = Math.min(pageIndex, Math.max(0, pages.length - 1));
  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(pages.length - 1, index));
    onPageChange?.(next);
  };
  return <View testID="chapter-reader-panel" style={styles.panel}>
    <Image source={require('../../assets/parchment/reader-texture.png')} resizeMode="stretch" style={styles.texture} accessibilityIgnoresInvertColors />
    <Text style={styles.title}>{title}</Text>
    <View style={styles.pages} accessibilityLabel={`${chapterKey} 내용`}>
      <View testID="chapter-text-page" style={styles.page}><FormattedPage key={`${chapterKey}-${visibleIndex}`} chapterKey={chapterKey} body={pages[visibleIndex] ?? ''} /></View>
    </View>
    {pages.length > 1 ? <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel="이전 글 페이지" disabled={visibleIndex === 0} onPress={() => goTo(visibleIndex - 1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
      <Text style={styles.pageCount}>{visibleIndex + 1} / {pages.length}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="다음 글 페이지" disabled={visibleIndex === pages.length - 1} onPress={() => goTo(visibleIndex + 1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', maxWidth: 980, height: '100%', paddingTop: spacing.lg * 2, paddingBottom: spacing.md, borderRadius: 16, borderWidth: 2, borderColor: '#a4783d', backgroundColor: '#dcc79a', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  texture: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  title: { color: '#4a321e', fontSize: 24, lineHeight: 32, fontWeight: '800', textAlign: 'center', paddingHorizontal: spacing.md },
  pages: { width: '100%', flex: 1, marginTop: spacing.sm },
  page: { flex: 1, justifyContent: 'flex-start', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  proseList: { width: '100%', gap: 10 },
  body: { color: '#3f2b1c', fontSize: 17, lineHeight: 29, textAlign: 'left' },
  dialogue: { paddingHorizontal: spacing.sm, color: '#51351f', fontWeight: '600' },
  entryList: { width: '100%', gap: spacing.md },
  entry: { width: '100%', gap: 4, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(122, 79, 37, 0.2)' },
  memoryEntry: { width: '100%', gap: 5 },
  entryLabel: { color: '#76502a', fontSize: 15, lineHeight: 21, fontWeight: '800' },
  entryBody: { color: '#3f2b1c', fontSize: 17, lineHeight: 28 },
  quote: { paddingLeft: spacing.sm, borderLeftWidth: 3, borderLeftColor: 'rgba(122, 79, 37, 0.42)', fontStyle: 'italic' },
  controls: { position: 'absolute', top: 13, right: 14, zIndex: 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  arrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#5a3a20', fontSize: 24 },
  pageCount: { color: '#5a3a20', fontSize: 13, fontWeight: '700' },
});
