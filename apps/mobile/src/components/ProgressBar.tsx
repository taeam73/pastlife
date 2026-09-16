import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

export function ProgressBar({ stage }: { stage: number }) {
  return <View accessibilityLabel={`${stage}/6 단계`} style={styles.track}><View style={[styles.fill, { width: `${(stage / 6) * 100}%` }]} /></View>;
}

const styles = StyleSheet.create({ track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceRaised, overflow: 'hidden' }, fill: { height: '100%', backgroundColor: colors.accent } });
