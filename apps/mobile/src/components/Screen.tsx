import type { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const content = <View style={styles.content}>{children}</View>;
  return <SafeAreaView style={styles.safe}>{scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1 }, content: { flex: 1, padding: spacing.lg, gap: spacing.md } });
