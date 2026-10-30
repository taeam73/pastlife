import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useStoryArtwork } from '../results/useStoryArtworkSource';
import { loadPreferences } from '../session/store';
import { colors, spacing } from '../theme/tokens';
import { localeText, useLocale } from '../i18n/locale';
import { StoryArtworkStatus } from './StoryArtworkStatus';

type Layer = { uri: string; role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT'; alt: string };
export type Cover = { era: string; place: string; role: string; birthYear: string; deathYear: string; lifeLine: string };

function CachedCharacter({ layer, style, onReady }: { layer: Layer; style: React.ComponentProps<typeof Animated.Image>['style']; onReady: () => void }) {
  const artwork = useStoryArtwork(layer.uri);
  useEffect(() => { if (artwork.status === 'error') onReady(); }, [artwork.status, onReady]);
  return artwork.source ? <Animated.Image
    key={`${layer.uri}-${artwork.attempt}`}
    accessibilityLabel={layer.alt}
    source={artwork.source}
    resizeMode="contain"
    onLoad={() => { artwork.markLoaded(); onReady(); }}
    onError={() => { artwork.markFailed(); onReady(); }}
    style={style}
  /> : null;
}

export function ResultCover({ imageUri, imageAlt, layers, name, recordNo, cover }: { imageUri: string; imageAlt: string; layers?: Layer[] | undefined; name: string; recordNo: number; cover: Cover }) {
  const { locale } = useLocale();
  const { width } = useWindowDimensions();
  const mobile = width < 768;
  const background = useStoryArtwork(imageUri);
  const [loadedCharacters, setLoadedCharacters] = useState<string[]>([]);
  const characterLayers = layers?.filter((layer) => layer.role === 'CHARACTER') ?? [];
  const artworkReady = background.status === 'ready' && characterLayers.every((layer) => loadedCharacters.includes(layer.uri));
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const characterOpacity = useRef(new Animated.Value(0)).current;
  const characterY = useRef(new Animated.Value(20)).current;
  const lines = useMemo(() => [
    localeText(locale, { ko: `당신의 ${recordNo}번째 전생은`, en: `Your past life No. ${recordNo}`, th: `ชาติที่แล้วของคุณลำดับ ${recordNo}`, ja: `あなたの第${recordNo}の前世は` }),
    name,
    `(${cover.birthYear}~${cover.deathYear})`,
    `${cover.era} · ${cover.place}`,
    cover.role,
    cover.lifeLine,
  ], [cover.birthYear, cover.deathYear, cover.era, cover.lifeLine, cover.place, cover.role, name, recordNo, locale]);
  const [typedLengths, setTypedLengths] = useState(() => lines.map(() => 0));

  useEffect(() => {
    if (!artworkReady) return;
    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (duration: number) => new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, duration);
      timers.push(timer);
    });
    backgroundOpacity.setValue(0);
    characterOpacity.setValue(0);
    characterY.setValue(20);
    setTypedLengths(lines.map(() => 0));

    void loadPreferences().then(async (preferences) => {
      if (!active) return;
      if (preferences.reduceMotion) {
        backgroundOpacity.setValue(1);
        characterOpacity.setValue(1);
        characterY.setValue(0);
        setTypedLengths(lines.map((line) => line.length));
        return;
      }
      Animated.timing(backgroundOpacity, { toValue: 1, duration: 650, useNativeDriver: Platform.OS !== 'web' }).start();
      await wait(420);
      if (!active) return;
      Animated.parallel([
        Animated.timing(characterOpacity, { toValue: 1, duration: 620, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(characterY, { toValue: 0, duration: 620, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
      await wait(650);
      for (let lineIndex = 0; lineIndex < lines.length && active; lineIndex += 1) {
        const line = lines[lineIndex]!;
        const interval = Math.max(20, Math.min(38, Math.floor(520 / Math.max(line.length, 1))));
        for (let length = 1; length <= line.length && active; length += 1) {
          setTypedLengths((current) => current.map((value, index) => index === lineIndex ? length : value));
          await wait(interval);
        }
        await wait(lineIndex === 1 ? 80 : 120);
      }
    });
    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, [artworkReady, backgroundOpacity, characterOpacity, characterY, lines]);

  if (!background.source || background.status === 'error') return <View style={[styles.frame, { height: mobile ? 690 : 680 }]}>
    <StoryArtworkStatus status={background.status} onRetry={background.retry} />
  </View>;
  return <View style={[styles.frame, { height: mobile ? 690 : 680 }]}>
    <Animated.Image key={`${imageUri}-${background.attempt}`} accessibilityLabel={imageAlt} source={background.source} resizeMode="cover" onLoad={background.markLoaded} onError={background.markFailed} style={[styles.background, { opacity: backgroundOpacity }]} />
    {characterLayers.map((layer) => {
      return <CachedCharacter key={layer.uri} layer={layer} onReady={() => setLoadedCharacters((current) => current.includes(layer.uri) ? current : [...current, layer.uri])} style={[styles.character, mobile && styles.mobileCharacter, { opacity: characterOpacity, transform: [{ translateY: characterY }] }]} />;
    })}
    <View pointerEvents="none" style={styles.shade} />
    <View pointerEvents="none" style={styles.lowerShade} />
    {!artworkReady ? <StoryArtworkStatus status="loading" onRetry={background.retry} /> : null}
    <View style={[styles.copy, mobile && styles.mobileCopy]}>
      <Text style={styles.eyebrow}>{lines[0]!.slice(0, typedLengths[0])}</Text>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{lines[1]!.slice(0, typedLengths[1])}</Text>
        <Text style={styles.years}>{lines[2]!.slice(0, typedLengths[2])}</Text>
      </View>
      <Text style={styles.place}>{lines[3]!.slice(0, typedLengths[3])}</Text>
      <Text style={styles.role}>{lines[4]!.slice(0, typedLengths[4])}</Text>
      <Text style={styles.lifeLine}>{lines[5]!.slice(0, typedLengths[5])}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', backgroundColor: colors.surfaceRaised },
  background: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  character: { position: 'absolute', right: 0, bottom: 0, width: '42%', height: '90%', zIndex: 2 },
  // Keep the full illustration visible while giving assets with generous
  // transparent margins enough room on a phone-sized cover.
  mobileCharacter: { width: '100%', height: '92%', bottom: 24 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 18, 0.22)', zIndex: 3 },
  lowerShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 310, backgroundColor: 'rgba(5, 10, 18, 0.56)', zIndex: 3 },
  copy: { position: 'absolute', zIndex: 4, left: spacing.lg, right: spacing.lg, bottom: 82, maxWidth: 560, gap: 5 },
  mobileCopy: { left: spacing.md, right: spacing.md, bottom: 82 },
  eyebrow: { color: '#e8c676', fontSize: 13, fontWeight: '700', textShadowColor: '#000', textShadowRadius: 5 },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 7 },
  name: { color: '#fff8e8', fontSize: 30, lineHeight: 37, fontWeight: '700', textShadowColor: '#000', textShadowRadius: 6 },
  years: { color: '#fff0d0', fontSize: 13, lineHeight: 19, textShadowColor: '#000', textShadowRadius: 5 },
  place: { color: '#fff0d0', fontSize: 14, lineHeight: 21, textShadowColor: '#000', textShadowRadius: 5 },
  role: { color: '#fff0d0', fontSize: 14, lineHeight: 21, textShadowColor: '#000', textShadowRadius: 5 },
  lifeLine: { color: '#fff8e8', fontSize: 14, lineHeight: 21, marginTop: 7, textShadowColor: '#000', textShadowRadius: 5 },
});
