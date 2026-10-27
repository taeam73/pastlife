import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppNav } from '../src/components/AppNav';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { SubpageHeader } from '../src/components/SubpageHeader';
import {
  clearAuth,
  DEFAULT_PREFERENCES,
  loadAuth,
  loadPreferences,
  loadSession,
  savePreferences,
  saveSession,
  type AuthState,
  type Preferences,
} from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';
import { adPrivacyOptionsRequired, showAdPrivacyOptions } from '../src/ads/admob';
import { localeText, useLocale, useTranslate } from '../src/i18n/locale';
import { contentLocales, isContentLocaleAvailable, selectableContentLocales, type ContentLocale } from '@pastlife/content/locales';

export default function SettingsScreen() {
  const { locale, setLocale } = useLocale();
  const t = useTranslate();
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showAdPrivacy, setShowAdPrivacy] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [languageError, setLanguageError] = useState(false);

  useEffect(() => {
    void Promise.all([loadPreferences(), loadAuth()]).then(([nextPreferences, nextAuth]) => {
      setPreferences(nextPreferences);
      setAuth(nextAuth);
    });
  }, []);

  useEffect(() => { void adPrivacyOptionsRequired().then(setShowAdPrivacy).catch(() => undefined); }, []);

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

  const changeLanguage = async (next: ContentLocale) => {
    if (changingLanguage || next === locale) return;
    setChangingLanguage(true);
    setLanguageError(false);
    try {
      const session = await loadSession();
      if (session) {
        await api.setSessionLocale(session.sessionId, next);
        await saveSession({ ...session, locale: next });
      }
      await setLocale(next);
    } catch {
      setLanguageError(true);
    } finally {
      setChangingLanguage(false);
    }
  };

  return <Screen>
    <SubpageHeader title={t('설정')} />
    <Text style={styles.sectionTitle}>{t('언어')}</Text>
    <View style={styles.languageRow}>{selectableContentLocales(process.env.NODE_ENV === 'production').map((choice) => <PrimaryButton key={choice} disabled={changingLanguage} onPress={() => void changeLanguage(choice)}>{locale === choice ? '✓ ' : ''}{t(contentLocales[choice].uiNameKey)}{!isContentLocaleAvailable(choice, true) ? ` (${t('미리보기')})` : ''}</PrimaryButton>)}</View>
    {languageError ? <Text accessibilityRole="alert" style={styles.languageError}>{localeText(locale, { ko: '언어를 변경하지 못했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.', en: 'Could not change the language. Check your connection and try again.', th: 'เปลี่ยนภาษาไม่ได้ โปรดตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง', ja: '言語を変更できませんでした。通信状態を確認して、もう一度お試しください。' })}</Text> : null}
    <Setting label={t('배경 음악')} value={preferences.bgmEnabled} onChange={(value) => change('bgmEnabled', value)} />
    <Setting label={t('효과음')} value={preferences.effectsEnabled} onChange={(value) => change('effectsEnabled', value)} />
    <Setting label={t('동작 줄이기')} value={preferences.reduceMotion} onChange={(value) => change('reduceMotion', value)} />
    <Text style={styles.note}>{t('음악과 효과음 기본값은 출시 운영 설정으로 연결됩니다. 음소거나 동작 줄이기 선택은 이 기기에 저장됩니다.')}</Text>
    {showAdPrivacy ? <PrimaryButton onPress={() => { void showAdPrivacyOptions(); }}>{t('광고 개인정보 설정')}</PrimaryButton> : null}

    <View style={styles.accountCard}>
      <Text style={styles.sectionTitle}>{t('계정')}</Text>
      {auth ? <>
        <Text style={styles.accountName}>{auth.user.name}</Text>
        <Text style={styles.accountEmail}>{auth.user.email}</Text>
        {confirmLogout ? <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>{t('이 기기의 로그인 정보만 삭제되며 현재 전생 결과는 유지됩니다.')}</Text>
          <PrimaryButton onPress={() => void logout()}>{t('로그아웃 확인')}</PrimaryButton>
          <PrimaryButton onPress={() => setConfirmLogout(false)}>{t('취소')}</PrimaryButton>
        </View> : <PrimaryButton onPress={() => setConfirmLogout(true)}>{t('로그아웃')}</PrimaryButton>}
      </> : <>
        <Text style={styles.accountEmail}>{t('로그인하면 저장한 전생 기록을 다시 볼 수 있습니다.')}</Text>
        <PrimaryButton onPress={() => router.push('/login')}>{t('Google 로그인')}</PrimaryButton>
      </>}
    </View>
    <AppNav />
  </Screen>;
}

function Setting({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Switch accessibilityLabel={label} value={value} onValueChange={onChange} /></View>;
}

const styles = StyleSheet.create({
  languageRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }, row: { minHeight: 64, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.text, fontSize: 17 },
  note: { color: colors.muted, lineHeight: 22 },
  accountCard: { gap: spacing.sm, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  accountName: { color: colors.text, fontSize: 17, fontWeight: '600' },
  accountEmail: { color: colors.muted, lineHeight: 22 },
  confirmBox: { gap: spacing.sm, marginTop: spacing.sm },
  confirmText: { color: colors.text, lineHeight: 22 },
  languageError: { color: colors.error, lineHeight: 22 },
});
