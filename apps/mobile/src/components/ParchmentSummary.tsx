import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/tokens';

type ProfilePage = { title: string; body: string };

export function ParchmentSummary({ title, body, keyword, pages }: { title: string; body: string; keyword?: string | undefined; pages?: ProfilePage[] | undefined }) {
  const [pageIndex, setPageIndex] = useState(0);
  useEffect(() => setPageIndex(0), [body]);
  const visibleIndex = Math.min(pageIndex, Math.max(0, (pages?.length ?? 1) - 1));
  const page = pages?.[visibleIndex];
  return <View style={styles.panel}>
    <Text style={styles.title}>{title}</Text>
    {page ? <Text style={styles.pageTitle}>{page.title}</Text> : null}
    <Text testID="result-summary-page" style={[styles.body, page && styles.profileBody]}>{page?.body ?? body}</Text>
    {keyword && !page ? <Text style={styles.keyword}>{keyword}</Text> : null}
    {pages && pages.length > 1 ? <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel="이전 인물 소개 페이지" disabled={visibleIndex === 0} onPress={() => setPageIndex(visibleIndex - 1)} style={styles.arrow}><Text style={[styles.arrowText, visibleIndex === 0 && styles.disabled]}>‹</Text></Pressable>
      <Text style={styles.pageCount}>{visibleIndex + 1} / {pages.length}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="다음 인물 소개 페이지" disabled={visibleIndex === pages.length - 1} onPress={() => setPageIndex(visibleIndex + 1)} style={styles.arrow}><Text style={[styles.arrowText, visibleIndex === pages.length - 1 && styles.disabled]}>›</Text></Pressable>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', maxWidth: 760, minHeight: 122, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: '#b89456', backgroundColor: '#dcc79a', gap: 5 },
  title: { color: '#4a321e', fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' },
  body: { color: '#4a321e', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  profileBody: { textAlign: 'left' },
  pageTitle: { color: '#614020', fontSize: 14, lineHeight: 20, fontWeight: '700', textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#5a3a20', fontSize: 26 },
  disabled: { opacity: 0.35 },
  pageCount: { color: '#5a3a20', fontSize: 13, fontWeight: '700' },
  keyword: { color: '#76532b', fontSize: 12, lineHeight: 17, textAlign: 'center', fontWeight: '700' },
});
