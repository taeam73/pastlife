import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

export function ProgressBar({ stage }: { stage: number }) {
  return <View accessibilityRole="progressbar" accessibilityLabel={`${stage}/6 단계`} accessibilityValue={{ min: 1, max: 6, now: stage }} style={styles.track}><View style={[styles.fill, { width: `${(stage / 6) * 100}%` }]} /></View>;
}

const styles = StyleSheet.create({ track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceRaised, overflow: 'hidden' }, fill: { height: '100%', backgroundColor: colors.accent } });
