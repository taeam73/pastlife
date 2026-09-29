import type { PropsWithChildren } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function Screen({ children, scroll = true, transparent = false }: PropsWithChildren<{ scroll?: boolean; transparent?: boolean }>) {
  const content = <View style={styles.content}>{children}</View>;
  return <SafeAreaView style={[styles.safe, transparent && styles.transparent]}><Image accessibilityLabel="전생록 로고" source={require('../../assets/branding/logo-mark.png')} style={styles.globalLogo} resizeMode="contain" />{scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, transparent: { backgroundColor: 'transparent' }, globalLogo: { position: 'absolute', top: 10, left: spacing.md, zIndex: 20, width: 42, height: 42, opacity: 0.6 }, scroll: { flexGrow: 1 }, content: { flex: 1, padding: spacing.lg, gap: spacing.md } });
