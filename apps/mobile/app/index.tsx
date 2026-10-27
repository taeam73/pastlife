import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { ParchmentButton } from '../src/components/ParchmentButton';
import { AppNav } from '../src/components/AppNav';
import { loadPreferences } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';
import { useLocale, useTranslate } from '../src/i18n/locale';

const backgrounds = [
  require('../assets/branding/cinematic-start-bg.png'),
  require('../assets/branding/cinematic-start-bg-egypt.png'),
  require('../assets/branding/cinematic-start-bg-venice.png'),
  require('../assets/branding/cinematic-start-bg-sahara.png'),
  require('../assets/branding/cinematic-start-bg-andes.png'),
];
export default function StartScreen() {
  const { locale } = useLocale();
  const t = useTranslate();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const background = useState(() => backgrounds[Math.floor(Math.random() * backgrounds.length)])[0];
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const sceneShade = useRef(new Animated.Value(1)).current;
  const contentY = useRef(new Animated.Value(18)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    let active = true;
    void loadPreferences().then((preferences) => {
      if (!active) return;
      if (preferences.reduceMotion) {
        sceneShade.setValue(0);
        contentOpacity.setValue(1);
        contentY.setValue(0);
        buttonOpacity.setValue(1);
        buttonY.setValue(0);
        return;
      }
      Animated.sequence([
        Animated.parallel([
          Animated.timing(sceneShade, { toValue: 0, duration: 520, useNativeDriver: Platform.OS !== 'web' }),
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
  }, [buttonOpacity, buttonY, contentOpacity, contentY, sceneShade]);

  // Keep the first tap responsive. Session creation needs the network and can
  // take a few seconds on a cold start, so the guide screen owns that work and
  // provides an explicit loading/error state when the user starts the questions.
  const start = () => router.push('/guide');

  return <ImageBackground source={background} resizeMode="cover" style={[styles.background, { width, height }]} imageStyle={styles.backgroundImage}>
    <View style={styles.overlay}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.sceneShade, { opacity: sceneShade }]} />
      <Screen scroll={false} transparent>
        <View style={styles.hero}>
          <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentY }] }}>
            {locale !== 'ko' ? <Text style={[styles.titleLogo, styles.englishLogo]}>{locale === 'en' ? 'PAST LIFE ARCHIVE' : t('전생록')}</Text> : <Image accessibilityLabel={t('전생록')} source={require('../assets/branding/title-logo-cinematic.png')} resizeMode="contain" style={styles.titleLogo} />}
            {locale === 'ko' ? <Text style={styles.kicker}>PAST LIFE ARCHIVE</Text> : null}
            <Text style={styles.title}>{t('나는 언제, 어디에서,\n어떤 삶을 살았을까?')}</Text>
            <Text style={styles.copy}>{t('시간 너머의 뜻밖의 이야기에서, 지금의 마음과 닮은 장면을 찾아보세요.')}</Text>
          </Animated.View>
          <Animated.View style={{ opacity: buttonOpacity, transform: [{ translateY: buttonY }] }}>
            <ParchmentButton label={t('나의 전생 찾아보기')} onPress={start} />
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
  sceneShade: { backgroundColor: colors.background },
  hero: { flex: 1, justifyContent: 'flex-start', gap: spacing.md, paddingTop: 128 },
  titleLogo: { width: 260, height: 92, alignSelf: 'center', marginBottom: spacing.sm }, englishLogo: { color: '#f4e6bf', fontSize: 24, fontWeight: '900', textAlign: 'center', paddingTop: 28 },
  kicker: { color: 'rgba(244, 231, 193, 0.78)', fontSize: 11, letterSpacing: 3, marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: 30, lineHeight: 40, fontWeight: '700' },
  copy: { color: '#D9DFE8', fontSize: 16, lineHeight: 24, marginTop: spacing.md },
});
