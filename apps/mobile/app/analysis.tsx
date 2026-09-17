import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { loadSession, saveResultId } from '../src/session/store';
import { colors } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';

export default function AnalysisScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      const session = await loadSession();
      if (!session) { router.replace('/'); return; }
      try {
        const completed = session.resultId ? { resultId: session.resultId } : await api.complete(session.sessionId);
        await saveResultId(completed.resultId);
        const status = await api.status(completed.resultId);
        void trackEvent(status.imageStatus === 'FALLBACK' ? 'image_fallback_used' : 'image_ready', { sessionId: session.sessionId, resultId: completed.resultId, contentVersion: session.contentVersion, imageStatus: status.imageStatus === 'FALLBACK' ? 'FALLBACK' : 'READY' });
        void trackEvent('ad_started', { sessionId: session.sessionId, resultId: completed.resultId, adPlacement: 1, contentVersion: session.contentVersion });
        try { await api.fakeAd1(session.sessionId); }
        catch (error) { void trackEvent('ad_failed', { sessionId: session.sessionId, resultId: completed.resultId, adPlacement: 1, contentVersion: session.contentVersion }); throw error; }
        void trackEvent('ad_completed', { sessionId: session.sessionId, resultId: completed.resultId, adPlacement: 1, contentVersion: session.contentVersion });
        if (active) router.replace('/result');
      } catch { if (active) setError('복원 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'); }
    })();
    return () => { active = false; };
  }, [retry, router]);

  return <Screen scroll={false}><Text style={styles.title}>당신의 전생 기록을 복원하고 있습니다</Text><ActivityIndicator color={colors.accent} size="large" />{error ? <><Text accessibilityRole="alert" style={styles.error}>{error}</Text><PrimaryButton onPress={() => { setError(null); setRetry((value) => value + 1); }}>다시 시도</PrimaryButton></> : null}</Screen>;
}

const styles = StyleSheet.create({ title: { color: colors.text, fontSize: 26, lineHeight: 36, fontWeight: '700', flex: 1, justifyContent: 'center' }, error: { color: colors.error, fontSize: 16 } });
