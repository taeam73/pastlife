import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { paginateMemoryItems, paginateText } from '../results/paginate';
import { spacing } from '../theme/tokens';

export function ParchmentReader({ title, body, chapterKey }: { title: string; body: string; chapterKey: string }) {
  const { width } = useWindowDimensions();
  const pages = chapterKey === '전생의 기억' ? paginateMemoryItems(body, width < 600 ? 2 : 3) : paginateText(body, 190);
  const [pageIndex, setPageIndex] = useState(0);
  const visibleIndex = Math.min(pageIndex, Math.max(0, pages.length - 1));
  useEffect(() => {
    setPageIndex(0);
  }, [chapterKey]);
  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(pages.length - 1, index));
    setPageIndex(next);
  };
  return <View testID="chapter-reader-panel" style={styles.panel}>
    <Image source={require('../../assets/parchment/reader-texture.png')} resizeMode="stretch" style={styles.texture} accessibilityIgnoresInvertColors />
    <Text style={styles.title}>{title}</Text>
    <View style={styles.pages} accessibilityLabel={`${chapterKey} 내용`}>
      <View testID="chapter-text-page" style={styles.page}><Text style={styles.body}>{pages[visibleIndex] ?? ''}</Text></View>
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
  page: { flex: 1, justifyContent: 'flex-start', paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  body: { color: '#4a321e', fontSize: 17, lineHeight: 28, textAlign: 'left' },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.sm },
  arrow: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#5a3a20', fontSize: 27 },
  pageCount: { color: '#5a3a20', fontSize: 13, fontWeight: '700' },
});
