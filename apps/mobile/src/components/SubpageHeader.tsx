import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { localeText, useLocale } from '../i18n/locale';

export function SubpageHeader({ title }: { title: string }) {
  const { locale } = useLocale();
  const router = useRouter();
  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return <View style={styles.header}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={localeText(locale, { ko: `${title} 닫기`, en: `Close ${title}`, th: `ปิด ${title}`, ja: `${title}を閉じる` })}
      hitSlop={10}
      onPress={close}
      style={({ pressed }) => [styles.close, pressed && styles.pressed]}
    >
      <Text style={styles.closeIcon}>×</Text>
    </Pressable>
    <Text style={styles.title}>{title}</Text>
  </View>;
}

const styles = StyleSheet.create({
  header: { minHeight: 76, paddingTop: 42, marginBottom: spacing.sm, justifyContent: 'flex-end' },
  title: { color: colors.text, fontSize: 30, fontWeight: '700', lineHeight: 38 },
  close: { position: 'absolute', top: 0, right: 0, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { color: colors.text, fontSize: 40, lineHeight: 43, fontWeight: '300' },
  pressed: { opacity: 0.65, transform: [{ scale: 0.96 }] },
});
