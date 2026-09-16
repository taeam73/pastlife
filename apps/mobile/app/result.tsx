import { useEffect, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { BasicResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ResultBlock } from '../src/components/ResultBlock';
import { Screen } from '../src/components/Screen';
import { loadAuth, loadSession } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';
type BasicResult = z.infer<typeof BasicResultResponseSchema>;
export default function ResultScreen() {
  const router = useRouter(); const [result, setResult] = useState<BasicResult | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { void (async () => { const session = await loadSession(); if (!session?.resultId) { setError('결과 기록을 찾을 수 없습니다.'); return; } try { setResult(await api.basic(session.resultId)); } catch { setError('기본 결과를 불러오지 못했습니다.'); } })(); }, []);
  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>; if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen><Text style={styles.eyebrow}>전생 기록 No.{String(result.recordNo).padStart(2, '0')}</Text><Text style={styles.headline}>{result.headline}</Text><View accessible accessibilityLabel={result.image.alt} style={styles.imagePlaceholder}><Text style={styles.imageText}>기록 이미지</Text></View>{result.blocks.map((block) => <ResultBlock key={block.id} title={block.title} body={block.body} />)}<Text style={styles.disclaimer}>{result.disclaimer}</Text><PrimaryButton onPress={async () => { const session = await loadSession(); if (!session?.sessionId) return; await api.fakeAd(session.sessionId, 2); router.replace('/deep'); }}>광고 보고 심화 내용 보기</PrimaryButton><PrimaryButton onPress={async () => { const link = await api.share(result.resultId); await Share.share({ message: link.shareUrl, url: link.shareUrl }); }}>결과 공유하기</PrimaryButton><PrimaryButton onPress={async () => { const auth = await loadAuth(); if (!auth) { router.push({ pathname: './login', params: { resultId: result.resultId } }); return; } await api.archive(result.resultId, auth.accessToken); router.replace('/archive'); }}>아카이브에 저장하기</PrimaryButton></Screen>;
}
const styles = StyleSheet.create({ eyebrow: { color: colors.accent, fontSize: 15 }, headline: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '700' }, imagePlaceholder: { minHeight: 180, borderRadius: 16, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' }, imageText: { color: colors.muted, fontSize: 16 }, disclaimer: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.md }, error: { color: colors.error, fontSize: 16 } });
