import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { ParchmentButton } from '../src/components/ParchmentButton';
import { AppNav } from '../src/components/AppNav';
import { startNewSession } from '../src/session/start';
import { loadPreferences } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';

const backgrounds = [
  require('../assets/branding/cinematic-start-bg.png'),
  require('../assets/branding/cinematic-start-bg-egypt.png'),
  require('../assets/branding/cinematic-start-bg-venice.png'),
  require('../assets/branding/cinematic-start-bg-sahara.png'),
  require('../assets/branding/cinematic-start-bg-andes.png'),
];
export default function StartScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
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

  return <ImageBackground source={background} resizeMode="cover" style={[styles.background, { width, height }]} imageStyle={styles.backgroundImage}>
    <View style={styles.overlay}>
      <Screen scroll={false} transparent>
        <View style={styles.hero}>
          <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentY }] }}>
            <Image accessibilityLabel="전생록" source={require('../assets/branding/title-logo-cinematic.png')} resizeMode="contain" style={styles.titleLogo} />
            <Text style={styles.kicker}>PAST LIFE ARCHIVE</Text>
            <Text style={styles.title}>나는 언제, 어디에서,{ '\n' }어떤 삶을 살았을까?</Text>
            <Text style={styles.copy}>시간 너머의 뜻밖의 이야기에서, 지금의 마음과 닮은 장면을 찾아보세요.</Text>
          </Animated.View>
          <Animated.View style={{ opacity: buttonOpacity, transform: [{ translateY: buttonY }] }}>
            <ParchmentButton label="나의 전생 찾아보기" onPress={() => void start()} />
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
  titleLogo: { width: 260, height: 92, alignSelf: 'center', marginBottom: spacing.sm },
  kicker: { color: 'rgba(244, 231, 193, 0.78)', fontSize: 11, letterSpacing: 3, marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: 30, lineHeight: 40, fontWeight: '700' },
  copy: { color: '#D9DFE8', fontSize: 16, lineHeight: 24, marginTop: spacing.md },
});
