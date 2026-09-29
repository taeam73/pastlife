import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { AppNav } from '../src/components/AppNav';
import { startNewSession } from '../src/session/start';
import { colors, spacing } from '../src/theme/tokens';

const backgrounds = [
  require('../assets/branding/main-bg-01.png'),
  require('../assets/branding/main-bg-02.png'),
  require('../assets/branding/main-bg-03.png'),
];
const logoMark = require('../assets/branding/logo-mark.png');

export default function StartScreen() {
  const router = useRouter();
  const background = useState(() => backgrounds[Math.floor(Math.random() * backgrounds.length)])[0];
  const logoOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [logoOpacity]);
  const start = async () => {
    await startNewSession();
    router.push('/guide');
  };
  return <ImageBackground source={background} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
    <View style={styles.overlay}>
      <Screen scroll={false}>
        <View style={styles.hero}>
          <Image source={logoMark} style={styles.logoMark} resizeMode="contain" />
          <Animated.Text style={[styles.brand, { opacity: logoOpacity }]}>전생록</Animated.Text>
          <Text style={styles.kicker}>PAST LIFE ARCHIVE</Text>
          <Text style={styles.title}>나는 언제, 어디에서,{ '\n' }어떤 사람이었을까?</Text>
          <Text style={styles.copy}>시간 너머에 남겨진 당신의 이야기를 찾아보세요.</Text>
          <PrimaryButton onPress={() => void start()}>나의 전생 찾아보기</PrimaryButton>
        </View>
        <AppNav />
      </Screen>
    </View>
  </ImageBackground>;
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.background },
  backgroundImage: { opacity: 0.82 },
  overlay: { flex: 1, backgroundColor: 'rgba(5, 10, 18, 0.48)' },
  hero: { flex: 1, justifyContent: 'center', gap: spacing.md, paddingTop: spacing.xl },
  logoMark: { width: 72, height: 72, alignSelf: 'flex-start', marginBottom: -8 },
  brand: { color: colors.accent, fontSize: 42, fontWeight: '800', letterSpacing: 2 },
  kicker: { color: 'rgba(244, 231, 193, 0.72)', fontSize: 11, letterSpacing: 3, marginTop: -10 },
  title: { color: colors.text, fontSize: 30, lineHeight: 40, fontWeight: '700' },
  copy: { color: '#D9DFE8', fontSize: 16, lineHeight: 24, marginBottom: spacing.md },
});
