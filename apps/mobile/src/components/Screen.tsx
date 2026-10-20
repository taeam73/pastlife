import type { PropsWithChildren } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function Screen({ children, scroll = true, transparent = false }: PropsWithChildren<{ scroll?: boolean; transparent?: boolean }>) {
  const content = <View style={styles.content}>{children}</View>;
  return <SafeAreaView style={[styles.safe, transparent && styles.transparent]}><Image accessibilityLabel="전생록" source={require('../../assets/branding/title-logo-plain.png')} style={styles.globalLogo} resizeMode="contain" />{scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, transparent: { backgroundColor: 'transparent' }, globalLogo: { position: 'absolute', top: 8, left: spacing.md, zIndex: 20, width: 108, height: 40 }, scroll: { flexGrow: 1 }, content: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.lg, gap: spacing.md } });
