import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { separateDialogueParagraphs, splitDialogueSegments } from '../results/dialogue';
import { spacing } from '../theme/tokens';
import { ParchmentLineReveal } from './ParchmentLineReveal';
import { MeasuredPageFlow } from './MeasuredPageFlow';
import { localeText, useLocale } from '../i18n/locale';

function PageItems({ items, style, measuring }: { items: ReactNode[]; style: object; measuring: boolean }) {
  return measuring ? <View style={style}>{items.map((item, index) => <View key={index}>{item}</View>)}</View> : <ParchmentLineReveal items={items} style={style} />;
}

function ProsePage({ body, separateDialogue = false, measuring }: { body: string; separateDialogue?: boolean; measuring: boolean }) {
  const paragraphs = body.split(/\n{2,}/u).filter(Boolean);
  const segments = separateDialogue
    ? paragraphs.flatMap(splitDialogueSegments)
    : paragraphs.map((text) => ({ kind: 'narration' as const, text }));
  return <PageItems measuring={measuring} items={segments.map((segment, index) => <Text key={index} style={[styles.body, segment.kind === 'dialogue' && styles.dialogue]}>{segment.text}</Text>)} style={styles.proseList} />;
}

function TimelinePage({ body, measuring }: { body: string; measuring: boolean }) {
  const items = body.split('\n').filter(Boolean).map((line, index) => {
    const [label, ...rest] = line.split(/\s*·\s*/u);
    const detail = rest.join(' · ');
    return <View key={`${label}-${index}`} style={styles.entry}>
      {detail ? <Text style={styles.entryLabel}>{label}</Text> : null}
      <Text style={styles.entryBody}>{detail || line}</Text>
    </View>;
  });
  return <PageItems measuring={measuring} items={items} style={styles.entryList} />;
}

function MemoryPage({ body, measuring }: { body: string; measuring: boolean }) {
  const items = body.split(/\n{2,}/u).filter(Boolean).map((item, index) => {
    const [label, ...detailLines] = item.split('\n');
    const detail = detailLines.join('\n');
    return <View key={`${label}-${index}`} style={styles.memoryEntry}>
      <Text style={styles.entryLabel}>{label}</Text>
      <Text style={[styles.entryBody, /^[“"]/u.test(detail) && styles.quote]}>{detail}</Text>
    </View>;
  });
  return <PageItems measuring={measuring} items={items} style={styles.entryList} />;
}

function FormattedPage({ chapterKey, body, measuring }: { chapterKey: string; body: string; measuring: boolean }) {
  if (chapterKey === 'CHOICE') return <TimelinePage body={body} measuring={measuring} />;
  if (chapterKey === 'NOW') return <MemoryPage body={body} measuring={measuring} />;
  return <ProsePage body={body} separateDialogue={chapterKey === 'TRIAL'} measuring={measuring} />;
}

export function ParchmentReader({ title, body, chapterKey, pageIndex = 0, onPageChange, onPageCountChange }: { title: string; body: string; chapterKey: string; pageIndex?: number; onPageChange?: ((index: number) => void) | undefined; onPageCountChange?: ((count: number) => void) | undefined }) {
  const { locale } = useLocale();
  const [pageCount, setPageCount] = useState(1);
  const pageBody = chapterKey === 'TRIAL' ? separateDialogueParagraphs(body) : body;
  const sources = useMemo(() => [{ body: pageBody }], [pageBody]);
  const onCount = useCallback((count: number) => { setPageCount(count); onPageCountChange?.(count); }, [onPageCountChange]);
  const renderPage = useCallback((_source: { body: string }, text: string, measuring: boolean) => <FormattedPage key={`${chapterKey}-${text}`} chapterKey={chapterKey} body={text} measuring={measuring} />, [chapterKey]);
  const visibleIndex = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(pageCount - 1, index));
    onPageChange?.(next);
  };
  return <View testID="chapter-reader-panel" style={styles.panel}>
    <Image source={require('../../assets/parchment/reader-texture.png')} resizeMode="stretch" style={styles.texture} accessibilityIgnoresInvertColors />
    <Text style={styles.title}>{title}</Text>
    <View style={styles.pages} accessibilityLabel={localeText(locale, { ko: `${chapterKey} 내용`, en: `${title} content`, th: `เนื้อหา ${title}`, ja: `${title}の本文` })}>
      <View style={styles.page}><MeasuredPageFlow testID="chapter-text-page" sources={sources} pageIndex={visibleIndex} onPageCountChange={onCount} renderPage={renderPage} /></View>
    </View>
    {pageCount > 1 ? <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel={localeText(locale, { ko: '이전 글 페이지', en: 'Previous story page', th: 'หน้าเรื่องก่อนหน้า', ja: '前のページ' })} disabled={visibleIndex === 0} onPress={() => goTo(visibleIndex - 1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
      <Text style={styles.pageCount}>{visibleIndex + 1} / {pageCount}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={localeText(locale, { ko: '다음 글 페이지', en: 'Next story page', th: 'หน้าเรื่องถัดไป', ja: '次のページ' })} disabled={visibleIndex === pageCount - 1} onPress={() => goTo(visibleIndex + 1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', maxWidth: 980, height: '100%', paddingTop: spacing.lg * 2, paddingBottom: spacing.md, borderRadius: 16, borderWidth: 2, borderColor: '#a4783d', backgroundColor: '#dcc79a', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  texture: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  title: { color: '#4a321e', fontSize: 24, lineHeight: 32, fontWeight: '800', textAlign: 'center', paddingHorizontal: spacing.md },
  pages: { width: '100%', flex: 1, marginTop: spacing.sm },
  page: { flex: 1, justifyContent: 'flex-start', paddingHorizontal: spacing.md, paddingTop: spacing.md },
  proseList: { width: '100%', gap: 10 },
  body: { color: '#3f2b1c', fontSize: 16, lineHeight: 27, textAlign: 'left' },
  dialogue: { paddingHorizontal: spacing.sm, color: '#51351f', fontWeight: '600' },
  entryList: { width: '100%', gap: spacing.md },
  entry: { width: '100%', gap: 4, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(122, 79, 37, 0.2)' },
  memoryEntry: { width: '100%', gap: 5 },
  entryLabel: { color: '#76502a', fontSize: 15, lineHeight: 21, fontWeight: '800' },
  entryBody: { color: '#3f2b1c', fontSize: 16, lineHeight: 27 },
  quote: { paddingLeft: spacing.sm, borderLeftWidth: 3, borderLeftColor: 'rgba(122, 79, 37, 0.42)', fontStyle: 'italic' },
  controls: { position: 'absolute', top: 13, right: 14, zIndex: 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  arrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#5a3a20', fontSize: 24 },
  pageCount: { color: '#5a3a20', fontSize: 13, fontWeight: '700' },
});
