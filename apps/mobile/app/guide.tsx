import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { startNewSession } from '../src/session/start';
import { loadSession } from '../src/session/store';
import { colors } from '../src/theme/tokens';

export default function GuideScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beginQuestions = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const session = await loadSession();
      if (!session || session.resultId) await startNewSession(session?.resultId ? 'restart' : 'main');
      router.replace('/question/1');
    } catch {
      setBusy(false);
      setError('질문을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return <Screen scroll={false}><Text style={styles.eyebrow}>기억의 조각</Text><Text style={styles.title}>기억은 생각보다 먼저 반응합니다.</Text><Text style={styles.body}>너무 오래 고민하지 말고, 가장 먼저 마음이 가는 것을 선택해 주세요.</Text>{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<PrimaryButton disabled={busy} onPress={() => void beginQuestions()}>{busy ? '질문 준비 중' : '질문 시작하기'}</PrimaryButton></Screen>;
}

const styles = StyleSheet.create({ eyebrow: { color: colors.accent, fontSize: 15, marginTop: 48 }, title: { color: colors.text, fontSize: 28, lineHeight: 38, fontWeight: '700' }, body: { color: colors.muted, fontSize: 18, lineHeight: 29, flex: 1 }, error: { color: colors.error, fontSize: 15, lineHeight: 23, marginBottom: 12 } });
