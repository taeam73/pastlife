import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { parseContentLocale, type ContentLocale } from '@pastlife/content/locales';

const STORAGE_KEY = 'pastlife.session.v1';
export const RELEASE_CONTENT_VERSION = '3.0.0';
export type ViewMode = 'VIDEO' | 'TEXT';
export type SessionState = { sessionId: string; seed: string; contentVersion: string; viewMode: ViewMode; resultId?: string; locale?: ContentLocale };
const AUTH_KEY = 'pastlife.auth.v1';
const DEVICE_KEY = 'pastlife.device.v1';
const PREFERENCES_KEY = 'pastlife.preferences.v1';
export type AuthState = { accessToken: string; user: { id: string; email: string; name: string } };
export type Preferences = { bgmEnabled: boolean; effectsEnabled: boolean; reduceMotion: boolean };
export const DEFAULT_PREFERENCES: Preferences = { bgmEnabled: true, effectsEnabled: true, reduceMotion: false };

export async function saveSession(state: SessionState) {
  if (state.contentVersion !== RELEASE_CONTENT_VERSION) throw new Error('Unsupported content version');
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function loadSession(): Promise<SessionState | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return null;
  let parsed: Omit<SessionState, 'viewMode'> & { viewMode?: ViewMode };
  try { parsed = JSON.parse(value) as typeof parsed; }
  catch { await AsyncStorage.removeItem(STORAGE_KEY); return null; }
  if (parsed.contentVersion !== RELEASE_CONTENT_VERSION) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
  const { locale: storedLocale, ...rest } = parsed;
  const locale = parseContentLocale(storedLocale);
  return { ...rest, viewMode: parsed.viewMode ?? 'TEXT', ...(locale ? { locale } : {}) };
}

export async function saveResultId(resultId: string) {
  const current = await loadSession();
  if (current) await saveSession({ ...current, resultId });
}
export async function saveViewMode(viewMode: ViewMode) {
  const current = await loadSession();
  if (current) await saveSession({ ...current, viewMode });
}

export async function getOrCreateDeviceId() {
  const existing = await AsyncStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const created = Crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_KEY, created);
  return created;
}

export async function loadPreferences(): Promise<Preferences> {
  const value = await AsyncStorage.getItem(PREFERENCES_KEY);
  return value ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(value) as Partial<Preferences>) } : DEFAULT_PREFERENCES;
}

export async function savePreferences(preferences: Preferences) {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
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
