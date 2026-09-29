import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { startNewSession } from '../src/session/start';
import { loadSession } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';

const backgrounds = [
  require('../assets/branding/main-bg-01.png'),
  require('../assets/branding/main-bg-02.png'),
  require('../assets/branding/main-bg-03.png'),
];
export default function GuideScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const background = useState(() => backgrounds[Math.floor(Math.random() * backgrounds.length)])[0];
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 650, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(contentY, { toValue: 0, duration: 650, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [contentOpacity, contentY]);

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

  return <ImageBackground source={background} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
    <View style={styles.overlay}>
      <Screen scroll={false} transparent>
        <Animated.View style={[styles.content, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}>
          <Text style={styles.eyebrow}>기억의 조각</Text>
          <Text style={styles.title}>기억은 생각보다{ '\n' }먼저 반응합니다.</Text>
          <Text style={styles.body}>너무 오래 고민하지 말고,{ '\n' }가장 먼저 마음이 가는 것을 선택해 주세요.</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <View style={styles.buttonWrap}><PrimaryButton leadingIcon="✦" disabled={busy} onPress={() => void beginQuestions()}>{busy ? '질문 준비 중' : '질문 시작하기'}</PrimaryButton></View>
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
  buttonWrap: { width: '100%', maxWidth: 420, marginTop: spacing.lg },
});
