import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { AudioExperience } from '../src/audio/AudioExperience';
import { LocaleProvider } from '../src/i18n/locale';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { clearLegacyAuth } from '../src/session/store';

export default function Layout() {
  useEffect(() => { void clearLegacyAuth().catch(() => undefined); }, []);
  const [fontsLoaded] = useFonts({
    MaruBuri: require('../assets/fonts/MaruBuri-Regular.ttf'),
    MaruBuriBold: require('../assets/fonts/MaruBuri-Bold.ttf'),
  });

  if (!fontsLoaded) return null;
  return <SafeAreaProvider><LocaleProvider><AudioExperience><Stack screenOptions={{ headerShown: false, animation: 'fade' }} /></AudioExperience></LocaleProvider></SafeAreaProvider>;
}
