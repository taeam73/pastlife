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
import { loadSession } from '../src/session/store';
import { startNewSession } from '../src/session/start';
import { colors, spacing } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';
import { AppNav } from '../src/components/AppNav';

type ExtendedResult = z.infer<typeof ExtendedResultResponseSchema>;

export default function DeepScreen() {
  const router = useRouter();
  const [result, setResult] = useState<ExtendedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const session = await loadSession();
      if (!session?.resultId) return setError('전생 이야기를 찾을 수 없어요. 처음부터 다시 시작해 주세요.');
      try {
        setResult(await api.deep(session.resultId));
      } catch {
        setError('더 자세한 이야기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    })();
  }, []);

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
    <Text style={styles.headline}>더 자세한 전생 이야기</Text>
    <ResultExperience
      image={result.image}
      blocks={result.blocks}
      introTitle="기록 뒤에 숨은 네 개의 이야기"
      introDescription="기록보기에서 다 하지 못한 마음과 인연, 선택의 뒷이야기가 네 장의 소설로 이어집니다."
    />
    {result.disclaimer ? <Text style={styles.disclaimer}>{result.disclaimer}</Text> : null}
    <UnlockAction label="지금의 나를 위한 팁 보기" loadingLabel="광고 확인 중…" onUnlock={unlockGuide} />
    <PrimaryButton onPress={() => void restart()}>다른 전생 이야기 찾아보기</PrimaryButton>
    <AppNav />
  </Screen>;
}

const styles = StyleSheet.create({
  headline: { color: colors.text, fontSize: 27, fontWeight: '700', marginBottom: spacing.md },
  disclaimer: { color: colors.muted, marginTop: spacing.md },
  error: { color: colors.error },
});
