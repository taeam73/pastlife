import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { loadSession, saveResultId } from '../src/session/store';
import { colors } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';
import { showTransitionAd } from '../src/ads/admob';
import { localeText, useLocale, useTranslate } from '../src/i18n/locale';
import { remoteAssetSource } from '../src/results/assetUrl';

function warmResultArtwork(resultId: string) {
  void api.basic(resultId).then((result) => {
    const urls = [result.image.uri, result.presentation?.hero.backgroundUri, result.presentation?.hero.characterUri, ...((result.image.layers ?? []).map((layer) => layer.uri))]
      .filter((uri): uri is string => Boolean(uri))
      .map((uri) => uri.startsWith('asset://') ? remoteAssetSource(uri)?.uri : /^https?:\/\//u.test(uri) ? uri : undefined)
      .filter((uri): uri is string => Boolean(uri));
    if (Platform.OS === 'web') void Promise.allSettled([...new Set(urls)].map((uri) => Image.prefetch(uri)));
    else void import('../src/results/storyArtworkCache').then(({ ensureStoryArtworkFile }) =>
      Promise.allSettled([...new Set(urls)].map((uri) => ensureStoryArtworkFile(uri)))).catch(() => undefined);
  }).catch(() => undefined);
}

export default function AnalysisScreen() {
  const t = useTranslate();
  const { locale } = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    setPhase(0);
    const second = setTimeout(() => setPhase(1), 2000);
    const third = setTimeout(() => setPhase(2), 4000);
    return () => { clearTimeout(second); clearTimeout(third); };
  }, [retry]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const session = await loadSession();
      if (!session) { router.replace('/'); return; }
      try {
        const completed = session.resultId ? { resultId: session.resultId } : await api.complete(session.sessionId);
        await saveResultId(completed.resultId);
        const status = await api.status(completed.resultId);
        warmResultArtwork(completed.resultId);
        void trackEvent(status.imageStatus === 'FALLBACK' ? 'image_fallback_used' : 'image_ready', { sessionId: session.sessionId, resultId: completed.resultId, contentVersion: session.contentVersion, imageStatus: status.imageStatus === 'FALLBACK' ? 'FALLBACK' : 'READY' });
        // Make the ad transition explicit before opening the native ad. This
        // avoids the impression that the result flow was interrupted.
        if (active) setPhase(2);
        await new Promise((resolve) => setTimeout(resolve, 900));
        void trackEvent('ad_started', { sessionId: session.sessionId, resultId: completed.resultId, adPlacement: 1, contentVersion: session.contentVersion });
        try {
          if (Platform.OS !== 'web') await showTransitionAd();
          void trackEvent('ad_completed', { sessionId: session.sessionId, resultId: completed.resultId, adPlacement: 1, contentVersion: session.contentVersion });
        } catch {
          void trackEvent('ad_failed', { sessionId: session.sessionId, resultId: completed.resultId, adPlacement: 1, contentVersion: session.contentVersion });
        }
        if (active) router.replace('/result');
      } catch { if (active) setError(t('복원 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.')); }
    })();
    return () => { active = false; };
  }, [retry, router, t]);

  const phases = [
    localeText(locale, { ko: '당신의 선택을 살펴보고 있습니다', en: 'Reading the choices you made', th: 'กำลังพิจารณาตัวเลือกของคุณ', ja: 'あなたの選択を読み解いています' }),
    t('당신의 전생 기록을 복원하고 있습니다'),
    localeText(locale, {
      ko: '전생 기록을 찾았습니다.\n짧은 광고 뒤에 결과가 열립니다.',
      en: 'Your record is ready.\nThe result opens after a short ad.',
      th: 'พบบันทึกของคุณแล้ว\nผลลัพธ์จะเปิดหลังโฆษณาสั้น ๆ',
      ja: '前世の記録が見つかりました。\n短い広告の後に結果が開きます。',
    }),
  ];
  return <ImageBackground source={require('../assets/branding/cinematic-question-bg.png')} resizeMode="cover" style={styles.background}><View pointerEvents="none" style={styles.overlay} /><Screen scroll={false} transparent logoInContent><View style={styles.center}><Text style={styles.kicker}>{localeText(locale, { ko: '기억의 문을 여는 중', en: 'Opening the door to memory', th: 'กำลังเปิดประตูแห่งความทรงจำ', ja: '記憶の扉を開いています' })}</Text><Text style={[styles.title, phase === 2 && styles.adNotice]}>{phases[phase]}</Text><ActivityIndicator color={colors.accent} size="large" />{error ? <View style={styles.errorBlock}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><PrimaryButton onPress={() => { setError(null); setRetry((value) => value + 1); }}>{t('다시 시도')}</PrimaryButton></View> : null}</View></Screen></ImageBackground>;
}

const styles = StyleSheet.create({ background: { flex: 1 }, overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4, 8, 16, 0.58)' }, center: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 22, paddingBottom: 40 }, kicker: { color: colors.accent, fontSize: 14, fontWeight: '700', letterSpacing: 1.2, textAlign: 'center' }, title: { color: '#fff8e8', fontSize: 25, lineHeight: 36, fontWeight: '700', textAlign: 'center', textShadowColor: 'rgba(0,0,0,.8)', textShadowRadius: 8 }, adNotice: { fontSize: 20, lineHeight: 30, fontWeight: '500' }, errorBlock: { width: '100%', gap: 14 }, error: { color: '#ffd7a0', fontSize: 16, lineHeight: 24, textAlign: 'center' } });
