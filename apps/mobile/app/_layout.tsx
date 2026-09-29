import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    MaruBuri: require('../assets/fonts/MaruBuri-Regular.ttf'),
    MaruBuriBold: require('../assets/fonts/MaruBuri-Bold.ttf'),
  });

  if (!fontsLoaded) return null;
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
