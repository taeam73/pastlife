import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { ExtendedResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ResultExperience } from '../src/components/ResultExperience';
import { Screen } from '../src/components/Screen';
import { loadPreferences, loadSession, saveViewMode, type ViewMode } from '../src/session/store';
import { startNewSession } from '../src/session/start';
import { colors } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';

type ExtendedResult = z.infer<typeof ExtendedResultResponseSchema>;
export default function PresentGuideScreen() {
  const router = useRouter(); const [result, setResult] = useState<ExtendedResult | null>(null); const [error, setError] = useState<string | null>(null); const [viewMode, setViewMode] = useState<ViewMode>('VIDEO'); const [muted, setMuted] = useState(false); const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => { void (async () => { const session = await loadSession(); if (!session?.resultId) return setError('결과 기록을 찾을 수 없습니다.'); try { const [loaded, preferences] = await Promise.all([api.guide(session.resultId), loadPreferences()]); setResult(loaded); setViewMode(session.viewMode); setMuted(!preferences.bgmEnabled); setReduceMotion(preferences.reduceMotion); } catch { setError('현생 가이드를 불러오지 못했습니다.'); } })(); }, []);
  const changeMode = async (mode: ViewMode) => { const session = await loadSession(); if (!session) return; setViewMode(mode); await Promise.all([api.setViewMode(session.sessionId, mode), saveViewMode(mode)]); void trackEvent('view_mode_changed', { sessionId: session.sessionId, contentVersion: session.contentVersion, viewMode: mode, ...(session.resultId ? { resultId: session.resultId } : {}) }); };
  const restart = async () => { await startNewSession('restart'); router.replace('/guide'); };
  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>; if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen><Text style={styles.headline}>현생 가이드</Text><ResultExperience image={result.image} blocks={result.blocks} viewMode={viewMode} durationMs={18_000} muted={muted} reduceMotion={reduceMotion} onMutedChange={setMuted} onViewModeChange={changeMode} /><Text style={styles.disclaimer}>{result.disclaimer}</Text><PrimaryButton onPress={() => void restart()}>또 다른 전생 기록 찾아보기</PrimaryButton></Screen>;
}
const styles = StyleSheet.create({ headline: { color: colors.text, fontSize: 27, fontWeight: '700' }, disclaimer: { color: colors.muted, marginTop: 16 }, error: { color: colors.error } });
