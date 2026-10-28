import type { PropsWithChildren, ReactNode, Ref } from 'react';
import { Image, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';
import { useLocale, useTranslate } from '../i18n/locale';
import { mobileMetrics } from '../layout/mobileMetrics';

export function Screen({ children, scroll = true, transparent = false, fullBleed = false, logoInContent = false, scrollRef, onScroll, floatingFooter }: PropsWithChildren<{ scroll?: boolean; transparent?: boolean; fullBleed?: boolean; logoInContent?: boolean; scrollRef?: Ref<ScrollView>; onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void; floatingFooter?: ReactNode }>) {
  const { locale } = useLocale();
  const t = useTranslate();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const metrics = mobileMetrics(width, fontScale);
  const logoStyle = { width: locale === 'ko' || locale === 'en' ? metrics.logoWidth : Math.max(138, metrics.logoWidth), height: metrics.logoHeight };
  const logo = (style: typeof styles.inlineLogo | typeof styles.globalLogo) => locale === 'ko' || locale === 'en'
    ? <Image accessibilityLabel={t('전생록')} source={locale === 'en' ? require('../../assets/branding/title-logo-en.png') : require('../../assets/branding/title-logo-plain.png')} style={style} resizeMode="contain" />
    : <Text accessibilityLabel={t('전생록')} style={[style, styles.englishLogo]}>{t('전생록')}</Text>;
  const content = <View style={[fullBleed ? styles.fullBleedContent : styles.content, !fullBleed && { maxWidth: metrics.contentMaxWidth, paddingHorizontal: metrics.gutter }, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>{logoInContent ? logo([styles.inlineLogo, logoStyle] as never) : null}{children}</View>;
  return <View style={[styles.safe, transparent && styles.transparent, { paddingTop: insets.top }]}><StatusBar translucent backgroundColor="transparent" barStyle="light-content" />{logoInContent ? null : <View style={[styles.globalLogoWrap, { top: insets.top + 2, left: metrics.gutter }]}>{logo([styles.globalLogo, logoStyle] as never)}</View>}{scroll ? <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={80} contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}{floatingFooter ? <View pointerEvents="box-none" style={[styles.floatingFooter, { bottom: Math.max(insets.bottom, spacing.sm) + spacing.md + 88 }]}>{floatingFooter}</View> : null}</View>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, transparent: { backgroundColor: 'transparent' }, globalLogoWrap: { position: 'absolute', zIndex: 20 }, globalLogo: { width: 94, height: 35 }, inlineLogo: { width: 94, height: 35, marginLeft: spacing.md, marginTop: 2 }, englishLogo: { color: '#f6e4bb', fontSize: 11, fontWeight: '900', lineHeight: 15, paddingTop: 7 }, scroll: { flexGrow: 1 }, content: { flex: 1, width: '100%', alignSelf: 'center', paddingVertical: spacing.lg, gap: spacing.md }, fullBleedContent: { flex: 1, width: '100%', padding: 0, gap: 0 }, floatingFooter: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 30 } });
