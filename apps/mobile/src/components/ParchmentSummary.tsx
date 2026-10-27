import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/tokens';
import { ParchmentLineReveal } from './ParchmentLineReveal';
import { MeasuredPageFlow, type PageSource } from './MeasuredPageFlow';
import { localeText, useLocale } from '../i18n/locale';

type ProfilePage = { title: string; body: string };

function ProfileBody({ body, measuring = false }: { body: string; measuring?: boolean }) {
  const items = body.split('\n').filter(Boolean).map((line, index) => {
    const [label, ...rest] = line.split(/\s*·\s*/u);
    const value = rest.join(' · ');
    return value ? <View key={`${label}-${index}`} style={styles.profileItem}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View> : <Text key={`${line}-${index}`} style={styles.profileValue}>{line}</Text>;
  });
  return measuring ? <View style={styles.profileList}>{items.map((item, index) => <View key={index}>{item}</View>)}</View> : <ParchmentLineReveal items={items} style={styles.profileList} />;
}

export function ParchmentSummary({ title, body, keyword, pages, fullPage = false, pageIndex = 0, onPageChange, onPageCountChange }: { title: string; body: string; keyword?: string | undefined; pages?: ProfilePage[] | undefined; fullPage?: boolean; pageIndex?: number; onPageChange?: ((index: number) => void) | undefined; onPageCountChange?: ((count: number) => void) | undefined }) {
  const { locale } = useLocale();
  const [pageCount, setPageCount] = useState(pages?.length ?? 1);
  const sources = useMemo<PageSource[]>(() => pages?.length ? pages : [{ body }], [body, pages]);
  const onCount = useCallback((count: number) => { setPageCount(count); onPageCountChange?.(count); }, [onPageCountChange]);
  const renderPage = useCallback((source: PageSource, text: string, measuring: boolean) => <>
    {source.title ? <Text style={styles.pageTitle}>{source.title}</Text> : null}
    {pages?.length ? <ProfileBody key={`${source.title}-${text}`} body={text} measuring={measuring} />
      : measuring ? <View>{text.split('\n').filter(Boolean).map((line, index) => <Text key={index} style={styles.body}>{line}</Text>)}</View>
        : <ParchmentLineReveal items={text.split('\n').filter(Boolean).map((line, index) => <Text key={index} style={styles.body}>{line}</Text>)} />}
  </>, [pages]);
  const visibleIndex = Math.min(pageIndex, Math.max(0, pageCount - 1));
  return <View style={[styles.panel, fullPage ? styles.fullPagePanel : styles.compactPanel]}>
    {fullPage ? <Image source={require('../../assets/parchment/reader-texture.png')} resizeMode="stretch" style={styles.texture} accessible={false} /> : null}
    <Text style={[styles.title, fullPage && styles.fullPageTitle]}>{title}</Text>
    <View style={styles.fullPageBody}><MeasuredPageFlow testID="result-summary-page" sources={sources} pageIndex={visibleIndex} onPageCountChange={onCount} renderPage={renderPage} /></View>
    {keyword && !pages?.length ? <Text style={styles.keyword}>{keyword}</Text> : null}
    {pageCount > 1 ? <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel={localeText(locale, { ko: '이전 인물 소개 페이지', en: 'Previous profile page', th: 'หน้าข้อมูลตัวละครก่อนหน้า', ja: '前の人物紹介ページ' })} disabled={visibleIndex === 0} onPress={() => onPageChange?.(visibleIndex - 1)} style={styles.arrow}><Text style={[styles.arrowText, visibleIndex === 0 && styles.disabled]}>‹</Text></Pressable>
      <Text style={styles.pageCount}>{visibleIndex + 1} / {pageCount}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={localeText(locale, { ko: '다음 인물 소개 페이지', en: 'Next profile page', th: 'หน้าข้อมูลตัวละครถัดไป', ja: '次の人物紹介ページ' })} disabled={visibleIndex === pageCount - 1} onPress={() => onPageChange?.(visibleIndex + 1)} style={styles.arrow}><Text style={[styles.arrowText, visibleIndex === pageCount - 1 && styles.disabled]}>›</Text></Pressable>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', maxWidth: 760, minHeight: 122, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: '#b89456', backgroundColor: '#dcc79a', gap: 5 },
  compactPanel: { height: 185 },
  fullPagePanel: { height: '100%', maxWidth: 980, paddingTop: 52, paddingBottom: 8, paddingHorizontal: 22, borderWidth: 2, overflow: 'hidden', gap: 6 },
  texture: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  fullPageBody: { flex: 1, width: '100%', minHeight: 0 },
  title: { color: '#4a321e', fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' },
  fullPageTitle: { fontSize: 22, lineHeight: 28 },
  body: { color: '#4a321e', fontSize: 14, lineHeight: 21, textAlign: 'center' },
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
