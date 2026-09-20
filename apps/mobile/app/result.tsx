import { useEffect, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { BasicResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ResultExperience } from '../src/components/ResultExperience';
import { Screen } from '../src/components/Screen';
import { loadAuth, loadSession } from '../src/session/store';
import { startNewSession } from '../src/session/start';
import { colors, spacing } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';
import { AsyncActionStatus, type AsyncStatus } from '../src/components/AsyncActionStatus';
import { UnlockAction } from '../src/components/UnlockAction';

type BasicResult = z.infer<typeof BasicResultResponseSchema>;

export default function ResultScreen() {
  const router = useRouter();
  const [result, setResult] = useState<BasicResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageShareStatus, setImageShareStatus] = useState<AsyncStatus>('IDLE');

  useEffect(() => { void (async () => {
    const session = await loadSession();
    if (!session?.resultId) { setError('결과 기록을 찾을 수 없습니다.'); return; }
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
      void trackEvent('share_asset_ready', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: 'IMAGE' });
      const outcome = await Share.share({ message: `${asset.deepLink}\n이미지 공유 카드가 준비되었습니다.`, url: asset.deepLink });
      if (outcome.action === Share.sharedAction) void trackEvent('share_completed', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: 'IMAGE' });
      setImageShareStatus('READY');
    } catch {
      setImageShareStatus('ERROR');
    }
  };
  const restart = async () => { await startNewSession('restart'); router.replace('/guide'); };

  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>;
  if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen>
    <Text style={styles.eyebrow}>전생 기록 No.{String(result.recordNo).padStart(2, '0')} 발견</Text>
    <Text style={styles.headline}>{result.headline}</Text>
    <ResultExperience image={result.image} blocks={result.blocks} highlights={result.highlights} />
    <Text style={styles.disclaimer}>{result.disclaimer}</Text>
    <UnlockAction label="광고 시청 후 심화 보기" loadingLabel="광고를 준비하고 있습니다" onUnlock={async () => { const session = await loadSession(); if (!session?.sessionId) throw new Error('Session not found'); void trackEvent('deep_cta_clicked', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion }); void trackEvent('ad_started', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); try { await api.fakeAd(session.sessionId, 2); } catch (error) { void trackEvent('ad_failed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); throw error; } void trackEvent('ad_completed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); void trackEvent('deep_unlocked', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion }); router.replace('/deep'); }} />
    <PrimaryButton disabled onPress={() => undefined}>영상 공유 · 출시 예정</PrimaryButton>
    <Text style={styles.videoNotice}>영상 보기와 영상 공유는 첫 출시 이후 제공됩니다.</Text>
    <PrimaryButton disabled={imageShareStatus === 'LOADING'} onPress={() => void shareImage()}>이미지 공유</PrimaryButton>
    <AsyncActionStatus status={imageShareStatus} loadingText="이미지 공유 카드를 만들고 있습니다." readyText="이미지 공유 준비를 마쳤습니다." errorText="이미지 공유 카드를 만들지 못했습니다. 잠시 후 다시 시도해 주세요." onRetry={() => void shareImage()} />
    <PrimaryButton onPress={async () => { const auth = await loadAuth(); if (!auth) { router.push({ pathname: './login', params: { resultId: result.resultId } }); return; } await api.archive(result.resultId, auth.accessToken); const session = await loadSession(); void trackEvent('archive_saved', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId }); router.replace('/archive'); }}>아카이브에 저장하기</PrimaryButton>
    <PrimaryButton onPress={() => void restart()}>또 다른 전생 기록 찾아보기</PrimaryButton>
  </Screen>;
}

const styles = StyleSheet.create({ eyebrow: { color: colors.accent, fontSize: 15 }, headline: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '700' }, disclaimer: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.md }, videoNotice: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' }, error: { color: colors.error, fontSize: 16 } });
