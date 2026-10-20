import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { resolveLibraryImage } from '../results/libraryImages';

type Chapter = { id: string; title: string; summary: string; detail: string };
type Layer = { uri: string; role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT'; alt: string };
type Props = { chapters: Chapter[]; imageUri: string; imageAlt: string; layers?: Layer[]; title: string; characterLabel?: string | undefined; characterDescription?: string | undefined; logo: any; selectedIndex: number; onSelect: (index: number) => void };
export type CinematicChapterPagerHandle = { scrollToIndex: (index: number) => void };

export const CinematicChapterPager = forwardRef<CinematicChapterPagerHandle, Props>(function CinematicChapterPager({ chapters, imageUri, imageAlt, layers, title, characterLabel, characterDescription, logo, selectedIndex, onSelect }, ref) {
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 760);
  const pageWidth = width;
  const bleed = Math.max(spacing.lg, (width - contentWidth) / 2 + spacing.lg);
  const source = resolveLibraryImage(imageUri) ?? (/^https?:\/\//.test(imageUri) ? { uri: imageUri } : undefined);
  useImperativeHandle(ref, () => ({ scrollToIndex: (index) => scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true }) }), [pageWidth]);
  if (!source) return null;
  return <View style={[styles.wrapper, { width: width, marginLeft: -bleed, marginRight: -bleed }]}>
    <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} decelerationRate="fast" onMomentumScrollEnd={(event) => onSelect(Math.round(event.nativeEvent.contentOffset.x / pageWidth))} accessibilityLabel="전생 이야기 페이지">
      {chapters.map((chapter, index) => <View key={chapter.id} style={[styles.page, { width: pageWidth }]}>
        <View style={styles.hero}>
          <Image accessibilityLabel={imageAlt} source={source} resizeMode="cover" style={styles.image} />
          {layers?.filter((layer) => layer.role === 'CHARACTER').map((layer) => {
            const characterSource = resolveLibraryImage(layer.uri) ?? (/^https?:\/\//.test(layer.uri) ? { uri: layer.uri } : undefined);
            return characterSource ? <Image key={layer.uri} accessibilityLabel={layer.alt} source={characterSource} resizeMode="contain" style={styles.character} /> : null;
          })}
          <View style={styles.shade} />
          <View style={styles.brandBlock}>
            <Text accessibilityLabel="전생록" style={styles.logoText}>전생록</Text>
            <Text style={styles.brandMeta}>전생 기록 No.06 발견</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>나의 전생 이야기 · {String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.chapterTitle}>{characterLabel ?? chapter.title}</Text>
            <Text numberOfLines={2} style={styles.summary}>{characterDescription ?? '당신의 전생을 살아간 인물의 기록입니다.'}</Text>
          </View>
        </View>
        <View style={styles.parchment}>
          <Text style={styles.parchmentTitle}>{chapter.title}</Text>
          <Text numberOfLines={3} style={styles.parchmentBody}>{chapter.detail}</Text>
        </View>
      </View>)}
    </ScrollView>
    <View style={styles.dots}>{chapters.map((chapter, index) => <View key={chapter.id} style={[styles.dot, index === selectedIndex && styles.activeDot]} />)}</View>
  </View>;
});

const styles = StyleSheet.create({
  wrapper: { marginTop: -spacing.lg },
  page: { paddingHorizontal: 0, gap: spacing.sm },
  hero: { minHeight: 540, overflow: 'hidden', borderRadius: 0, backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end' },
  image: StyleSheet.absoluteFill,
  character: { position: 'absolute', right: -12, bottom: 0, width: '68%', height: '88%', zIndex: 2 },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 18, 0.2)', zIndex: 3 },
  brandBlock: { display: 'none' },
  logoText: { color: '#fff8e8', fontSize: 34, lineHeight: 42, fontWeight: '400', fontFamily: 'MaruBuri-Regular', letterSpacing: -2 },
  brandMeta: { color: '#f1dfb2', fontSize: 11, fontWeight: '700', marginTop: 2 },
  heroCopy: { width: '62%', padding: spacing.md, marginBottom: spacing.lg, marginLeft: spacing.md, gap: 5, zIndex: 5 },
  eyebrow: { color: '#f1dfb2', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#fff8e8', fontSize: 24, lineHeight: 32, fontWeight: '800', textShadowColor: 'rgba(0, 0, 0, 0.72)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  chapterTitle: { color: '#f1dfb2', fontSize: 18, lineHeight: 25, fontWeight: '700', textShadowColor: 'rgba(0, 0, 0, 0.72)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  summary: { color: '#fff8e8', fontSize: 14, lineHeight: 21, textShadowColor: 'rgba(0, 0, 0, 0.72)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  parchment: { minHeight: 122, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: '#b89456', backgroundColor: '#dcc79a', gap: 5 },
  parchmentTitle: { color: '#4a321e', fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' },
  parchmentBody: { color: '#4a321e', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  activeDot: { width: 18, backgroundColor: colors.accent },
});
