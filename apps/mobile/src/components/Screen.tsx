import type { PropsWithChildren, Ref } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function Screen({ children, scroll = true, transparent = false, fullBleed = false, logoInContent = false, scrollRef }: PropsWithChildren<{ scroll?: boolean; transparent?: boolean; fullBleed?: boolean; logoInContent?: boolean; scrollRef?: Ref<ScrollView> }>) {
  const content = <View style={fullBleed ? styles.fullBleedContent : styles.content}>{logoInContent ? <Image accessibilityLabel="전생록" source={require('../../assets/branding/title-logo-plain.png')} style={styles.inlineLogo} resizeMode="contain" /> : null}{children}</View>;
  return <SafeAreaView style={[styles.safe, transparent && styles.transparent]}>{logoInContent ? null : <Image accessibilityLabel="전생록" source={require('../../assets/branding/title-logo-plain.png')} style={styles.globalLogo} resizeMode="contain" />}{scroll ? <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, transparent: { backgroundColor: 'transparent' }, globalLogo: { position: 'absolute', top: 8, left: spacing.md, zIndex: 20, width: 108, height: 40 }, inlineLogo: { width: 108, height: 40 }, scroll: { flexGrow: 1 }, content: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.lg, gap: spacing.md }, fullBleedContent: { flex: 1, width: '100%', padding: 0, gap: 0 } });
