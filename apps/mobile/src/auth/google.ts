import { Platform } from 'react-native';

export const useMockGoogle = process.env.EXPO_PUBLIC_USE_MOCK_GOOGLE === 'true';

export const googleClientConfig = {
  ...(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    ? { webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID }
    : {}),
  ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
    ? { iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID }
    : {}),
  ...(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
    ? { androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID }
    : {}),
};

export function hasGoogleClientForPlatform(): boolean {
  if (Platform.OS === 'ios') return Boolean(googleClientConfig.iosClientId);
  if (Platform.OS === 'android') return Boolean(googleClientConfig.androidClientId);
  return Boolean(googleClientConfig.webClientId);
}
