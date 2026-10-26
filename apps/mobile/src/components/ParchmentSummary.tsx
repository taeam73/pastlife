import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/tokens';
import { ParchmentLineReveal } from './ParchmentLineReveal';

type ProfilePage = { title: string; body: string };

function ProfileBody({ body }: { body: string }) {
  const items = body.split('\n').filter(Boolean).map((line, index) => {
    const [label, ...rest] = line.split(/\s*·\s*/u);
    const value = rest.join(' · ');
    return value ? <View key={`${label}-${index}`} style={styles.profileItem}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View> : <Text key={`${line}-${index}`} style={styles.profileValue}>{line}</Text>;
  });
  return <ParchmentLineReveal items={items} style={styles.profileList} />;
}

export function ParchmentSummary({ title, body, keyword, pages, fullPage = false, pageIndex = 0, onPageChange }: { title: string; body: string; keyword?: string | undefined; pages?: ProfilePage[] | undefined; fullPage?: boolean; pageIndex?: number; onPageChange?: ((index: number) => void) | undefined }) {
  const visibleIndex = Math.min(pageIndex, Math.max(0, (pages?.length ?? 1) - 1));
  const page = pages?.[visibleIndex];
  return <View style={[styles.panel, fullPage && styles.fullPagePanel]}>
    {fullPage ? <Image source={require('../../assets/parchment/reader-texture.png')} resizeMode="stretch" style={styles.texture} accessible={false} /> : null}
    <Text style={[styles.title, fullPage && styles.fullPageTitle]}>{title}</Text>
    {page ? <Text style={styles.pageTitle}>{page.title}</Text> : null}
    <View testID="result-summary-page" style={styles.bodyFrame}>{page ? <ProfileBody key={`${visibleIndex}-${page.title}`} body={page.body} /> : <ParchmentLineReveal items={body.split('\n').filter(Boolean).map((line, index) => <Text key={index} style={styles.body}>{line}</Text>)} />}</View>
    {keyword && !page ? <Text style={styles.keyword}>{keyword}</Text> : null}
    {fullPage ? <View style={styles.spacer} /> : null}
    {pages && pages.length > 1 ? <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel="이전 인물 소개 페이지" disabled={visibleIndex === 0} onPress={() => onPageChange?.(visibleIndex - 1)} style={styles.arrow}><Text style={[styles.arrowText, visibleIndex === 0 && styles.disabled]}>‹</Text></Pressable>
      <Text style={styles.pageCount}>{visibleIndex + 1} / {pages.length}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="다음 인물 소개 페이지" disabled={visibleIndex === pages.length - 1} onPress={() => onPageChange?.(visibleIndex + 1)} style={styles.arrow}><Text style={[styles.arrowText, visibleIndex === pages.length - 1 && styles.disabled]}>›</Text></Pressable>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', maxWidth: 760, minHeight: 122, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: '#b89456', backgroundColor: '#dcc79a', gap: 5 },
  fullPagePanel: { height: '100%', maxWidth: 980, paddingTop: 20, paddingBottom: 8, paddingHorizontal: 22, borderWidth: 2, overflow: 'hidden', gap: 6 },
  texture: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  spacer: { flex: 1 },
  title: { color: '#4a321e', fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' },
  fullPageTitle: { fontSize: 22, lineHeight: 28 },
  body: { color: '#4a321e', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  bodyFrame: { width: '100%' },
  profileList: { width: '100%', gap: 7, paddingTop: 2 },
  profileItem: { width: '100%', gap: 1 },
  profileLabel: { color: '#7b5127', fontSize: 13, lineHeight: 17, fontWeight: '800' },
  profileValue: { color: '#3f2b1c', fontSize: 15, lineHeight: 22, fontWeight: '500' },
  pageTitle: { color: '#76502a', fontSize: 15, lineHeight: 20, fontWeight: '800', textAlign: 'center', paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(122, 79, 37, 0.28)' },
  controls: { position: 'absolute', top: 10, right: 12, zIndex: 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  arrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#5a3a20', fontSize: 24 },
  disabled: { opacity: 0.35 },
  pageCount: { color: '#5a3a20', fontSize: 13, fontWeight: '700' },
  keyword: { color: '#76532b', fontSize: 12, lineHeight: 17, textAlign: 'center', fontWeight: '700' },
});
