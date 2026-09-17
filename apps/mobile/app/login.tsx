import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { api } from '../src/api/client';
import { googleClientConfig, hasGoogleClientForPlatform, useMockGoogle } from '../src/auth/google';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { loadSession, saveAuth } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';

WebBrowser.maybeCompleteAuthSession();

type CompleteLogin = (idToken: string) => Promise<void>;

function MockGoogleLogin({ complete, busy }: { complete: CompleteLogin; busy: boolean }) {
  return (
    <PrimaryButton disabled={busy} onPress={() => void complete('mock-google:e2e@example.com')}>
      테스트 계정으로 계속
    </PrimaryButton>
  );
}

function RealGoogleLogin({ complete, busy, onError }: { complete: CompleteLogin; busy: boolean; onError: (message: string) => void }) {
  const handledResponse = useRef<object | null>(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    { ...googleClientConfig, selectAccount: true },
    { scheme: 'pastlife', path: 'login' },
  );

  useEffect(() => {
    if (!response || handledResponse.current === response) return;
    handledResponse.current = response;
    if (response.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) void complete(idToken);
      else onError('Google에서 ID 토큰을 받지 못했습니다.');
    } else if (response.type === 'error') {
      onError('Google 로그인을 완료하지 못했습니다.');
    }
  }, [complete, onError, response]);

  return (
    <PrimaryButton disabled={!request || busy} onPress={() => void promptAsync()}>
      Google로 계속
    </PrimaryButton>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = hasGoogleClientForPlatform();

  const complete: CompleteLogin = async (idToken) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const session = await loadSession();
    void trackEvent('google_login_started', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), ...(resultId ? { resultId } : {}) });
    try {
      const auth = await api.exchangeGoogle(idToken);
      await saveAuth(auth);
      void trackEvent('google_login_completed', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), ...(resultId ? { resultId } : {}) });
      if (resultId) { await api.archive(resultId, auth.accessToken); void trackEvent('archive_saved', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId }); }
      router.replace(resultId ? '/archive' : '/');
    } catch {
      setError('로그인 또는 아카이브 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.eyebrow}>나의 기록 보관</Text>
      <Text style={styles.title}>Google 계정으로 로그인</Text>
      <Text style={styles.description}>
        로그인하면 이 전생 기록을 내 아카이브에 안전하게 저장할 수 있습니다.
      </Text>
      {useMockGoogle ? (
        <MockGoogleLogin complete={complete} busy={busy} />
      ) : configured ? (
        <RealGoogleLogin complete={complete} busy={busy} onError={setError} />
      ) : (
        <Text style={styles.error}>이 기기의 Google 로그인 설정이 아직 준비되지 않았습니다.</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton disabled={busy} onPress={() => router.back()}>돌아가기</PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.accent, fontSize: 15 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: spacing.md },
  error: { color: colors.error, fontSize: 14, lineHeight: 21 },
});
