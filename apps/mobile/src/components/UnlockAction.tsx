import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { PrimaryButton } from './PrimaryButton';

export function UnlockAction({ label, loadingLabel, onUnlock }: { label: string; loadingLabel: string; onUnlock: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      await onUnlock();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return <View style={styles.container}>
    <PrimaryButton disabled={busy} onPress={() => void run()}>{busy ? loadingLabel : error ? '광고 다시 시도' : label}</PrimaryButton>
    {error ? <Text accessibilityRole="alert" style={styles.error}>광고를 불러오지 못했습니다. 현재 기록은 유지됩니다. 네트워크를 확인하고 다시 시도해 주세요.</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  error: { color: colors.error, lineHeight: 21 },
});
