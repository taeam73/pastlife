import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { AppNav } from '../src/components/AppNav';
import { startNewSession } from '../src/session/start';
import { loadPreferences } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';

const backgrounds = [
  require('../assets/branding/main-bg-01.png'),
  require('../assets/branding/main-bg-02.png'),
  require('../assets/branding/main-bg-03.png'),
];
export default function StartScreen() {
  const router = useRouter();
  const background = useState(() => backgrounds[Math.floor(Math.random() * backgrounds.length)])[0];
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(18)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    let active = true;
    void loadPreferences().then((preferences) => {
      if (!active) return;
      if (preferences.reduceMotion) {
        contentOpacity.setValue(1);
        contentY.setValue(0);
        buttonOpacity.setValue(1);
        buttonY.setValue(0);
        return;
      }
      Animated.sequence([
        Animated.parallel([
          Animated.timing(contentOpacity, { toValue: 1, duration: 420, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(contentY, { toValue: 0, duration: 420, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        Animated.parallel([
          Animated.timing(buttonOpacity, { toValue: 1, duration: 360, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(buttonY, { toValue: 0, duration: 360, useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ]).start();
    });
    return () => { active = false; };
  }, [buttonOpacity, buttonY, contentOpacity, contentY]);

  const start = async () => {
    await startNewSession();
    router.push('/guide');
  };

  return <ImageBackground source={background} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
    <View style={styles.overlay}>
      <Screen scroll={false} transparent>
        <View style={styles.hero}>
          <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentY }] }}>
            <Text style={styles.kicker}>PAST LIFE ARCHIVE</Text>
            <Text style={styles.title}>나는 언제, 어디에서,{ '\n' }어떤 사람이었을까?</Text>
            <Text style={styles.copy}>시간 너머에 남겨진 당신의 이야기를 찾아보세요.</Text>
          </Animated.View>
          <Animated.View style={{ opacity: buttonOpacity, transform: [{ translateY: buttonY }] }}>
            <PrimaryButton leadingIcon="✦" onPress={() => void start()}>나의 전생 찾아보기</PrimaryButton>
          </Animated.View>
        </View>
        <AppNav />
      </Screen>
    </View>
  </ImageBackground>;
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.background },
  backgroundImage: { opacity: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(5, 10, 18, 0.20)' },
  hero: { flex: 1, justifyContent: 'flex-start', gap: spacing.md, paddingTop: 148 },
  kicker: { color: 'rgba(244, 231, 193, 0.78)', fontSize: 11, letterSpacing: 3, marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: 30, lineHeight: 40, fontWeight: '700' },
  copy: { color: '#D9DFE8', fontSize: 16, lineHeight: 24, marginTop: spacing.md },
});
