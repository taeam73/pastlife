import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { AppNav } from '../src/components/AppNav';
import { startNewSession } from '../src/session/start';
import { colors, spacing } from '../src/theme/tokens';

export default function StartScreen() {
  const router = useRouter();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [logoOpacity]);
  const start = async () => {
    await startNewSession();
    router.push('/guide');
  };
  return <Screen scroll={false}><View style={styles.hero}><Animated.Text style={[styles.brand, { opacity: logoOpacity }]}>전생록</Animated.Text><Text style={styles.title}>나는 언제, 어디에서,{ '\n' }어떤 사람이었을까?</Text><Text style={styles.copy}>당신의 전생을 찾아드립니다.</Text><PrimaryButton onPress={() => void start()}>나의 전생 찾아보기</PrimaryButton></View><AppNav /></Screen>;
}

const styles = StyleSheet.create({ hero: { flex: 1, justifyContent: 'center', gap: spacing.lg }, brand: { color: colors.accent, fontSize: 20, letterSpacing: 4 }, title: { color: colors.text, fontSize: 32, lineHeight: 44, fontWeight: '700' }, copy: { color: colors.muted, fontSize: 17, lineHeight: 26 } });
