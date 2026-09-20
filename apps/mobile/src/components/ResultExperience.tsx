import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { ResultBlock } from './ResultBlock';

type Block = { id: string; title: string; body: string };
type ImageAsset = { uri: string; alt: string; sourceType: 'AI' | 'LIBRARY'; status: 'READY' | 'FALLBACK' };
type Highlight = { id: string; title: string; summary: string; detail: string };

export function ResultExperience({ image, blocks, highlights }: { image: ImageAsset; blocks: Block[]; highlights?: Highlight[] }) {
  const showRemoteImage = /^https?:\/\//.test(image.uri);
  const highlightOrder = ['KEY_RELATIONSHIP', 'DECISIVE_EVENT', 'INNER_WOUND', 'LIFE_LEGACY', 'PRESENT_ECHO', 'DREAM_AND_DAILY', 'LIFE_FOUNDATION'];
  const visibleHighlights = highlights
    ?.filter(({ id }) => id !== 'IDENTITY')
    .sort((left, right) => highlightOrder.indexOf(left.id) - highlightOrder.indexOf(right.id));

  return <View style={styles.container}>
    <View style={styles.modeRow} accessibilityRole="tablist">
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: true }} style={[styles.modeButton, styles.modeSelected]}>
        <Text style={styles.modeText}>이미지와 텍스트</Text>
      </Pressable>
      <Pressable disabled accessibilityRole="tab" accessibilityState={{ selected: false, disabled: true }} style={[styles.modeButton, styles.modeDisabled]}>
        <Text style={styles.modeDisabledText}>영상으로 보기</Text>
        <Text style={styles.comingSoon}>첫 출시 이후 제공</Text>
      </Pressable>
    </View>

    <View style={styles.hero}>
      {showRemoteImage
        ? <Image accessibilityLabel={image.alt} source={{ uri: image.uri }} resizeMode="cover" style={styles.image} />
        : <View accessible accessibilityLabel={image.alt} style={styles.imageFallback}>
            <Text style={styles.imageFallbackEyebrow}>전생 기록 이미지</Text>
            <Text style={styles.imageFallbackText}>{image.alt}</Text>
          </View>}
      <View pointerEvents="none" style={styles.imageShade} />
      <Text pointerEvents="none" style={styles.heroLabel}>{image.sourceType === 'AI' ? 'AI로 복원한 장면' : '기록을 바탕으로 한 장면'}</Text>
    </View>

    <View style={styles.storyIntro}>
      <Text style={styles.storyEyebrow}>당신의 전생 이야기</Text>
      <Text style={styles.storyLead}>한 사람의 탄생부터 마지막 순간까지, 여섯 장의 생애 기록으로 이어집니다.</Text>
    </View>
    <View style={styles.textView}>{blocks.map((block) => <ResultBlock key={block.id} title={block.title} body={block.body} />)}</View>
    {visibleHighlights?.length ? <View style={styles.highlights}>
      <View style={styles.highlightIntro}>
        <Text style={styles.storyEyebrow}>이 삶에서 가장 깊게 남은 것들</Text>
        <Text style={styles.storyLead}>이제 긴 생애를 움직인 인연과 사건, 마음의 흔적을 하나씩 짚어 보겠습니다.</Text>
      </View>
      {visibleHighlights.map((item) => <View key={item.id} style={styles.highlightCard}><Text style={styles.highlightTitle}>{item.title}</Text><Text style={styles.highlightSummary}>{item.summary}</Text><Text style={styles.highlightDetail}>{item.detail}</Text></View>)}
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeButton: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, alignItems: 'center', justifyContent: 'center', minHeight: 58 },
  modeSelected: { backgroundColor: colors.surfaceRaised, borderColor: colors.accent },
  modeDisabled: { opacity: 0.52 },
  modeText: { color: colors.text, fontWeight: '700' },
  modeDisabledText: { color: colors.muted, fontWeight: '700' },
  comingSoon: { color: colors.muted, fontSize: 11, marginTop: 2 },
  hero: { minHeight: 360, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end' },
  image: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  imageFallback: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  imageFallbackEyebrow: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  imageFallbackText: { color: colors.muted, fontSize: 17, lineHeight: 26, textAlign: 'center' },
  imageShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100, backgroundColor: 'rgba(5, 10, 18, 0.45)' },
  heroLabel: { color: colors.text, fontSize: 14, fontWeight: '700', padding: spacing.md },
  storyIntro: { gap: 4, marginTop: spacing.sm },
  storyEyebrow: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  storyLead: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  highlights: { gap: spacing.sm },
  highlightIntro: { gap: 4, marginTop: spacing.md, marginBottom: spacing.xs },
  highlightCard: { borderLeftColor: colors.accent, borderLeftWidth: 3, backgroundColor: colors.surfaceRaised, padding: spacing.md, borderRadius: 12, gap: 4 },
  highlightTitle: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  highlightSummary: { color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '700' },
  highlightDetail: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  textView: { gap: spacing.md },
});
