import { useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import type { z } from 'zod';
import type { QuestionResponseSchema } from '@pastlife/contracts';
import { api } from '../../src/api/client';
import { ChoiceButton } from '../../src/components/ChoiceButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Screen } from '../../src/components/Screen';
import { loadPreferences, loadSession } from '../../src/session/store';
import { colors } from '../../src/theme/tokens';
import { trackEvent } from '../../src/analytics/track';
import { playChoiceEffect } from '../../src/audio/effects';
import { useLocale, useTranslate } from '../../src/i18n/locale';

type Question = z.infer<typeof QuestionResponseSchema>;

export default function QuestionScreen() {
  const { locale } = useLocale();
  const t = useTranslate();
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
        void trackEvent('question_shown', { sessionId: session.sessionId, questionId: value.id, stage: value.stage, contentVersion: session.contentVersion, locale });
      } catch { if (active) setError(t('질문을 불러오지 못했어요. 다시 시도해 주세요.')); }
    });
    return () => { active = false; };
  }, [router, stage, locale, t]);

  const choose = async (choiceId: string) => {
    if (!question || busy) return;
    void playChoiceEffect();
    setSelectedChoiceId(choiceId); setBusy(true); setError(null);
    try {
      const session = await loadSession();
      if (!session) { router.replace('/'); return; }
      await api.answer(session.sessionId, stage, question.id, choiceId);
      void trackEvent('answer_selected', { sessionId: session.sessionId, questionId: question.id, choiceId, stage, contentVersion: session.contentVersion, locale });
      if (stage === 6) void trackEvent('questions_completed', { sessionId: session.sessionId, contentVersion: session.contentVersion, locale, sessionStatus: 'QUESTION_COMPLETE' });
      router.replace(stage === 6 ? '/analysis' : `/question/${stage + 1}`);
    } catch { setBusy(false); setSelectedChoiceId(null); setError(t('선택을 저장하지 못했어요. 다시 선택해 주세요.')); }
  };

  return <ImageBackground source={require('../../assets/branding/cinematic-question-bg.png')} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}><View pointerEvents="none" style={styles.overlay} /><Screen transparent logoInContent><View testID="question-screen" style={styles.questionScreen}><View style={styles.progressRow}><ProgressBar stage={stage} /><Text style={styles.stage}>{stage}/6</Text></View>{question ? <QuestionSequence trigger={question.id} question={<Text style={styles.question}>{question.text}</Text>} choices={question.choices.map((choice) => <ChoiceButton key={choice.id} label={choice.text} selected={selectedChoiceId === choice.id} disabled={busy} onPress={() => void choose(choice.id)} />)} /> : <ActivityIndicator color={colors.accent} />}{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}</View></Screen></ImageBackground>;
}

function QuestionSequence({ trigger, question, choices }: { trigger: string; question: ReactNode; choices: ReactNode[] }) {
  const questionOpacity = useRef(new Animated.Value(0)).current;
  const questionY = useRef(new Animated.Value(12)).current;
  const choiceOpacity = useRef(choices.map(() => new Animated.Value(0))).current;
  const choiceY = useRef(choices.map(() => new Animated.Value(10))).current;

  useEffect(() => {
    let active = true;
    questionOpacity.setValue(0);
    questionY.setValue(12);
    choiceOpacity.forEach((value) => value.setValue(0));
    choiceY.forEach((value) => value.setValue(10));
    void loadPreferences().then((preferences) => {
      if (!active) return;
      if (preferences.reduceMotion) {
        questionOpacity.setValue(1);
        questionY.setValue(0);
        choiceOpacity.forEach((value) => value.setValue(1));
        choiceY.forEach((value) => value.setValue(0));
        return;
      }
      Animated.sequence([
        Animated.parallel([
          Animated.timing(questionOpacity, { toValue: 1, duration: 260, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(questionY, { toValue: 0, duration: 260, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        Animated.stagger(45, choices.map((_, index) => Animated.parallel([
          Animated.timing(choiceOpacity[index]!, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(choiceY[index]!, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
        ]))),
      ]).start();
    });
    return () => { active = false; };
  }, [choiceOpacity, choiceY, questionOpacity, questionY, trigger]);

  return <View>
    <Animated.View style={{ opacity: questionOpacity, transform: [{ translateY: questionY }] }}>{question}</Animated.View>
    <View style={styles.choices}>{choices.map((choice, index) => <Animated.View key={index} style={{ opacity: choiceOpacity[index]!, transform: [{ translateY: choiceY[index]! }] }}>{choice}</Animated.View>)}</View>
  </View>;
}

const styles = StyleSheet.create({ background: { flex: 1 }, backgroundImage: { width: '100%', height: '100%' }, overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12, 8, 5, 0.54)' }, questionScreen: { paddingTop: 6, gap: 10 }, progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, stage: { width: 34, color: '#f1dfb2', fontSize: 13, opacity: 0.7, textAlign: 'right' }, question: { color: '#fff8e8', fontFamily: 'MaruBuriBold', fontSize: 21, lineHeight: 30, fontWeight: '700', marginTop: 12, marginBottom: 8, paddingHorizontal: 2, textAlign: 'center', textShadowColor: 'rgba(35, 16, 4, 0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 }, choices: { width: '98%', maxWidth: 580, alignSelf: 'center', gap: 9 }, error: { color: '#ffd7a0', fontSize: 15 } });
