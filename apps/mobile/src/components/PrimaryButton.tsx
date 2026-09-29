import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function PrimaryButton({ children, onPress, disabled = false, leadingIcon }: PropsWithChildren<{ onPress: () => void; disabled?: boolean; leadingIcon?: string }>) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}><View pointerEvents="none" style={styles.sheen} /><View style={styles.content}>{leadingIcon ? <Text style={styles.icon}>{leadingIcon}</Text> : null}<Text style={styles.text}>{children}</Text></View></Pressable>;
}

const styles = StyleSheet.create({ button: { minHeight: 56, borderRadius: 17, overflow: 'hidden', backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 }, sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '48%', backgroundColor: 'rgba(255, 248, 220, 0.16)' }, content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, icon: { color: colors.background, fontSize: 18 }, pressed: { backgroundColor: colors.accentPressed, transform: [{ translateY: 2 }] }, disabled: { display: 'none' }, text: { color: colors.background, fontSize: 17, fontWeight: '700' } });
