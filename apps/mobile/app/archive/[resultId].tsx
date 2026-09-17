import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { z } from 'zod';
import { ArchiveDetailResponseSchema } from '@pastlife/contracts';
import { api } from '../../src/api/client';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ResultExperience } from '../../src/components/ResultExperience';
import { Screen } from '../../src/components/Screen';
import { loadAuth, loadPreferences, type ViewMode } from '../../src/session/store';
import { colors, spacing } from '../../src/theme/tokens';

type ArchiveDetail = z.infer<typeof ArchiveDetailResponseSchema>;

export default function ArchiveDetailScreen() {
  const router = useRouter();
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  const [detail, setDetail] = useState<ArchiveDetail | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('VIDEO');
  const [muted, setMuted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void (async () => {
    const auth = await loadAuth();
    if (!auth || !resultId) { setError('이 기록을 열려면 로그인이 필요합니다.'); return; }
    try {
      const [loaded, preferences] = await Promise.all([api.archiveDetail(resultId, auth.accessToken), loadPreferences()]);
      setDetail(loaded); setViewMode(loaded.viewMode); setMuted(!preferences.bgmEnabled); setReduceMotion(preferences.reduceMotion);
    } catch { setError('저장된 기록을 열 수 없습니다. 아카이브에서 다시 선택해 주세요.'); }
  })(); }, [resultId]);
  if (error) return <Screen><Text style={styles.error}>{error}</Text><PrimaryButton onPress={() => router.replace('/archive')}>아카이브로 돌아가기</PrimaryButton></Screen>;
  if (!detail) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen><Text style={styles.eyebrow}>저장된 전생 기록 No.{String(detail.recordNo).padStart(2, '0')}</Text><Text style={styles.headline}>{detail.headline}</Text><ResultExperience image={detail.image} blocks={detail.blocks} viewMode={viewMode} durationMs={18_000} muted={muted} reduceMotion={reduceMotion} onMutedChange={setMuted} onViewModeChange={setViewMode} /><Text style={styles.disclaimer}>{detail.disclaimer}</Text><PrimaryButton onPress={() => router.replace('/archive')}>나의 전생으로 돌아가기</PrimaryButton></Screen>;
}

const styles = StyleSheet.create({ eyebrow: { color: colors.accent, fontSize: 15 }, headline: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '700' }, disclaimer: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.md }, error: { color: colors.error, lineHeight: 23 } });
