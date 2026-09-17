import { useEffect, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { BasicResultResponseSchema } from '@pastlife/contracts';
import { api } from '../src/api/client';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ResultExperience } from '../src/components/ResultExperience';
import { Screen } from '../src/components/Screen';
import { loadAuth, loadPreferences, loadSession, saveViewMode, type ViewMode } from '../src/session/store';
import { startNewSession } from '../src/session/start';
import { colors, spacing } from '../src/theme/tokens';
import { trackEvent } from '../src/analytics/track';
import { AsyncActionStatus, type AsyncStatus } from '../src/components/AsyncActionStatus';
import { UnlockAction } from '../src/components/UnlockAction';

type BasicResult = z.infer<typeof BasicResultResponseSchema>;

export default function ResultScreen() {
  const router = useRouter();
  const [result, setResult] = useState<BasicResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('VIDEO');
  const [muted, setMuted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareStatuses, setShareStatuses] = useState<Record<'VIDEO' | 'IMAGE', AsyncStatus>>({ VIDEO: 'IDLE', IMAGE: 'IDLE' });

  useEffect(() => { void (async () => {
    const session = await loadSession();
    if (!session?.resultId) { setError('결과 기록을 찾을 수 없습니다.'); return; }
    try {
      const [loaded, preferences] = await Promise.all([api.basic(session.resultId), loadPreferences()]);
      setResult(loaded); setViewMode(session.viewMode); setMuted(!preferences.bgmEnabled); setReduceMotion(preferences.reduceMotion);
      void trackEvent('basic_result_viewed', { sessionId: session.sessionId, resultId: loaded.resultId, contentVersion: session.contentVersion, viewMode: session.viewMode, locale: 'ko' });
    } catch { setError('기본 결과를 불러오지 못했습니다.'); }
  })(); }, []);

  const changeMode = async (mode: ViewMode) => {
    const session = await loadSession(); if (!session) return;
    setViewMode(mode); await Promise.all([api.setViewMode(session.sessionId, mode), saveViewMode(mode)]);
    void trackEvent('view_mode_changed', { sessionId: session.sessionId, contentVersion: session.contentVersion, viewMode: mode, ...(result ? { resultId: result.resultId } : {}) });
  };
  const share = async (type: 'VIDEO' | 'IMAGE') => {
    if (!result) return;
    setShareStatuses((current) => ({ ...current, [type]: 'LOADING' }));
    try {
      const session = await loadSession();
      void trackEvent('share_format_selected', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: type });
      const asset = await api.shareAsset(result.resultId, type);
      void trackEvent('share_asset_ready', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: type });
      const outcome = await Share.share({ message: `${asset.deepLink}\n${type === 'VIDEO' ? '영상 공유 템플릿' : '이미지 공유 카드'}가 준비되었습니다.`, url: asset.deepLink });
      if (outcome.action === Share.sharedAction) void trackEvent('share_completed', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId, shareFormat: type });
      setShareStatuses((current) => ({ ...current, [type]: 'READY' }));
    } catch {
      setShareStatuses((current) => ({ ...current, [type]: 'ERROR' }));
    }
  };
  const restart = async () => { await startNewSession('restart'); router.replace('/guide'); };

  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>;
  if (!result) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen>
    <Text style={styles.eyebrow}>전생 기록 No.{String(result.recordNo).padStart(2, '0')} 발견</Text>
    <Text style={styles.headline}>{result.headline}</Text>
    <ResultExperience image={result.image} blocks={result.blocks} viewMode={viewMode} durationMs={18_000} muted={muted} reduceMotion={reduceMotion} onMutedChange={setMuted} onViewModeChange={changeMode} />
    <Text style={styles.disclaimer}>{result.disclaimer}</Text>
    <UnlockAction label="광고 시청 후 심화 보기" loadingLabel="광고를 준비하고 있습니다" onUnlock={async () => { const session = await loadSession(); if (!session?.sessionId) throw new Error('Session not found'); void trackEvent('deep_cta_clicked', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion }); void trackEvent('ad_started', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); try { await api.fakeAd(session.sessionId, 2); } catch (error) { void trackEvent('ad_failed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); throw error; } void trackEvent('ad_completed', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion, adPlacement: 2 }); void trackEvent('deep_unlocked', { sessionId: session.sessionId, resultId: result.resultId, contentVersion: session.contentVersion }); router.replace('/deep'); }} />
    <PrimaryButton disabled={shareStatuses.VIDEO === 'LOADING'} onPress={() => void share('VIDEO')}>영상 공유</PrimaryButton>
    <AsyncActionStatus status={shareStatuses.VIDEO} loadingText="영상 공유물을 만들고 있습니다." readyText="영상 공유 준비를 마쳤습니다." errorText="영상 공유물을 만들지 못했습니다. 이미지 공유는 계속 사용할 수 있습니다." onRetry={() => void share('VIDEO')} />
    <PrimaryButton disabled={shareStatuses.IMAGE === 'LOADING'} onPress={() => void share('IMAGE')}>이미지 공유</PrimaryButton>
    <AsyncActionStatus status={shareStatuses.IMAGE} loadingText="이미지 공유 카드를 만들고 있습니다." readyText="이미지 공유 준비를 마쳤습니다." errorText="이미지 공유 카드를 만들지 못했습니다. 잠시 후 다시 시도해 주세요." onRetry={() => void share('IMAGE')} />
    <PrimaryButton onPress={async () => { const auth = await loadAuth(); if (!auth) { router.push({ pathname: './login', params: { resultId: result.resultId } }); return; } await api.archive(result.resultId, auth.accessToken); const session = await loadSession(); void trackEvent('archive_saved', { ...(session ? { sessionId: session.sessionId, contentVersion: session.contentVersion } : {}), resultId: result.resultId }); router.replace('/archive'); }}>아카이브에 저장하기</PrimaryButton>
    <PrimaryButton onPress={() => void restart()}>또 다른 전생 기록 찾아보기</PrimaryButton>
  </Screen>;
}

const styles = StyleSheet.create({ eyebrow: { color: colors.accent, fontSize: 15 }, headline: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '700' }, disclaimer: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.md }, error: { color: colors.error, fontSize: 16 } });
