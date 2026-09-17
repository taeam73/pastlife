import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { ExtendedResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ResultExperience } from '../src/components/ResultExperience';
import { Screen } from '../src/components/Screen';
import { UnlockAction } from '../src/components/UnlockAction';
import { loadPreferences, loadSession, saveViewMode, type ViewMode } from '../src/session/store';
import { startNewSession } from '../src/session/start';
import { colors, spacing } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';

type ExtendedResult = z.infer<typeof ExtendedResultResponseSchema>;

export default function DeepScreen() {
  const router = useRouter();
  const [result, setResult] = useState<ExtendedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('VIDEO');
  const [muted, setMuted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void (async () => {
      const session = await loadSession();
      if (!session?.resultId) return setError('결과 기록을 찾을 수 없습니다.');
      try {
        const [loaded, preferences] = await Promise.all([api.deep(session.resultId), loadPreferences()]);
        setResult(loaded);
        setViewMode(session.viewMode);
        setMuted(!preferences.bgmEnabled);
        setReduceMotion(preferences.reduceMotion);
      } catch {
        setError('심화 내용을 불러오지 못했습니다.');
      }
    })();
  }, []);

  const changeMode = async (mode: ViewMode) => {
    const session = await loadSession();
    if (!session) return;
    setViewMode(mode);
    await Promise.all([api.setViewMode(session.sessionId, mode), saveViewMode(mode)]);
    void trackEvent('view_mode_changed', { sessionId: session.sessionId, contentVersion: session.contentVersion, viewMode: mode, ...(session.resultId ? { resultId: session.resultId } : {}) });
  };

  const unlockGuide = async () => {
    if (!result) throw new Error('Result is unavailable');
    const session = await loadSession();
    if (!session?.sessionId) throw new Error('Session is unavailable');
    void trackEvent('guide_cta_clicked', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion });
    void trackEvent('ad_started', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 3 });
    try {
      await api.fakeAd(session.sessionId, 3);
    } catch (error) {
      void trackEvent('ad_failed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 3 });
      throw error;
    }
    void trackEvent('ad_completed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 3 });
    void trackEvent('guide_unlocked', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion });
    router.replace('/present-guide');
  };

  const restart = async () => {
    await startNewSession('restart');
    router.replace('/guide');
  };

  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>;
  if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;

  return <Screen>
    <Text style={styles.headline}>심화 내용</Text>
    <ResultExperience image={result.image} blocks={result.blocks} viewMode={viewMode} durationMs={12_000} muted={muted} reduceMotion={reduceMotion} onMutedChange={setMuted} onViewModeChange={changeMode} />
    <Text style={styles.disclaimer}>{result.disclaimer}</Text>
    <UnlockAction label="현생 가이드 보기" loadingLabel="광고 확인 중…" onUnlock={unlockGuide} />
    <PrimaryButton onPress={() => void restart()}>또 다른 전생 기록 찾아보기</PrimaryButton>
  </Screen>;
}

const styles = StyleSheet.create({
  headline: { color: colors.text, fontSize: 27, fontWeight: '700', marginBottom: spacing.md },
  disclaimer: { color: colors.muted, marginTop: spacing.md },
  error: { color: colors.error },
});
