import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';
import { AppNav } from '../src/components/AppNav';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { SubpageHeader } from '../src/components/SubpageHeader';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type Preferences,
} from '../src/session/store';
import { syncCurrentSessionLocale } from '../src/session/localeSync';
import { colors, spacing } from '../src/theme/tokens';
import { adPrivacyOptionsRequired, showAdPrivacyOptions } from '../src/ads/admob';
import { localeText, useLocale, useTranslate } from '../src/i18n/locale';
import { contentLocales, isContentLocaleAvailable, selectableContentLocales, type ContentLocale } from '@pastlife/content/locales';

export default function SettingsScreen() {
  const { locale, setLocale } = useLocale();
  const t = useTranslate();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [showAdPrivacy, setShowAdPrivacy] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [languageError, setLanguageError] = useState(false);

  useEffect(() => {
    void loadPreferences().then(setPreferences);
  }, []);

  useEffect(() => { void adPrivacyOptionsRequired().then(setShowAdPrivacy).catch(() => undefined); }, []);

  const change = (key: keyof Preferences, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    void savePreferences(next);
  };

  const changeLanguage = async (next: ContentLocale) => {
    if (changingLanguage || next === locale) return;
    setChangingLanguage(true);
    setLanguageError(false);
    try {
      await setLocale(next);
      void syncCurrentSessionLocale(next).catch(() => undefined);
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
    {languageError ? <Text accessibilityRole="alert" style={styles.languageError}>{localeText(locale, { ko: '언어 설정을 저장하지 못했습니다. 다시 시도해 주세요.', en: 'Could not save the language setting. Please try again.', th: 'บันทึกการตั้งค่าภาษาไม่ได้ โปรดลองอีกครั้ง', ja: '言語設定を保存できませんでした。もう一度お試しください。' })}</Text> : null}
    <Setting label={t('배경 음악')} value={preferences.bgmEnabled} onChange={(value) => change('bgmEnabled', value)} />
    <Setting label={t('효과음')} value={preferences.effectsEnabled} onChange={(value) => change('effectsEnabled', value)} />
    <Setting label={t('동작 줄이기')} value={preferences.reduceMotion} onChange={(value) => change('reduceMotion', value)} />
    <Text style={styles.note}>{t('음악과 효과음 기본값은 출시 운영 설정으로 연결됩니다. 음소거나 동작 줄이기 선택은 이 기기에 저장됩니다.')}</Text>
    {showAdPrivacy ? <PrimaryButton onPress={() => { void showAdPrivacyOptions(); }}>{t('광고 개인정보 설정')}</PrimaryButton> : null}
    <PrimaryButton onPress={() => {
      const assetBaseUrl = (process.env.EXPO_PUBLIC_ASSET_BASE_URL ?? 'https://pastlife-assets.pages.dev').replace(/\/+$/u, '');
      void Linking.openURL(`${assetBaseUrl}/privacy/?lang=${locale}`);
    }}>{t('개인정보처리방침')}</PrimaryButton>

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
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  languageError: { color: colors.error, lineHeight: 22 },
});
