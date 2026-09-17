import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { PrimaryButton } from './PrimaryButton';

export type AsyncStatus = 'IDLE' | 'LOADING' | 'READY' | 'ERROR';

export function AsyncActionStatus({ status, loadingText, readyText, errorText, onRetry }: { status: AsyncStatus; loadingText: string; readyText: string; errorText: string; onRetry: () => void }) {
  if (status === 'IDLE') return null;
  if (status === 'LOADING') return <View accessibilityLiveRegion="polite" style={styles.row}><Text style={styles.loading}>{loadingText}</Text></View>;
  if (status === 'READY') return <View accessibilityLiveRegion="polite" style={styles.row}><Text style={styles.ready}>{readyText}</Text></View>;
  return <View accessibilityRole="alert" style={styles.errorBox}><Text style={styles.error}>{errorText}</Text><PrimaryButton onPress={onRetry}>다시 시도</PrimaryButton></View>;
}

const styles = StyleSheet.create({
  row: { padding: spacing.sm, borderRadius: 10, backgroundColor: colors.surface },
  loading: { color: colors.muted },
  ready: { color: colors.accent, fontWeight: '700' },
  errorBox: { gap: spacing.sm, padding: spacing.md, borderRadius: 12, borderColor: colors.error, borderWidth: 1 },
  error: { color: colors.error, lineHeight: 21 },
});
