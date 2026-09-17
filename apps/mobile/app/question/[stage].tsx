import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { api } from '../../src/api/client';
import { ChoiceButton } from '../../src/components/ChoiceButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Screen } from '../../src/components/Screen';
import { loadSession } from '../../src/session/store';
import { colors } from '../../src/theme/tokens';
import type { z } from 'zod';
import type { QuestionResponseSchema } from '@pastlife/contracts';
import { trackEvent } from '../../src/analytics/track';

type Question = z.infer<typeof QuestionResponseSchema>;

export default function QuestionScreen() {
  const { stage: stageParam } = useLocalSearchParams<{ stage: string }>();
  const stage = Number(stageParam);
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadSession().then(async (session) => {
      if (!session) { router.replace('/'); return; }
      try { const value = await api.question(session.sessionId, stage); if (active) setQuestion(value); void trackEvent('question_shown', { sessionId: session.sessionId, questionId: value.id, stage: value.stage, contentVersion: session.contentVersion, locale: 'ko' }); }
      catch { if (active) setError('질문을 불러오지 못했습니다. 다시 시도해 주세요.'); }
    });
    return () => { active = false; };
  }, [router, stage]);

  const choose = async (choiceId: string) => {
    if (!question || busy) return;
    setBusy(true); setError(null);
    try {
      const session = await loadSession();
      if (!session) { router.replace('/'); return; }
      await api.answer(session.sessionId, stage, question.id, choiceId);
      void trackEvent('answer_selected', { sessionId: session.sessionId, questionId: question.id, choiceId, stage, contentVersion: session.contentVersion, locale: 'ko' });
      if (stage === 6) void trackEvent('questions_completed', { sessionId: session.sessionId, contentVersion: session.contentVersion, locale: 'ko', sessionStatus: 'QUESTION_COMPLETE' });
      router.replace(stage === 6 ? '/analysis' : `/question/${stage + 1}`);
    } catch { setBusy(false); setError('선택을 저장하지 못했습니다. 다시 선택해 주세요.'); }
  };

  return <Screen><ProgressBar stage={stage} /><Text style={styles.stage}>{stage}/6</Text>{question ? <><Text style={styles.question}>{question.text}</Text>{question.choices.map((choice) => <ChoiceButton key={choice.id} label={choice.text} disabled={busy} onPress={() => void choose(choice.id)} />)}</> : <ActivityIndicator color={colors.accent} />}{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}</Screen>;
}

const styles = StyleSheet.create({ stage: { color: colors.muted, fontSize: 14 }, question: { color: colors.text, fontSize: 25, lineHeight: 35, fontWeight: '700', marginVertical: 20 }, error: { color: colors.error, fontSize: 15 } });
