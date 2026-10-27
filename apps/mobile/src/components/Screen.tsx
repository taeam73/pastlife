import type { PropsWithChildren, Ref } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { useLocale, useTranslate } from '../i18n/locale';

export function Screen({ children, scroll = true, transparent = false, fullBleed = false, logoInContent = false, scrollRef }: PropsWithChildren<{ scroll?: boolean; transparent?: boolean; fullBleed?: boolean; logoInContent?: boolean; scrollRef?: Ref<ScrollView> }>) {
  const { locale } = useLocale();
  const t = useTranslate();
  const logo = (style: typeof styles.inlineLogo | typeof styles.globalLogo) => locale !== 'ko'
    ? <Text accessibilityLabel={t('전생록')} style={[style, styles.englishLogo]}>{locale === 'en' ? 'PAST LIFE ARCHIVE' : t('전생록')}</Text>
    : <Image accessibilityLabel={t('전생록')} source={require('../../assets/branding/title-logo-plain.png')} style={style} resizeMode="contain" />;
  const content = <View style={fullBleed ? styles.fullBleedContent : styles.content}>{logoInContent ? logo(styles.inlineLogo) : null}{children}</View>;
  return <SafeAreaView style={[styles.safe, transparent && styles.transparent]}>{logoInContent ? null : logo(styles.globalLogo)}{scroll ? <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, transparent: { backgroundColor: 'transparent' }, globalLogo: { position: 'absolute', top: 8, left: spacing.md, zIndex: 20, width: 108, height: 40 }, inlineLogo: { width: 108, height: 40 }, englishLogo: { width: 155, color: '#f6e4bb', fontSize: 13, fontWeight: '900', lineHeight: 18, paddingTop: 9 }, scroll: { flexGrow: 1 }, content: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.lg, gap: spacing.md }, fullBleedContent: { flex: 1, width: '100%', padding: 0, gap: 0 } });
