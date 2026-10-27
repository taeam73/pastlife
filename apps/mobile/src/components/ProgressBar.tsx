import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';
import { localeText, useLocale } from '../i18n/locale';

export function ProgressBar({ stage }: { stage: number }) {
  const { locale } = useLocale();
  return <View accessibilityRole="progressbar" accessibilityLabel={localeText(locale, { ko: `${stage}/6 단계`, en: `Stage ${stage} of 6`, th: `ขั้นที่ ${stage} จาก 6`, ja: `全6段階中${stage}段階` })} accessibilityValue={{ min: 1, max: 6, now: stage }} style={styles.track}><View style={[styles.fill, { width: `${(stage / 6) * 100}%` }]} /></View>;
}

const styles = StyleSheet.create({ track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceRaised, overflow: 'hidden' }, fill: { height: '100%', backgroundColor: colors.accent } });
