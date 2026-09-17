import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { ArchiveItemSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { Screen } from '../src/components/Screen';
import { AppNav } from '../src/components/AppNav';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { loadAuth } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';

type Item = z.infer<typeof ArchiveItemSchema>;

export default function ArchiveScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void (async () => {
    const auth = await loadAuth();
    if (!auth) { setError('저장한 전생 기록을 보려면 로그인이 필요합니다.'); return; }
    try { setItems((await api.archiveList(auth.accessToken)).items); }
    catch { setError('아카이브를 불러오지 못했습니다. 다시 시도해 주세요.'); }
  })(); }, []);
  if (error) return <Screen><Text style={styles.error}>{error}</Text><PrimaryButton onPress={() => router.push('/login')}>로그인하기</PrimaryButton><AppNav /></Screen>;
  if (!items) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen><Text style={styles.title}>나의 전생</Text>{items.length === 0 ? <Text style={styles.empty}>저장된 전생 기록이 없습니다.</Text> : items.map((item) => <Pressable accessibilityRole="button" accessibilityLabel={`전생 기록 ${item.recordNo} ${item.headline}`} key={item.resultId} onPress={() => router.push({ pathname: '/archive/[resultId]' as never, params: { resultId: item.resultId } })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><Text style={styles.record}>No.{String(item.recordNo).padStart(2, '0')}</Text><Text style={styles.headline}>{item.headline}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</Text><Text style={styles.open}>기록 열기</Text></Pressable>)}<AppNav /></Screen>;
}

const styles = StyleSheet.create({ title: { color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: spacing.lg }, card: { backgroundColor: colors.surfaceRaised, borderRadius: 16, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border }, pressed: { opacity: 0.8 }, record: { color: colors.accent }, headline: { color: colors.text, fontSize: 18, marginTop: 4 }, date: { color: colors.muted, marginTop: 8 }, open: { color: colors.accent, fontWeight: '700', marginTop: spacing.sm }, empty: { color: colors.muted }, error: { color: colors.error, lineHeight: 23 } });
