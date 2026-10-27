import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { startNewSession } from '../src/session/start';
import { loadPreferences, loadSession } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';
import { useTranslate } from '../src/i18n/locale';

const backgrounds = [
  require('../assets/branding/cinematic-start-bg.png'),
];
export default function GuideScreen() {
  const t = useTranslate();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const background = useState(() => backgrounds[Math.floor(Math.random() * backgrounds.length)])[0];
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(18)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    void loadPreferences().then((preferences) => {
      if (!active) return;
      if (preferences.reduceMotion) {
        contentOpacity.setValue(1);
        contentY.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 520, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(contentY, { toValue: 0, duration: 520, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    });
    return () => { active = false; };
  }, [contentOpacity, contentY]);

  useEffect(() => {
    let active = true;
    setReady(false);
    buttonOpacity.setValue(0);
    setError(null);
    void (async () => {
      try {
        const preparation = (async () => {
          const session = await loadSession();
          if (!session || session.resultId) await startNewSession(session?.resultId ? 'restart' : 'main');
        })();
        await Promise.all([preparation, new Promise((resolve) => setTimeout(resolve, 2000))]);
        if (active) setReady(true);
      } catch {
        if (active) setError(t('질문을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.'));
      }
    })();
    return () => { active = false; };
  }, [buttonOpacity, retry, t]);

  useEffect(() => {
    if (!ready) return;
    Animated.timing(buttonOpacity, { toValue: 1, duration: 420, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [buttonOpacity, ready]);

  return <ImageBackground source={background} resizeMode="cover" style={[styles.background, { width, height }]} imageStyle={styles.backgroundImage}>
    <View style={styles.overlay}>
      <Screen scroll={false} transparent>
        <Animated.View style={[styles.content, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}>
          <Text style={styles.eyebrow}>{t('기억의 조각')}</Text>
          <Text style={styles.title}>{t('기억은 생각보다\n먼저 반응합니다.')}</Text>
          <Text style={styles.body}>{t('너무 오래 고민하지 말고,\n가장 먼저 마음이 가는 것을 선택해 주세요.')}</Text>
          {error ? <View style={styles.retry}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><PrimaryButton onPress={() => setRetry((value) => value + 1)}>{t('다시 시도')}</PrimaryButton></View> : null}
          {ready ? <Animated.View style={[styles.buttonWrap, { opacity: buttonOpacity }]}><PrimaryButton leadingIcon="✦" onPress={() => router.replace('/question/1')}>{t('질문 시작하기')}</PrimaryButton></Animated.View> : null}
        </Animated.View>
      </Screen>
    </View>
  </ImageBackground>;
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.background },
  backgroundImage: { opacity: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(5, 10, 18, 0.30)' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.md, transform: [{ translateY: -58 }] },
  eyebrow: { color: colors.accent, fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xs },
  title: { color: colors.text, fontSize: 30, lineHeight: 40, fontWeight: '700', textAlign: 'center' },
  body: { color: '#D9DFE8', fontSize: 17, lineHeight: 28, textAlign: 'center', marginTop: spacing.sm },
  error: { color: colors.error, fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: spacing.sm },
  retry: { width: '100%', maxWidth: 420, gap: spacing.sm },
  buttonWrap: { width: '100%', maxWidth: 420, marginTop: spacing.lg },
});
