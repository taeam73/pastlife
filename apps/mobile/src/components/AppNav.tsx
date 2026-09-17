import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function AppNav() {
  const router = useRouter();
  return <View accessibilityRole="tablist" style={styles.nav}>
    <NavItem label="메인" onPress={() => router.replace('/')} />
    <NavItem label="나의 전생" onPress={() => router.push('/archive')} />
    <NavItem label="설정" onPress={() => router.push('/settings' as never)} />
  </View>;
}

function NavItem({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="tab" onPress={onPress} style={styles.item}><Text style={styles.text}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ nav: { flexDirection: 'row', gap: spacing.sm, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: spacing.md }, item: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, text: { color: colors.muted, fontWeight: '700' } });
