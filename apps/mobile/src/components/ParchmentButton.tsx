import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const parchmentImage = require('../../assets/branding/final-moment-parchment-button.png');

export function ParchmentButton({ label, onPress, disabled = false, tone = 'default' }: { label: string; onPress: () => void; disabled?: boolean; tone?: 'default' | 'warm' | 'muted' }) {
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
  >
    <Image source={parchmentImage} resizeMode="stretch" style={styles.image} accessible={false} />
    {tone !== 'default' ? <View pointerEvents="none" style={[styles.tone, tone === 'warm' ? styles.warmTone : styles.mutedTone]} /> : null}
    <Text style={styles.label}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { width: '100%', maxWidth: 520, minHeight: 84, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  image: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' },
  tone: { position: 'absolute', top: 8, right: 12, bottom: 8, left: 12, borderRadius: 22 },
  warmTone: { backgroundColor: 'rgba(180, 119, 31, 0.14)' },
  mutedTone: { backgroundColor: 'rgba(64, 79, 87, 0.17)' },
  label: { color: '#0D1420', fontSize: 16, fontWeight: '700', lineHeight: 22, textAlign: 'center', paddingHorizontal: 42, paddingVertical: 18 },
  pressed: { opacity: 0.9, transform: [{ translateY: 2 }] },
  disabled: { opacity: 0.55 },
});
