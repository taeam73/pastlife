import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { z } from 'zod';
import { StoryFinalMomentResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { StoryArtworkStatus } from '../src/components/StoryArtworkStatus';
import { useStoryArtwork } from '../src/results/useStoryArtworkSource';
import { loadSession } from '../src/session/store';
import { colors, spacing } from '../src/theme/tokens';
import { localeText, useLocale, useTranslate } from '../src/i18n/locale';

type FinalMoment = z.infer<typeof StoryFinalMomentResponseSchema>;

export default function FinalMomentScreen() {
  const { locale } = useLocale();
  const t = useTranslate();
  const router = useRouter();
  const params = useLocalSearchParams<{ resultId?: string }>();
  const { width } = useWindowDimensions();
  const [moment, setMoment] = useState<FinalMoment | null>(null);
  const illustration = useStoryArtwork(moment?.illustration.uri);
  const [error, setError] = useState<string | null>(null);
  const [finishBusy, setFinishBusy] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [parchmentSize, setParchmentSize] = useState({ width: 0, height: 0 });
  useEffect(() => { void (async () => {
    const session = await loadSession();
    const resultId = typeof params.resultId === 'string' ? params.resultId : session?.resultId;
    if (!resultId) { router.replace('/'); return; }
    try {
      const loaded = await api.finalMoment(resultId);
      setMoment(loaded);
      // Loading the actual final scene counts as reading it. Persist this here
      // so Android back gestures cannot leave sharing/download locked.
      try { await api.markFinalMomentRead(loaded.resultId); }
      catch { /* The finish button below provides an explicit retry. */ }
    }
    catch { setError(t('마지막 순간을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')); }
  })(); }, [params.resultId, router, t]);

  if (error) return <Screen><Text style={styles.error}>{error}</Text><PrimaryButton onPress={() => router.replace('/result')}>{t('결과로 돌아가기')}</PrimaryButton></Screen>;
  if (!moment) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  const illustrationHeight = Math.round(Math.min(width - spacing.lg * 2, 712) * 2 / 3);
  return <Screen logoInContent>
    <View style={styles.head}><Text style={styles.kicker}>{moment.year} · {moment.place}</Text><Text style={styles.heading}>{localeText(locale, { ko: `${moment.protagonist}의\n마지막 순간`, en: `${moment.protagonist}’s\nfinal moment`, th: `ช่วงสุดท้าย\nของ${moment.protagonist}`, ja: `${moment.protagonist}の\n最期の瞬間` })}</Text></View>
    <View style={[styles.illustration, { height: illustrationHeight }]}>
      {illustration.source && illustration.status !== 'error' ? <Image
        key={`${moment.illustration.uri}-${illustration.attempt}`}
        source={illustration.source}
        accessibilityLabel={moment.illustration.alt}
        resizeMode="cover"
        onLoad={illustration.markLoaded}
        onError={illustration.markFailed}
        style={StyleSheet.absoluteFill}
      /> : null}
      <StoryArtworkStatus status={illustration.status} onRetry={illustration.retry} />
    </View>
    <View testID="final-moment-parchment" style={styles.parchment} onLayout={({ nativeEvent: { layout } }) => {
      const width = Math.ceil(layout.width);
      const height = Math.ceil(layout.height);
      setParchmentSize((previous) => previous.width === width && previous.height === height ? previous : { width, height });
    }}>
      {parchmentSize.width > 0 && parchmentSize.height > 0 ? <Image testID="final-moment-texture" source={require('../assets/parchment/reader-texture.png')} resizeMode="stretch" style={[styles.texture, parchmentSize]} accessible={false} /> : null}
      <Text style={styles.sectionTitle}>{t('마지막 순간')}</Text>
      {moment.scene.split('\n\n').map((paragraph, index) => <Text key={index} style={styles.scene}>{paragraph}</Text>)}
      <View style={styles.rule} />
      <Text style={styles.narratorTitle}>{t('전생록의 기록')}</Text>
      <Text style={styles.afterword}>{moment.afterword}</Text>
    </View>
    {finishError ? <Text style={styles.error}>{finishError}</Text> : null}
    <PrimaryButton disabled={finishBusy} onPress={() => { void (async () => {
      setFinishBusy(true);
      setFinishError(null);
      try {
        await api.markFinalMomentRead(moment.resultId);
        router.replace({ pathname: '/result', params: { showExports: '1' } });
      } catch {
        setFinishError(t('읽은 기록을 저장하지 못했습니다. 다시 눌러 주세요.'));
      } finally { setFinishBusy(false); }
    })(); }}>{t('마지막 순간 마치기')}</PrimaryButton>
  </Screen>;
}

const styles = StyleSheet.create({
  head: { gap: 5, marginTop: spacing.lg },
  kicker: { color: colors.accent, fontSize: 13, lineHeight: 20 },
  heading: { color: colors.text, fontSize: 26, lineHeight: 34, fontWeight: '700' },
  illustration: { position: 'relative', width: '100%', overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: '#a4783d', backgroundColor: colors.surfaceRaised },
  parchment: { position: 'relative', overflow: 'hidden', borderRadius: 15, borderWidth: 2, borderColor: '#a4783d', backgroundColor: '#dcc79a', padding: spacing.lg, gap: spacing.md },
  texture: { position: 'absolute', top: 0, left: 0 },
  sectionTitle: { color: '#4a321e', fontSize: 23, lineHeight: 31, fontWeight: '800', textAlign: 'center' },
  scene: { color: '#4a321e', fontSize: 16, lineHeight: 27 },
  rule: { height: 1, backgroundColor: '#8a6841', marginVertical: spacing.sm },
  narratorTitle: { color: '#614020', fontSize: 16, lineHeight: 23, fontWeight: '700' },
  afterword: { color: '#4a321e', fontSize: 16, lineHeight: 27 },
  error: { color: colors.error, fontSize: 16 },
});
