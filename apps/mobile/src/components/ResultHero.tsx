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
  characterDescription?: string | undefined;
  chapterTitle: string;
  chapterDetail: string;
  introductionSummary: string;
  index: number;
};

function sourceFor(uri: string) {
  return resolveLibraryImage(uri) ?? (/^https?:\/\//.test(uri) ? { uri } : undefined);
}

export function ResultHero({ imageUri, imageAlt, compositeUri, layers, title, characterLabel, characterDescription, chapterTitle, chapterDetail, introductionSummary, index }: Props) {
  const { width } = useWindowDimensions();
  const isIntroduction = index === 0;
  const mobile = width < 768;
  const sourceUri = compositeUri ?? imageUri;
  const source = sourceFor(sourceUri);
  if (!source) return null;
  const characterLayers = compositeUri ? [] : layers?.filter((layer) => layer.role === 'CHARACTER') ?? [];
  return <View style={[styles.frame, { height: mobile ? 690 : 680 }]}>
    <Image accessibilityLabel={imageAlt} source={compositeUri ? source : sourceFor(imageUri) ?? source} resizeMode="cover" style={styles.background} />
    {isIntroduction ? characterLayers.map((layer) => { const characterSource = sourceFor(layer.uri); return characterSource ? <Image key={layer.uri} accessibilityLabel={layer.alt} source={characterSource} resizeMode="contain" style={[styles.character, mobile && styles.mobileCharacter]} /> : null; }) : null}
    <View pointerEvents="none" style={styles.shade} />
    {isIntroduction ? <View style={[styles.copy, mobile && styles.mobileCopy]}>
      <Text style={styles.eyebrow}>당신의 전생은</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.characterLabel}>{characterLabel ?? chapterTitle}</Text>
      <Text numberOfLines={3} style={styles.description}>{characterDescription ?? '당신의 전생을 살아간 인물의 기록입니다.'}</Text>
    </View> : null}
    <View style={[styles.parchment, !isIntroduction && styles.readingParchment, !isIntroduction && mobile && styles.mobileReadingParchment]}>{isIntroduction
      ? <ParchmentSummary title={characterLabel ?? title} body={introductionSummary} />
      : <ParchmentReader chapterKey={chapterTitle} title={`${String(index + 1).padStart(2, '0')} ${chapterTitle}`} body={chapterDetail} />}</View>
  </View>;
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end' },
  background: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  character: { position: 'absolute', right: 0, bottom: 0, width: '42%', height: '90%', zIndex: 2 },
  mobileCharacter: { width: '72%', height: '82%' },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 18, 0.22)', zIndex: 3 },
  copy: { width: '62%', maxWidth: 560, marginLeft: spacing.lg, marginBottom: 170, gap: 5, zIndex: 5 },
  mobileCopy: { width: '70%', marginLeft: spacing.md, marginBottom: 188 },
  eyebrow: { color: '#f1dfb2', fontSize: 12, fontWeight: '700' },
  title: { color: '#fff8e8', fontSize: 24, lineHeight: 32, fontWeight: '800', textShadowColor: 'rgba(0,0,0,.72)', textShadowRadius: 8 },
  characterLabel: { color: '#f1dfb2', fontSize: 18, lineHeight: 25, fontWeight: '700' },
  description: { color: '#fff8e8', fontSize: 14, lineHeight: 21 },
  parchment: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, zIndex: 6, alignItems: 'center' },
  readingParchment: { top: 70, bottom: 70, left: spacing.lg, right: spacing.lg },
  mobileReadingParchment: { top: 70, bottom: 68, left: spacing.sm, right: spacing.sm },
});
