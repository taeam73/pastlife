import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { localeText, useLocale } from '../i18n/locale';
import type { StoryArtworkStatus as ArtworkStatus } from '../results/useStoryArtworkSource';
import { colors, spacing } from '../theme/tokens';

type Props = {
  status: ArtworkStatus;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
};

export function StoryArtworkStatus({ status, onRetry, style }: Props) {
  const { locale } = useLocale();
  if (status === 'idle' || status === 'ready') return null;

  if (status === 'loading') {
    return <View testID="story-artwork-loading" accessibilityRole="progressbar" style={[styles.root, style]}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={styles.loadingText}>{localeText(locale, {
        ko: '전생의 장면을 불러오는 중입니다.',
        en: 'Loading a scene from your past life.',
        th: 'กำลังโหลดฉากจากชาติที่แล้วของคุณ',
        ja: '前世の場面を読み込んでいます。',
      })}</Text>
    </View>;
  }

  return <View testID="story-artwork-error" style={[styles.root, style]}>
    <View style={styles.message}>
      <Text accessibilityRole="alert" style={styles.errorText}>{localeText(locale, {
        ko: '전생의 장면을 불러오지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.',
        en: 'Could not load this past-life scene. Check your connection and try again.',
        th: 'โหลดฉากจากชาติที่แล้วไม่สำเร็จ โปรดตรวจสอบเครือข่ายแล้วลองอีกครั้ง',
        ja: '前世の場面を読み込めませんでした。通信状態を確認して、もう一度お試しください。',
      })}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={localeText(locale, { ko: '그림 다시 불러오기', en: 'Reload artwork', th: 'โหลดภาพอีกครั้ง', ja: '画像を再読み込み' })}
        onPress={onRetry}
        style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
      >
        <Text style={styles.retryText}>{localeText(locale, { ko: '다시 시도', en: 'Try again', th: 'ลองอีกครั้ง', ja: '再試行' })}</Text>
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surfaceRaised,
  },
  message: { width: '100%', maxWidth: 360, alignItems: 'center', gap: spacing.md },
  loadingText: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  errorText: { color: colors.text, fontSize: 15, lineHeight: 23, textAlign: 'center' },
  retry: {
    minWidth: 132,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  retryPressed: { backgroundColor: colors.accentPressed, transform: [{ scale: 0.98 }] },
  retryText: { color: colors.background, fontSize: 16, fontWeight: '700' },
});
