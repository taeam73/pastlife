import { useState } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { resolveLibraryImage } from '../results/libraryImages';
import { ParchmentSummary } from './ParchmentSummary';
import { localeText, useLocale } from '../i18n/locale';
import { ParchmentReader } from './ParchmentReader';

type Layer = { uri: string; role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT'; alt: string };

type Props = {
  imageUri: string;
  imageAlt: string;
  compositeUri?: string | undefined;
  layers?: Layer[] | undefined;
  title: string;
  characterLabel?: string | undefined;
  roleLabel?: string | undefined;
  placeLabel?: string | undefined;
  characterDescription?: string | undefined;
  chapterTitle: string;
  chapterId: string;
  chapterDetail: string;
  profilePages?: { title: string; body: string }[] | undefined;
  introductionSummary: string;
  index: number;
  standaloneProfile?: boolean | undefined;
  pageIndex?: number | undefined;
  onPageChange?: ((index: number) => void) | undefined;
  onPageCountChange?: ((count: number) => void) | undefined;
};

function sourceFor(uri: string) {
  return resolveLibraryImage(uri) ?? (/^https?:\/\//.test(uri) ? { uri } : undefined);
}

export function ResultHero({ imageUri, imageAlt, compositeUri, layers, title, characterLabel, roleLabel, placeLabel, characterDescription, chapterTitle, chapterId, chapterDetail, profilePages, introductionSummary, index, standaloneProfile = false, pageIndex = 0, onPageChange, onPageCountChange }: Props) {
  const { locale } = useLocale();
  const { width } = useWindowDimensions();
  const isIntroduction = index === 0 && !standaloneProfile;
  const isProfile = index === 0 && standaloneProfile;
  const mobile = width < 768;
  const [summaryHeight, setSummaryHeight] = useState(0);
  const sourceUri = compositeUri ?? imageUri;
  const source = sourceFor(sourceUri);
  if (!source) return null;
  const characterLayers = compositeUri ? [] : layers?.filter((layer) => layer.role === 'CHARACTER') ?? [];
  return <View style={[styles.frame, { height: mobile ? 690 : 680 }]}>
    <Image testID="result-hero-background" accessibilityLabel={imageAlt} blurRadius={isIntroduction ? 2 : 0} source={compositeUri ? source : sourceFor(imageUri) ?? source} resizeMode="cover" style={styles.background} />
    {isIntroduction ? characterLayers.map((layer) => { const characterSource = sourceFor(layer.uri); return characterSource ? <Image key={layer.uri} accessibilityLabel={layer.alt} source={characterSource} resizeMode="contain" style={[styles.character, mobile && styles.mobileCharacter]} /> : null; }) : null}
    <View pointerEvents="none" style={styles.shade} />
    {isIntroduction ? <View style={[styles.copy, mobile && styles.mobileCopy, { bottom: Math.max(mobile ? 190 : 170, summaryHeight + spacing.md * 2) }]}>
      <Text style={styles.eyebrow}>{localeText(locale, { ko: '당신의 전생은', en: 'Your past life was', th: 'ชาติที่แล้วของคุณคือ', ja: 'あなたの前世は' })}</Text>
      <Text style={styles.characterLabel}>{characterLabel ?? chapterTitle}</Text>
      {roleLabel || placeLabel ? <Text style={styles.placeLabel}>{[roleLabel, placeLabel].filter(Boolean).join(' · ')}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text testID="result-signature-quote" style={styles.description}>{characterDescription ?? localeText(locale, { ko: '당신의 전생을 살아간 인물의 기록입니다.', en: 'The story of a person from your imagined past life.', th: 'เรื่องราวของคนคนหนึ่งในชาติที่แล้วจากจินตนาการ', ja: '想像上の前世を生きた人物の物語です。' })}</Text>
    </View> : null}
    <View testID={isIntroduction ? 'result-summary-panel' : undefined} onLayout={isIntroduction ? (event) => setSummaryHeight(event.nativeEvent.layout.height) : undefined} style={[styles.parchment, !isIntroduction && styles.readingParchment, !isIntroduction && mobile && styles.mobileReadingParchment]}>{isIntroduction || isProfile
      ? <ParchmentSummary title={isProfile ? `01 ${chapterTitle}` : chapterTitle} body={chapterDetail || introductionSummary} pages={profilePages} fullPage={isProfile} pageIndex={pageIndex} onPageChange={onPageChange} onPageCountChange={onPageCountChange} />
      : <ParchmentReader chapterKey={chapterId} title={`${String(index + 1).padStart(2, '0')} ${chapterTitle}`} body={chapterDetail} pageIndex={pageIndex} onPageChange={onPageChange} onPageCountChange={onPageCountChange} />}</View>
  </View>;
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end' },
  background: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  character: { position: 'absolute', right: 0, bottom: 0, width: '42%', height: '90%', zIndex: 2 },
  mobileCharacter: { width: '72%', height: '82%', bottom: 82 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 18, 0.22)', zIndex: 3 },
  copy: { position: 'absolute', left: spacing.lg, width: '62%', maxWidth: 560, gap: 5, zIndex: 5 },
  mobileCopy: { left: spacing.md, right: spacing.md, width: 'auto' },
  eyebrow: { color: '#f1dfb2', fontSize: 12, fontWeight: '700' },
  title: { color: '#f1dfb2', fontSize: 16, lineHeight: 23, fontWeight: '700', textShadowColor: 'rgba(0,0,0,.72)', textShadowRadius: 8 },
  characterLabel: { color: '#fff8e8', fontSize: 25, lineHeight: 34, fontWeight: '800', textShadowColor: 'rgba(0,0,0,.72)', textShadowRadius: 8 },
  placeLabel: { color: '#f1dfb2', fontSize: 13, lineHeight: 19, fontWeight: '700', textShadowColor: 'rgba(0,0,0,.72)', textShadowRadius: 8 },
  description: { color: '#fff8e8', fontSize: 14, lineHeight: 21 },
  parchment: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, zIndex: 6, alignItems: 'center' },
  readingParchment: { top: 70, bottom: 70, left: 66, right: 66 },
  mobileReadingParchment: { top: 64, bottom: 62, left: 28, right: 28 },
});
