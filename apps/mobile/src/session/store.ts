import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'pastlife.session.v1';
export type SessionState = { sessionId: string; seed: string; contentVersion: string; resultId?: string };
const AUTH_KEY = 'pastlife.auth.v1';
export type AuthState = { accessToken: string; user: { id: string; email: string; name: string } };

export async function saveSession(state: SessionState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function loadSession(): Promise<SessionState | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value ? (JSON.parse(value) as SessionState) : null;
}

export async function saveResultId(resultId: string) {
  const current = await loadSession();
  if (current) await saveSession({ ...current, resultId });
}
async function setAuthValue(value: string) {
  if (Platform.OS === 'web') await AsyncStorage.setItem(AUTH_KEY, value);
  else await SecureStore.setItemAsync(AUTH_KEY, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}

async function getAuthValue() {
  return Platform.OS === 'web'
    ? AsyncStorage.getItem(AUTH_KEY)
    : SecureStore.getItemAsync(AUTH_KEY);
}

export async function saveAuth(auth: AuthState) { await setAuthValue(JSON.stringify(auth)); }
export async function loadAuth(): Promise<AuthState | null> { const value = await getAuthValue(); return value ? (JSON.parse(value) as AuthState) : null; }
export async function clearAuth() {
  if (Platform.OS === 'web') await AsyncStorage.removeItem(AUTH_KEY);
  else await SecureStore.deleteItemAsync(AUTH_KEY);
}
