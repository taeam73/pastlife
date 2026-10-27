import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const parchmentImage = require('../../assets/branding/final-moment-parchment-button.png');
const IMAGE_RATIO = 802 / 1962;

export function ParchmentButton({ label, onPress, disabled = false, tone = 'default' }: { label: string; onPress: () => void; disabled?: boolean; tone?: 'default' | 'warm' | 'muted' }) {
  const [width, setWidth] = useState(0);
  const artworkHeight = Math.round(width * 446 / 1962);
  const height = Math.max(100, artworkHeight + 8);
  const imageHeight = width * IMAGE_RATIO;
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    style={({ pressed }) => [styles.button, { height }, pressed && styles.pressed, disabled && styles.disabled]}
  >
    {width > 0 ? <Image source={parchmentImage} resizeMode="contain" style={[styles.image, { height: imageHeight, top: (height - imageHeight) / 2 }]} accessible={false} /> : null}
    {tone !== 'default' ? <View pointerEvents="none" style={[styles.tone, { top: (height - artworkHeight) / 2, height: artworkHeight }, tone === 'warm' ? styles.warmTone : styles.mutedTone]} /> : null}
    <Text style={styles.label}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { position: 'absolute', left: 0, width: '100%' },
  tone: { position: 'absolute', right: 12, left: 12, borderRadius: 22 },
  warmTone: { backgroundColor: 'rgba(180, 119, 31, 0.14)' },
  mutedTone: { backgroundColor: 'rgba(64, 79, 87, 0.17)' },
  label: { color: '#0D1420', fontSize: 18, fontWeight: '800', lineHeight: 24, textAlign: 'center', paddingHorizontal: 42, paddingVertical: 12 },
  pressed: { opacity: 0.9, transform: [{ translateY: 2 }, { scale: 0.985 }] },
  disabled: { opacity: 0.55 },
});
