import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { ExtendedResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ResultExperience } from '../src/components/ResultExperience';
import { Screen } from '../src/components/Screen';
import { loadSession } from '../src/session/store';
import { startNewSession } from '../src/session/start';
import { colors } from '../src/theme/tokens';
import { AppNav } from '../src/components/AppNav';

type ExtendedResult = z.infer<typeof ExtendedResultResponseSchema>;

export default function PresentGuideScreen() {
  const router = useRouter();
  const [result, setResult] = useState<ExtendedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const session = await loadSession();
      if (!session?.resultId) return setError('전생 이야기를 찾을 수 없어요. 처음부터 다시 시작해 주세요.');
      try { setResult(await api.guide(session.resultId)); }
      catch { setError('지금의 나를 위한 팁을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'); }
    })();
  }, []);

  const restart = async () => {
    await startNewSession('restart');
    router.replace('/guide');
  };

  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>;
  if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen>
    <Text style={styles.headline}>지금의 나를 위한 가이드</Text>
    <ResultExperience
      image={result.image}
      blocks={result.blocks}
      introTitle="지금의 당신으로 이어지는 네 개의 장면"
      introDescription="전생 이야기와 닮은 오늘의 순간을 따라가며, 다음 선택을 소설처럼 풀어봅니다."
    />
    {result.disclaimer ? <Text style={styles.disclaimer}>{result.disclaimer}</Text> : null}
    <PrimaryButton onPress={() => void restart()}>다른 전생 이야기 찾아보기</PrimaryButton>
    <AppNav />
  </Screen>;
}

const styles = StyleSheet.create({ headline: { color: colors.text, fontSize: 27, fontWeight: '700' }, disclaimer: { color: colors.muted, marginTop: 16 }, error: { color: colors.error } });
