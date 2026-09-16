import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function PrimaryButton({ children, onPress, disabled = false }: PropsWithChildren<{ onPress: () => void; disabled?: boolean }>) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}><Text style={styles.text}>{children}</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { minHeight: 52, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', padding: spacing.md }, pressed: { backgroundColor: colors.accentPressed }, disabled: { opacity: 0.5 }, text: { color: colors.background, fontSize: 17, fontWeight: '700' } });
