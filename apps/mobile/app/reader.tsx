import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, ImageBackground, NativeSyntheticEvent, NativeScrollEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import type { BasicResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { Screen } from '../src/components/Screen';
import { loadSession } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';

type BasicResult = z.infer<typeof BasicResultResponseSchema>;

export default function ReaderScreen() {
  const router = useRouter();
  const [result, setResult] = useState<BasicResult | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pagerRef = useRef<ScrollView>(null);

  useEffect(() => {
    void (async () => {
      const session = await loadSession();
      if (!session?.resultId) { setError('전생 기록을 찾을 수 없어요.'); return; }
      try { setResult(await api.basic(session.resultId)); }
      catch { setError('상세 이야기를 불러오지 못했어요.'); }
    })();
  }, []);

  const pages = useMemo(() => {
    if (!result) return [];
    return result.blocks.map((block) => ({ title: block.title, body: block.body }));
  }, [result]);
  const current = pages[page];
  const moveTo = (nextPage: number) => {
    pagerRef.current?.scrollTo({ x: nextPage * Dimensions.get('window').width, animated: true });
    setPage(nextPage);
  };
  const goNext = () => page < pages.length - 1 ? moveTo(page + 1) : router.replace('/result');
  const goPrevious = () => page > 0 ? moveTo(page - 1) : router.replace('/result');

  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>;
  if (!result || !current) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width));
  return <ImageBackground source={require('../assets/branding/question-bg-manuscript.png')} resizeMode="stretch" style={styles.background}><View pointerEvents="none" style={styles.overlay} /><Screen transparent scroll={false}><View style={styles.reader}><View style={styles.readerHeader}><Pressable accessibilityRole="button" accessibilityLabel="결과 화면으로 돌아가기" onPress={() => router.replace('/result')} style={styles.backLink}><Text style={styles.backLinkText}>‹ 결과로 돌아가기</Text></Pressable><Text style={styles.counter}>{page + 1}/{pages.length}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((page + 1) / pages.length) * 100}%` }]} /></View><ScrollView ref={pagerRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScrollEnd} style={styles.pager} contentContainerStyle={styles.pagerContent}>{pages.map((item, index) => <View key={`${item.title}-${index}`} style={styles.page}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageContent}><Text style={styles.pageTitle}>{item.title}</Text><Text style={styles.pageBody}>{item.body}</Text></ScrollView></View>)}</ScrollView><View style={styles.dots}>{pages.map((item, index) => <View key={`${item.title}-dot-${index}`} style={[styles.dot, index === page && styles.activeDot]} />)}</View><View style={styles.controls}><Pressable accessibilityRole="button" accessibilityLabel="이전 이야기" onPress={goPrevious} style={styles.controlButton}><Text style={styles.controlText}>‹ 이전</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={page === pages.length - 1 ? '결과로 돌아가기' : '다음 이야기'} onPress={goNext} style={styles.nextButton}><Text style={styles.nextText}>{page === pages.length - 1 ? '결과 보기' : '다음 ›'}</Text></Pressable></View></View></Screen></ImageBackground>;
}

const styles = StyleSheet.create({ background: { flex: 1 }, overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12, 8, 5, 0.58)' }, reader: { flex: 1, paddingTop: 44, paddingBottom: spacing.md, gap: spacing.md }, readerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, backLink: { paddingVertical: 6, paddingRight: spacing.md }, backLinkText: { color: '#f1dfb2', fontFamily: 'MaruBuri', fontSize: 14 }, counter: { color: '#f1dfb2', fontFamily: 'MaruBuri', fontSize: 14, opacity: 0.7 }, progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(35, 22, 13, 0.65)' }, progressFill: { height: '100%', backgroundColor: colors.accent }, pager: { flex: 1, marginHorizontal: -spacing.lg }, pagerContent: { flexGrow: 1 }, page: { width: Dimensions.get('window').width - spacing.lg * 2, flex: 1, marginHorizontal: spacing.lg, backgroundColor: 'rgba(42, 25, 13, 0.68)', borderColor: 'rgba(217, 177, 92, 0.58)', borderWidth: 1, borderRadius: 18, padding: spacing.lg, shadowColor: '#120802', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, pageContent: { paddingVertical: spacing.sm }, pageTitle: { color: '#f1dfb2', fontFamily: 'MaruBuriBold', fontSize: 23, lineHeight: 34, marginBottom: spacing.md }, pageBody: { color: '#fff8e8', fontFamily: 'MaruBuri', fontSize: 18, lineHeight: 32 }, dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(241, 223, 178, 0.35)' }, activeDot: { width: 22, backgroundColor: colors.accent }, controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, controlButton: { minWidth: 96, paddingVertical: 13, paddingHorizontal: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(217, 177, 92, 0.58)', alignItems: 'center' }, controlText: { color: '#f1dfb2', fontFamily: 'MaruBuriBold', fontSize: 15 }, nextButton: { minWidth: 112, paddingVertical: 13, paddingHorizontal: spacing.md, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center' }, nextText: { color: colors.background, fontFamily: 'MaruBuriBold', fontSize: 15 }, error: { color: colors.error, fontSize: 16 } });
