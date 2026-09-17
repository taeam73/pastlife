import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppNav } from '../src/components/AppNav';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import {
  clearAuth,
  DEFAULT_PREFERENCES,
  loadAuth,
  loadPreferences,
  savePreferences,
  type AuthState,
  type Preferences,
} from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    void Promise.all([loadPreferences(), loadAuth()]).then(([nextPreferences, nextAuth]) => {
      setPreferences(nextPreferences);
      setAuth(nextAuth);
    });
  }, []);

  const change = (key: keyof Preferences, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    void savePreferences(next);
  };

  const logout = async () => {
    await clearAuth();
    setAuth(null);
    setConfirmLogout(false);
  };

  return <Screen>
    <Text style={styles.title}>설정</Text>
    <Setting label="배경 음악" value={preferences.bgmEnabled} onChange={(value) => change('bgmEnabled', value)} />
    <Setting label="효과음" value={preferences.effectsEnabled} onChange={(value) => change('effectsEnabled', value)} />
    <Setting label="동작 줄이기" value={preferences.reduceMotion} onChange={(value) => change('reduceMotion', value)} />
    <Text style={styles.note}>음악과 효과음 기본값은 출시 운영 설정으로 연결됩니다. 음소거나 동작 줄이기 선택은 이 기기에 저장됩니다.</Text>

    <View style={styles.accountCard}>
      <Text style={styles.sectionTitle}>계정</Text>
      {auth ? <>
        <Text style={styles.accountName}>{auth.user.name}</Text>
        <Text style={styles.accountEmail}>{auth.user.email}</Text>
        {confirmLogout ? <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>이 기기의 로그인 정보만 삭제되며 현재 전생 결과는 유지됩니다.</Text>
          <PrimaryButton onPress={() => void logout()}>로그아웃 확인</PrimaryButton>
          <PrimaryButton onPress={() => setConfirmLogout(false)}>취소</PrimaryButton>
        </View> : <PrimaryButton onPress={() => setConfirmLogout(true)}>로그아웃</PrimaryButton>}
      </> : <>
        <Text style={styles.accountEmail}>로그인하면 저장한 전생 기록을 다시 볼 수 있습니다.</Text>
        <PrimaryButton onPress={() => router.push('/login')}>Google 로그인</PrimaryButton>
      </>}
    </View>
    <AppNav />
  </Screen>;
}

function Setting({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Switch accessibilityLabel={label} value={value} onValueChange={onChange} /></View>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontWeight: '700' },
  row: { minHeight: 64, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.text, fontSize: 17 },
  note: { color: colors.muted, lineHeight: 22 },
  accountCard: { gap: spacing.sm, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  accountName: { color: colors.text, fontSize: 17, fontWeight: '600' },
  accountEmail: { color: colors.muted, lineHeight: 22 },
  confirmBox: { gap: spacing.sm, marginTop: spacing.sm },
  confirmText: { color: colors.text, lineHeight: 22 },
});
