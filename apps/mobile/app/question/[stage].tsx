import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, View } from 'react-native';
import type { z } from 'zod';
import type { QuestionResponseSchema } from '@pastlife/contracts';
import { api } from '../../src/api/client';
import { ChoiceButton } from '../../src/components/ChoiceButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Screen } from '../../src/components/Screen';
import { loadSession } from '../../src/session/store';
import { colors } from '../../src/theme/tokens';
import { trackEvent } from '../../src/analytics/track';

type Question = z.infer<typeof QuestionResponseSchema>;

export default function QuestionScreen() {
  const { stage: stageParam } = useLocalSearchParams<{ stage: string }>();
  const stage = Number(stageParam);
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadSession().then(async (session) => {
      if (!session) { router.replace('/'); return; }
      try {
        const value = await api.question(session.sessionId, stage);
        if (active) setQuestion(value);
        void trackEvent('question_shown', { sessionId: session.sessionId, questionId: value.id, stage: value.stage, contentVersion: session.contentVersion, locale: 'ko' });
      } catch { if (active) setError('질문을 불러오지 못했어요. 다시 시도해 주세요.'); }
    });
    return () => { active = false; };
  }, [router, stage]);

  const choose = async (choiceId: string) => {
    if (!question || busy) return;
    setSelectedChoiceId(choiceId); setBusy(true); setError(null);
    try {
      const session = await loadSession();
      if (!session) { router.replace('/'); return; }
      await api.answer(session.sessionId, stage, question.id, choiceId);
      void trackEvent('answer_selected', { sessionId: session.sessionId, questionId: question.id, choiceId, stage, contentVersion: session.contentVersion, locale: 'ko' });
      if (stage === 6) void trackEvent('questions_completed', { sessionId: session.sessionId, contentVersion: session.contentVersion, locale: 'ko', sessionStatus: 'QUESTION_COMPLETE' });
      router.replace(stage === 6 ? '/analysis' : `/question/${stage + 1}`);
    } catch { setBusy(false); setSelectedChoiceId(null); setError('선택을 저장하지 못했어요. 다시 선택해 주세요.'); }
  };

  return <ImageBackground source={require('../../assets/branding/question-bg-manuscript.png')} resizeMode="stretch" style={styles.background} imageStyle={styles.backgroundImage}><View pointerEvents="none" style={styles.overlay} /><Screen transparent><View style={styles.questionScreen}><View style={styles.progressRow}><ProgressBar stage={stage} /><Text style={styles.stage}>{stage}/6</Text></View>{question ? <><Text style={styles.question}>{question.text}</Text><View style={styles.choices}>{question.choices.map((choice) => <ChoiceButton key={choice.id} label={choice.text} selected={selectedChoiceId === choice.id} disabled={busy} onPress={() => void choose(choice.id)} />)}</View></> : <ActivityIndicator color={colors.accent} />}{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}</View></Screen></ImageBackground>;
}

const styles = StyleSheet.create({ background: { flex: 1 }, backgroundImage: { width: '100%', height: '100%' }, overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12, 8, 5, 0.54)' }, questionScreen: { paddingTop: 44, gap: 14 }, progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, stage: { width: 34, color: '#f1dfb2', fontSize: 14, opacity: 0.6, textAlign: 'right' }, question: { color: '#fff8e8', fontFamily: 'MaruBuriBold', fontSize: 24, lineHeight: 36, fontWeight: '700', marginTop: 18, marginBottom: 12, textShadowColor: 'rgba(35, 16, 4, 0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 }, choices: { width: '90%', alignSelf: 'center', gap: 14 }, error: { color: '#ffd7a0', fontSize: 15 } });
