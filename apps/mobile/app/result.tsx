import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import type { z } from 'zod';
import { BasicResultResponseSchema } from '@pastlife/contracts';
import { isContentLocaleAvailable } from '@pastlife/content/locales';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ResultExperience } from '../src/components/ResultExperience';
import { ShareProfileCard } from '../src/components/ShareProfileCard';
import { renderShareProfileImage } from '../src/results/shareProfileImage';
import { downloadRecordPdf, renderRecordPdf } from '../src/results/exportRecordPdf';
import { Screen } from '../src/components/Screen';
import { loadAuth, loadSession } from '../src/session/store';
import { startNewSession } from '../src/session/start';
import { colors, spacing } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';
import { AsyncActionStatus, type AsyncStatus } from '../src/components/AsyncActionStatus';
import { UnlockAction } from '../src/components/UnlockAction';
import { ParchmentButton } from '../src/components/ParchmentButton';
import { AppNav } from '../src/components/AppNav';
import { SceneTransition } from '../src/components/SceneTransition';
import { unlockWithRewardedAd } from '../src/ads/unlock';
import { localeText, useLocale, useTranslate } from '../src/i18n/locale';

type BasicResult = z.infer<typeof BasicResultResponseSchema>;

export default function ResultScreen() {
  const { locale, setLocale } = useLocale();
  const t = useTranslate();
  const router = useRouter();
  const [result, setResult] = useState<BasicResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageShareStatus, setImageShareStatus] = useState<AsyncStatus>('IDLE');
  const [pdfStatus, setPdfStatus] = useState<AsyncStatus>('IDLE');
  const [showShareCard, setShowShareCard] = useState(false);
  const [deepUnlocked, setDeepUnlocked] = useState(false);
  const shareCardRef = useRef<View>(null);
  const shareCardReadyRef = useRef(false);
  const shareCardReadyResolverRef = useRef<(() => void) | null>(null);
  const pageScrollRef = useRef<ScrollView>(null);

  useEffect(() => { void (async () => {
    const session = await loadSession();
    if (!session?.resultId) { setError(t('결과 기록을 찾을 수 없습니다.')); return; }
    if (session.locale && !isContentLocaleAvailable(session.locale, process.env.NODE_ENV === 'production')) { setError(t('이 결과의 영어 번역은 아직 준비되지 않았습니다.')); return; }
    if (session.locale && session.locale !== locale) { await setLocale(session.locale); return; }
    void api.adStatus(session.sessionId, 2).then((status) => setDeepUnlocked(status.unlocked)).catch(() => undefined);
    try {
      const loaded = await api.basic(session.resultId);
      if (loaded.presentation?.version !== 3 || !loaded.presentation.hero.cover) throw new Error('3.0 presentation required');
      setResult(loaded);
      void trackEvent('basic_result_viewed', { sessionId: session.sessionId, resultId: loaded.resultId, contentVersion: session.contentVersion, viewMode: 'TEXT', locale });
    } catch (cause) {
      const code = (cause as { body?: { code?: string } })?.body?.code;
      setError(t(code === 'TRANSLATION_NOT_READY' ? '이 결과의 영어 번역은 아직 준비되지 않았습니다.' : '기본 결과를 불러오지 못했습니다.'));
    }
  })(); }, [locale, setLocale, t]);

  const shareImage = async () => {
    if (!result) return;
    setImageShareStatus('LOADING');
    try {
      const session = await loadSession();
      void trackEvent('share_format_selected', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: 'IMAGE' });
      await api.shareAsset(result.resultId, 'IMAGE', locale);
      const waitForNativeImages = Platform.OS !== 'web' && !shareCardReadyRef.current
        ? new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => { shareCardReadyResolverRef.current = null; reject(new Error('Share card images did not load')); }, 10000);
          shareCardReadyResolverRef.current = () => { clearTimeout(timeout); resolve(); };
        })
        : null;
      setShowShareCard(true);
      if (waitForNativeImages) await waitForNativeImages;
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const target = shareCardRef.current;
      if (!target) throw new Error('Share card is not ready');
      const capturedUri = Platform.OS === 'web' && result.presentation?.version === 3 && result.presentation.hero.cover
        ? await renderShareProfileImage({ name: result.character?.name ?? t('전생의 나'), recordNo: result.recordNo, cover: result.presentation.hero.cover, layers: result.image.layers ?? [], relationship: result.presentation.chapters.find((chapter) => chapter.id === 'MEETING')?.profilePages?.flatMap((page) => page.body.split('\n')).find((line) => /^(가까운 사람|가족|친구|곁에 있던 사람|People close to him|คนใกล้ตัว)\s*[·:]/u.test(line)) ?? '', locale })
        : await captureRef(target, { format: 'png', quality: 1, result: 'tmpfile' });
      void trackEvent('share_asset_ready', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: 'IMAGE' });
      let shared = false;
      if (Platform.OS === 'web') {
        const blob = await (await fetch(capturedUri)).blob();
        const file = new File([blob], `${locale === 'ko' ? '전생록' : 'past-life-archive'}-${result.resultId}.png`, { type: 'image/png' });
        if (/Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.canShare?.({ files: [file] }) && navigator.share) {
          await navigator.share({ files: [file], title: localeText(locale, { ko: '전생록 이미지', en: 'Past Life Archive image', th: 'ภาพบันทึกชาติก่อน', ja: '前世録の画像' }) });
          shared = true;
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          shared = true;
        }
      } else {
        if (!await Sharing.isAvailableAsync()) throw new Error('Image file sharing is unavailable on this device');
        await Sharing.shareAsync(capturedUri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: localeText(locale, { ko: '전생록 이미지', en: 'Past Life Archive image', th: 'ภาพบันทึกชาติก่อน', ja: '前世録の画像' }) });
        shared = true;
      }
      if (shared) void trackEvent('share_completed', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: 'IMAGE' });
      setImageShareStatus('READY');
    } catch {
      setImageShareStatus('ERROR');
    }
  };
  const downloadPdf = async () => {
    if (!result || !result.finalMomentRead || result.presentation?.version !== 3 || !result.presentation.hero.cover) return;
    setPdfStatus('LOADING');
    try {
      const finalMoment = await api.finalMoment(result.resultId);
      const record = {
        locale,
        resultId: result.resultId,
        recordNo: result.recordNo,
        name: result.character?.name ?? t('전생의 나'),
        cover: result.presentation.hero.cover,
        backgroundUri: result.presentation.hero.backgroundUri,
        characterUri: result.presentation.hero.characterUri,
        chapters: result.presentation.chapters,
        finalMoment: { year: finalMoment.year, place: finalMoment.place, scene: finalMoment.scene, afterword: finalMoment.afterword, illustrationUri: finalMoment.illustration.uri },
      };
      if (Platform.OS === 'web') {
        const pdf = await renderRecordPdf(record);
        downloadRecordPdf(pdf, result.character?.name ?? t('전생의 나'), result.resultId, locale);
      } else {
        const { shareNativeRecordPdf } = await import('../src/results/exportNativeRecordPdf');
        await shareNativeRecordPdf(record);
      }
      setPdfStatus('READY');
    } catch {
      setPdfStatus('ERROR');
    }
  };
  const restart = async () => { await startNewSession('restart'); router.replace('/guide'); };

  if (error) return <Screen><Text style={styles.error}>{error}</Text><PrimaryButton onPress={() => router.replace('/')}>{t('홈으로 돌아가기')}</PrimaryButton></Screen>;
  if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen fullBleed logoInContent scrollRef={pageScrollRef}>
    <SceneTransition variant="result" trigger={result.resultId} style={styles.resultReveal}>
    <View style={styles.resultHeader}>
      <View style={styles.headerSpacer} />
      <Text style={styles.eyebrow}>{t('전생 기록')} No.{String(result.recordNo).padStart(2, '0')} {t('발견')}</Text>
    </View>
    <Text style={styles.headline}>{result.headline}</Text>
    <ResultExperience image={result.image} blocks={result.blocks} highlights={result.highlights} character={result.character} lifeSummary={result.lifeSummary} headline={result.headline} presentation={result.presentation} recordNo={result.recordNo} onChapterSelect={() => pageScrollRef.current?.scrollTo({ y: 0, animated: false })} />
    <View style={styles.actionRail}>
    {!result.finalMomentAvailable
      ? <><ParchmentButton label={t('마지막 순간 준비 중')} disabled onPress={() => undefined} /><Text style={styles.lockNotice}>{t('이 이야기의 마지막 순간은 준비 중입니다.')}</Text></>
      : <UnlockAction appearance="parchment" label={t(deepUnlocked ? '마지막 순간 보러 가기' : '광고 보고 마지막 순간 보러 가기')} loadingLabel={t('광고를 준비하고 있어요')} onUnlock={async () => { const session = await loadSession(); if (!session?.sessionId) throw new Error('Session not found'); if (!deepUnlocked) void trackEvent('ad_started', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); try { await unlockWithRewardedAd(session.sessionId, 2); } catch (error) { void trackEvent('ad_failed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); throw error; } if (!deepUnlocked) void trackEvent('ad_completed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); setDeepUnlocked(true); router.push('/final-moment'); }} />}
    <PrimaryButton disabled onPress={() => undefined}>{t('영상 공유 · 출시 예정')}</PrimaryButton>
    <Text style={styles.videoNotice}>{t('영상 보기와 영상 공유는 첫 출시 이후 제공됩니다.')}</Text>
    {!result.finalMomentRead ? <Text style={[styles.lockNotice, styles.combinedLockNotice]}>{t('마지막 순간을 보고 나면 이미지 공유/전생기록 다운로드가 활성화됩니다.')}</Text> : null}
    <PrimaryButton disabled={imageShareStatus === 'LOADING' || !result.finalMomentRead} showWhenDisabled onPress={() => void shareImage()}>{t('이미지 공유')}</PrimaryButton>
    <>
      <PrimaryButton disabled={pdfStatus === 'LOADING' || !result.finalMomentRead} showWhenDisabled onPress={() => void downloadPdf()}>{t('전생기록 다운로드')}</PrimaryButton>
      <AsyncActionStatus status={pdfStatus} loadingText={t('전생기록 PDF를 만들고 있습니다.')} readyText={t(Platform.OS === 'web' ? '전생기록 PDF를 저장했습니다.' : 'PDF 공유창을 열었습니다. 저장 위치를 선택해 주세요.')} errorText={t('PDF를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.')} onRetry={() => void downloadPdf()} />
    </>
    {showShareCard && result.presentation?.version === 3 && result.presentation.hero.cover ? <View ref={shareCardRef} collapsable={false} style={styles.shareCardFrame}>
      <ShareProfileCard name={result.character?.name ?? t('전생의 나')} recordNo={result.recordNo} cover={result.presentation.hero.cover} layers={result.image.layers ?? []} relationship={result.presentation.chapters.find((chapter) => chapter.id === 'MEETING')?.profilePages?.flatMap((page) => page.body.split('\n')).find((line) => /^(가까운 사람|가족|친구|곁에 있던 사람|People close to him)\s*[·:]/u.test(line)) ?? ''} onImagesReady={() => { shareCardReadyRef.current = true; shareCardReadyResolverRef.current?.(); shareCardReadyResolverRef.current = null; }} />
    </View> : null}
    <AsyncActionStatus status={imageShareStatus} loadingText={t('이미지 공유 카드를 만들고 있습니다.')} readyText={t('이미지 파일을 준비했습니다.')} errorText={t('이미지 공유 카드를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.')} onRetry={() => void shareImage()} />
    <View style={styles.secondaryActions}>
      <View style={styles.secondaryAction}><ParchmentButton tone="muted" label={t('아카이브에 저장하기')} onPress={async () => { const auth = await loadAuth(); if (!auth) { router.push({ pathname: './login', params: { resultId: result.resultId } }); return; } await api.archive(result.resultId, auth.accessToken); const session = await loadSession(); void trackEvent('archive_saved', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId }); router.replace('/archive'); }} /></View>
      <View style={styles.secondaryAction}><ParchmentButton tone="muted" label={t('또 다른 전생 기록 찾아보기')} onPress={() => void restart()} /></View>
    </View>
    <AppNav />
    </View>
    </SceneTransition>
  </Screen>;
}

const styles = StyleSheet.create({ resultReveal: { width: '100%' }, actionRail: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.md }, secondaryActions: { width: '100%', flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm }, secondaryAction: { flex: 1, minWidth: 0, justifyContent: 'center' }, shareCardFrame: { width: '100%', maxWidth: 480, alignSelf: 'center' }, resultHeader: { display: 'none' }, headerSpacer: { flex: 1 }, eyebrow: { color: colors.accent, fontSize: 14, lineHeight: 20, opacity: 0.9, textAlign: 'right' }, headline: { display: 'none' }, lockNotice: { color: colors.muted, fontSize: 14, lineHeight: 21 }, combinedLockNotice: { textAlign: 'center' }, videoNotice: { display: 'none' }, error: { color: colors.error, fontSize: 16 } });
