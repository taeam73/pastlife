import { useState } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { resolveLibraryImage } from '../results/libraryImages';
import { ParchmentSummary } from './ParchmentSummary';
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
  chapterDetail: string;
  profilePages?: { title: string; body: string }[] | undefined;
  introductionSummary: string;
  index: number;
};

function sourceFor(uri: string) {
  return resolveLibraryImage(uri) ?? (/^https?:\/\//.test(uri) ? { uri } : undefined);
}

export function ResultHero({ imageUri, imageAlt, compositeUri, layers, title, characterLabel, roleLabel, placeLabel, characterDescription, chapterTitle, chapterDetail, profilePages, introductionSummary, index }: Props) {
  const { width } = useWindowDimensions();
  const isIntroduction = index === 0;
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
      <Text style={styles.eyebrow}>당신의 전생은</Text>
      <Text style={styles.characterLabel}>{characterLabel ?? chapterTitle}</Text>
      {roleLabel || placeLabel ? <Text style={styles.placeLabel}>{[roleLabel, placeLabel].filter(Boolean).join(' · ')}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text testID="result-signature-quote" style={styles.description}>{characterDescription ?? '당신의 전생을 살아간 인물의 기록입니다.'}</Text>
    </View> : null}
    <View testID={isIntroduction ? 'result-summary-panel' : undefined} onLayout={isIntroduction ? (event) => setSummaryHeight(event.nativeEvent.layout.height) : undefined} style={[styles.parchment, !isIntroduction && styles.readingParchment, !isIntroduction && mobile && styles.mobileReadingParchment]}>{isIntroduction
      ? <ParchmentSummary title={chapterTitle} body={chapterDetail || introductionSummary} pages={profilePages} />
      : <ParchmentReader chapterKey={chapterTitle} title={`${String(index + 1).padStart(2, '0')} ${chapterTitle}`} body={chapterDetail} />}</View>
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
  readingParchment: { top: 70, bottom: 70, left: spacing.lg, right: spacing.lg },
  mobileReadingParchment: { top: 70, bottom: 68, left: spacing.sm, right: spacing.sm },
});
