import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { ExtendedResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ResultBlock } from '../src/components/ResultBlock';
import { Screen } from '../src/components/Screen';
import { loadSession } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';
type ExtendedResult = z.infer<typeof ExtendedResultResponseSchema>;
export default function DeepScreen() { const router = useRouter(); const [result, setResult] = useState<ExtendedResult | null>(null); const [error, setError] = useState<string | null>(null); useEffect(() => { void (async () => { const s = await loadSession(); if (!s?.resultId) return setError('결과 기록을 찾을 수 없습니다.'); try { setResult(await api.deep(s.resultId)); } catch { setError('심화 내용을 불러오지 못했습니다.'); } })(); }, []); if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>; if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>; return <Screen><Text style={styles.headline}>심화 내용</Text>{result.blocks.map((b) => <ResultBlock key={b.id} title={b.title} body={b.body} />)}<Text style={styles.disclaimer}>{result.disclaimer}</Text><PrimaryButton onPress={async () => { const s = await loadSession(); if (!s?.sessionId) return; await api.fakeAd(s.sessionId, 3); router.replace('/present-guide'); }}>광고 보고 현생 가이드 보기</PrimaryButton></Screen>; }
const styles = StyleSheet.create({ headline: { color: colors.text, fontSize: 27, fontWeight: '700', marginBottom: spacing.md }, disclaimer: { color: colors.muted, marginTop: spacing.md }, error: { color: colors.error } });
