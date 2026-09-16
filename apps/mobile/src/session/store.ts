import AsyncStorage from '@react-native-async-storage/async-storage';

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
export async function saveAuth(auth: AuthState) { await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth)); }
export async function loadAuth(): Promise<AuthState | null> { const value = await AsyncStorage.getItem(AUTH_KEY); return value ? (JSON.parse(value) as AuthState) : null; }
