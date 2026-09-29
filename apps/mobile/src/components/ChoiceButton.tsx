import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function ChoiceButton({ label, onPress, disabled, selected }: { label: string; onPress: () => void; disabled?: boolean; selected?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, selected }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed, disabled && !selected && styles.disabled]}><View pointerEvents="none" style={selected ? styles.sheen : undefined} /><Text style={[styles.text, selected && styles.selectedText]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ choice: { minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(217, 177, 92, 0.58)', backgroundColor: 'rgba(35, 22, 13, 0.76)', justifyContent: 'center', paddingHorizontal: spacing.md, overflow: 'hidden', shadowColor: '#120802', shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 }, selected: { backgroundColor: colors.accent, borderColor: '#f5d58b' }, sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '48%', backgroundColor: 'rgba(255, 248, 220, 0.18)' }, pressed: { transform: [{ scale: 0.99 }] }, disabled: { opacity: 0.6 }, text: { color: '#f7ead0', fontFamily: 'MaruBuri', fontSize: 16, lineHeight: 26 }, selectedText: { color: colors.background, fontFamily: 'MaruBuriBold', fontWeight: '700' } });
