import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { paginateText } from '../results/paginate';
import { spacing } from '../theme/tokens';

export function ParchmentReader({ title, body, chapterKey }: { title: string; body: string; chapterKey: string }) {
  const { width: windowWidth } = useWindowDimensions();
  const pages = paginateText(body, windowWidth < 768 ? 100 : 190);
  const [width, setWidth] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    setPageIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [chapterKey]);
  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(pages.length - 1, index));
    setPageIndex(next);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  };
  return <View testID="chapter-reader-panel" style={styles.panel} onLayout={(event) => setWidth(Math.round(event.nativeEvent.layout.width))}>
    <Image source={require('../../assets/parchment/reader-texture.png')} resizeMode="stretch" style={styles.texture} accessibilityIgnoresInvertColors />
    <Text style={styles.title}>{title}</Text>
    <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.pages} onMomentumScrollEnd={(event) => { if (width > 0) setPageIndex(Math.round(event.nativeEvent.contentOffset.x / width)); }} accessibilityLabel={`${chapterKey} 내용`}>
      {pages.map((page, index) => <View key={`${chapterKey}-${index}`} style={[styles.page, { width: width || windowWidth - spacing.md * 2 }]}><Text style={styles.body}>{page}</Text></View>)}
    </ScrollView>
    {pages.length > 1 ? <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel="이전 글 페이지" disabled={pageIndex === 0} onPress={() => goTo(pageIndex - 1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
      <Text style={styles.pageCount}>{pageIndex + 1} / {pages.length}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="다음 글 페이지" disabled={pageIndex === pages.length - 1} onPress={() => goTo(pageIndex + 1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', maxWidth: 980, height: '100%', paddingTop: spacing.lg * 2, paddingBottom: spacing.md, borderRadius: 16, borderWidth: 2, borderColor: '#a4783d', backgroundColor: '#dcc79a', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  texture: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  title: { color: '#4a321e', fontSize: 24, lineHeight: 32, fontWeight: '800', textAlign: 'center', paddingHorizontal: spacing.md },
  pages: { width: '100%', flex: 1, marginTop: spacing.sm },
  page: { height: '100%', justifyContent: 'center', paddingHorizontal: spacing.lg },
  body: { color: '#4a321e', fontSize: 17, lineHeight: 28, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.sm },
  arrow: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#5a3a20', fontSize: 27 },
  pageCount: { color: '#5a3a20', fontSize: 13, fontWeight: '700' },
});
