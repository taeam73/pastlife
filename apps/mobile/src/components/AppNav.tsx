import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function AppNav() {
  const router = useRouter();
  return <View accessibilityRole="tablist" style={styles.nav}>
    <NavItem icon="⌂" label="메인" onPress={() => router.replace('/')} />
    <NavItem icon="▤" label="나의 전생" onPress={() => router.push('/archive')} />
    <NavItem icon="⚙" label="설정" onPress={() => router.push('/settings' as never)} />
  </View>;
}

function NavItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="tab" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.text}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', gap: spacing.sm, borderTopColor: 'rgba(244, 240, 231, 0.28)', borderTopWidth: 1, paddingTop: spacing.sm },
  item: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 3 },
  icon: { color: colors.accent, fontSize: 20, lineHeight: 22 },
  text: { color: colors.text, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.65, transform: [{ translateY: 1 }] },
});
