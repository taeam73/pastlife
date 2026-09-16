import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import type { z } from 'zod';
import { ExtendedResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { ResultBlock } from '../src/components/ResultBlock';
import { Screen } from '../src/components/Screen';
import { loadSession } from '../src/session/store';
import { colors } from '../src/theme/tokens';
type ExtendedResult = z.infer<typeof ExtendedResultResponseSchema>;
export default function PresentGuideScreen() { const [result, setResult] = useState<ExtendedResult | null>(null); const [error, setError] = useState<string | null>(null); useEffect(() => { void (async () => { const s = await loadSession(); if (!s?.resultId) return setError('결과 기록을 찾을 수 없습니다.'); try { setResult(await api.guide(s.resultId)); } catch { setError('현생 가이드를 불러오지 못했습니다.'); } })(); }, []); if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>; if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>; return <Screen><Text style={styles.headline}>현생 가이드</Text>{result.blocks.map((b) => <ResultBlock key={b.id} title={b.title} body={b.body} />)}<Text style={styles.disclaimer}>{result.disclaimer}</Text></Screen>; }
const styles = StyleSheet.create({ headline: { color: colors.text, fontSize: 27, fontWeight: '700' }, disclaimer: { color: colors.muted, marginTop: 16 }, error: { color: colors.error } });
