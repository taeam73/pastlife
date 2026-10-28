import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { useTranslate } from '../i18n/locale';

export function AppNav() {
  const router = useRouter();
  const t = useTranslate();
  return <View accessibilityRole="tablist" style={styles.nav}>
    <NavItem icon="⌂" label={t('메인')} onPress={() => router.replace('/')} />
    <NavItem icon="⚙" label={t('설정')} onPress={() => router.push('/settings' as never)} />
  </View>;
}

function NavItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="tab" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
    <Text style={styles.icon}>{icon}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', gap: spacing.sm, borderTopColor: 'rgba(244, 240, 231, 0.28)', borderTopWidth: 1, paddingTop: spacing.sm },
  item: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  icon: { color: colors.accent, fontSize: 28, lineHeight: 34 },
  pressed: { opacity: 0.65, transform: [{ translateY: 1 }] },
});
