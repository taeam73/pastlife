import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import type { z } from 'zod';
import { BasicResultResponseSchema } from '@pastlife/contracts';
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

type BasicResult = z.infer<typeof BasicResultResponseSchema>;

export default function ResultScreen() {
  const router = useRouter();
  const [result, setResult] = useState<BasicResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageShareStatus, setImageShareStatus] = useState<AsyncStatus>('IDLE');
  const [pdfStatus, setPdfStatus] = useState<AsyncStatus>('IDLE');
  const [showShareCard, setShowShareCard] = useState(false);
  const [isStory3, setIsStory3] = useState(false);
  const resultCardRef = useRef<View>(null);
  const shareCardRef = useRef<View>(null);
  const shareCardReadyRef = useRef(false);
  const shareCardReadyResolverRef = useRef<(() => void) | null>(null);
  const pageScrollRef = useRef<ScrollView>(null);

  useEffect(() => { void (async () => {
    const session = await loadSession();
    if (!session?.resultId) { setError('결과 기록을 찾을 수 없습니다.'); return; }
    setIsStory3(session.contentVersion.startsWith('3.'));
    try {
      const loaded = await api.basic(session.resultId);
      setResult(loaded);
      void trackEvent('basic_result_viewed', { sessionId: session.sessionId, resultId: loaded.resultId, contentVersion: session.contentVersion, viewMode: 'TEXT', locale: 'ko' });
    } catch { setError('기본 결과를 불러오지 못했습니다.'); }
  })(); }, []);

  const shareImage = async () => {
    if (!result) return;
    setImageShareStatus('LOADING');
    try {
      const session = await loadSession();
      void trackEvent('share_format_selected', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: 'IMAGE' });
      const asset = await api.shareAsset(result.resultId, 'IMAGE');
      if (isStory3) {
        const waitForNativeImages = Platform.OS !== 'web' && !shareCardReadyRef.current
          ? new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => { shareCardReadyResolverRef.current = null; reject(new Error('Share card images did not load')); }, 10000);
            shareCardReadyResolverRef.current = () => { clearTimeout(timeout); resolve(); };
          })
          : null;
        setShowShareCard(true);
        if (waitForNativeImages) await waitForNativeImages;
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      }
      const target = isStory3 ? shareCardRef.current : resultCardRef.current;
      if (!target) throw new Error('Share card is not ready');
      const capturedUri = Platform.OS === 'web' && isStory3 && result.presentation?.version === 3 && result.presentation.hero.cover
        ? await renderShareProfileImage({ name: result.character?.name ?? '전생의 나', recordNo: result.recordNo, cover: result.presentation.hero.cover, layers: result.image.layers ?? [], relationship: result.presentation.chapters.find((chapter) => chapter.id === 'MEETING')?.profilePages?.flatMap((page) => page.body.split('\n')).find((line) => /^(가까운 사람|가족|친구|곁에 있던 사람)\s*[·:]/u.test(line)) ?? '' })
        : await captureRef(target, { format: 'png', quality: 1, result: 'tmpfile' });
      void trackEvent('share_asset_ready', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: 'IMAGE' });
      let shared = false;
      if (Platform.OS === 'web') {
        const blob = await (await fetch(capturedUri)).blob();
        const file = new File([blob], `전생록-${result.resultId}.png`, { type: 'image/png' });
        if (/Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.canShare?.({ files: [file] }) && navigator.share) {
          await navigator.share({ files: [file], title: '전생록 이미지' });
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
        if (isStory3) {
          if (!await Sharing.isAvailableAsync()) throw new Error('Image file sharing is unavailable on this device');
          await Sharing.shareAsync(capturedUri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: '전생록 이미지' });
          shared = true;
        } else {
          const outcome = await Share.share({ message: `${asset.deepLink}\n이미지 공유 카드가 준비되었습니다.`, url: capturedUri });
          shared = outcome.action === Share.sharedAction;
        }
      }
      if (shared) void trackEvent('share_completed', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: 'IMAGE' });
      setImageShareStatus('READY');
    } catch {
      setImageShareStatus('ERROR');
    }
  };
  const downloadPdf = async () => {
    if (!result || !isStory3 || !result.finalMomentRead || result.presentation?.version !== 3 || !result.presentation.hero.cover) return;
    setPdfStatus('LOADING');
    try {
      const finalMoment = await api.finalMoment(result.resultId);
      const record = {
        resultId: result.resultId,
        recordNo: result.recordNo,
        name: result.character?.name ?? '전생의 나',
        cover: result.presentation.hero.cover,
        backgroundUri: result.presentation.hero.backgroundUri,
        characterUri: result.presentation.hero.characterUri,
        chapters: result.presentation.chapters,
        finalMoment: { year: finalMoment.year, place: finalMoment.place, scene: finalMoment.scene, afterword: finalMoment.afterword, illustrationUri: finalMoment.illustration.uri },
      };
      if (Platform.OS === 'web') {
        const pdf = await renderRecordPdf(record);
        downloadRecordPdf(pdf, result.character?.name ?? '전생의 나', result.resultId);
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

  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>;
  if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen fullBleed logoInContent scrollRef={pageScrollRef}>
    <SceneTransition variant="result" trigger={result.resultId} style={styles.resultReveal}>
    <View style={styles.resultHeader}>
      <View style={styles.headerSpacer} />
      <Text style={styles.eyebrow}>전생 기록 No.{String(result.recordNo).padStart(2, '0')} 발견</Text>
    </View>
    <Text style={styles.headline}>{result.headline}</Text>
    <ResultExperience ref={resultCardRef} image={result.image} blocks={result.blocks} highlights={result.highlights} character={result.character} lifeSummary={result.lifeSummary} headline={result.headline} presentation={result.presentation} recordNo={result.recordNo} onChapterSelect={() => pageScrollRef.current?.scrollTo({ y: 0, animated: false })} />
    <View style={styles.actionRail}>
    {isStory3 && !result.finalMomentAvailable
      ? <><ParchmentButton label="마지막 순간 준비 중" disabled onPress={() => undefined} /><Text style={styles.lockNotice}>이 이야기의 마지막 순간은 준비 중입니다.</Text></>
      : <UnlockAction appearance="parchment" label={isStory3 ? '광고 보고 마지막 순간 보러 가기' : '광고 보고 더 자세히 보기'} loadingLabel="광고를 준비하고 있어요" onUnlock={async () => { const session = await loadSession(); if (!session?.sessionId) throw new Error('Session not found'); if (!isStory3) void trackEvent('deep_cta_clicked', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion }); void trackEvent('ad_started', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); try { await api.fakeAd(session.sessionId, 2); } catch (error) { void trackEvent('ad_failed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); throw error; } void trackEvent('ad_completed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); if (!isStory3) void trackEvent('deep_unlocked', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion }); router.push(isStory3 ? '/final-moment' : '/deep'); }} />}
    <PrimaryButton disabled onPress={() => undefined}>영상 공유 · 출시 예정</PrimaryButton>
    <Text style={styles.videoNotice}>영상 보기와 영상 공유는 첫 출시 이후 제공됩니다.</Text>
    {isStory3 && !result.finalMomentRead ? <Text style={[styles.lockNotice, styles.combinedLockNotice]}>마지막 순간을 보고 나면 이미지 공유/전생기록 다운로드가 활성화됩니다.</Text> : null}
    <PrimaryButton disabled={imageShareStatus === 'LOADING' || (isStory3 && !result.finalMomentRead)} showWhenDisabled={isStory3} onPress={() => void shareImage()}>이미지 공유</PrimaryButton>
    {isStory3 ? <>
      <PrimaryButton disabled={pdfStatus === 'LOADING' || !result.finalMomentRead} showWhenDisabled onPress={() => void downloadPdf()}>전생기록 다운로드</PrimaryButton>
      <AsyncActionStatus status={pdfStatus} loadingText="전생기록 PDF를 만들고 있습니다." readyText={Platform.OS === 'web' ? '전생기록 PDF를 저장했습니다.' : 'PDF 공유창을 열었습니다. 저장 위치를 선택해 주세요.'} errorText="PDF를 만들지 못했습니다. 잠시 후 다시 시도해 주세요." onRetry={() => void downloadPdf()} />
    </> : null}
    {isStory3 && showShareCard && result.presentation?.version === 3 && result.presentation.hero.cover ? <View ref={shareCardRef} collapsable={false} style={styles.shareCardFrame}>
      <ShareProfileCard name={result.character?.name ?? '전생의 나'} recordNo={result.recordNo} cover={result.presentation.hero.cover} layers={result.image.layers ?? []} relationship={result.presentation.chapters.find((chapter) => chapter.id === 'MEETING')?.profilePages?.flatMap((page) => page.body.split('\n')).find((line) => /^(가까운 사람|가족|친구|곁에 있던 사람)\s*[·:]/u.test(line)) ?? ''} onImagesReady={() => { shareCardReadyRef.current = true; shareCardReadyResolverRef.current?.(); shareCardReadyResolverRef.current = null; }} />
    </View> : null}
    <AsyncActionStatus status={imageShareStatus} loadingText="이미지 공유 카드를 만들고 있습니다." readyText="이미지 파일을 준비했습니다." errorText="이미지 공유 카드를 만들지 못했습니다. 잠시 후 다시 시도해 주세요." onRetry={() => void shareImage()} />
    <View style={styles.secondaryActions}>
      <View style={styles.secondaryAction}><ParchmentButton tone="muted" label="아카이브에 저장하기" onPress={async () => { const auth = await loadAuth(); if (!auth) { router.push({ pathname: './login', params: { resultId: result.resultId } }); return; } await api.archive(result.resultId, auth.accessToken); const session = await loadSession(); void trackEvent('archive_saved', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId }); router.replace('/archive'); }} /></View>
      <View style={styles.secondaryAction}><ParchmentButton tone="muted" label="또 다른 전생 기록 찾아보기" onPress={() => void restart()} /></View>
    </View>
    <AppNav />
    </View>
    </SceneTransition>
  </Screen>;
}

const styles = StyleSheet.create({ resultReveal: { width: '100%' }, actionRail: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.md }, secondaryActions: { width: '100%', flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm }, secondaryAction: { flex: 1, minWidth: 0, justifyContent: 'center' }, shareCardFrame: { width: '100%', maxWidth: 480, alignSelf: 'center' }, resultHeader: { display: 'none' }, headerSpacer: { flex: 1 }, eyebrow: { color: colors.accent, fontSize: 14, lineHeight: 20, opacity: 0.9, textAlign: 'right' }, headline: { display: 'none' }, lockNotice: { color: colors.muted, fontSize: 14, lineHeight: 21 }, combinedLockNotice: { textAlign: 'center' }, videoNotice: { display: 'none' }, error: { color: colors.error, fontSize: 16 } });
