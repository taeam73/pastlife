import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function ChoiceButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.choice, pressed && styles.pressed, disabled && styles.disabled]}><Text style={styles.text}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ choice: { minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'center', paddingHorizontal: spacing.md }, pressed: { backgroundColor: colors.surfaceRaised }, disabled: { opacity: 0.6 }, text: { color: colors.text, fontSize: 16, lineHeight: 24 } });
