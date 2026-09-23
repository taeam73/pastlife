import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { z } from 'zod';
import { ArchiveDetailResponseSchema } from '@pastlife/contracts';
import { api } from '../../src/api/client';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ResultExperience } from '../../src/components/ResultExperience';
import { Screen } from '../../src/components/Screen';
import { loadAuth } from '../../src/session/store';
import { colors, spacing } from '../../src/theme/tokens';
import { AppNav } from '../../src/components/AppNav';

type ArchiveDetail = z.infer<typeof ArchiveDetailResponseSchema>;

export default function ArchiveDetailScreen() {
  const router = useRouter();
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  const [detail, setDetail] = useState<ArchiveDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  useEffect(() => { void (async () => {
    const auth = await loadAuth();
    if (!auth || !resultId) { setError('이 기록을 열려면 로그인이 필요합니다.'); return; }
    try {
      setDetail(await api.archiveDetail(resultId, auth.accessToken));
    } catch { setError('저장된 기록을 열 수 없습니다. 아카이브에서 다시 선택해 주세요.'); }
  })(); }, [resultId]);
  const deleteArchive = async () => {
    const auth = await loadAuth();
    if (!auth || !resultId) { setDeleteError('기록을 삭제하려면 로그인이 필요합니다.'); return; }
    setDeleting(true); setDeleteError(null);
    try {
      await api.deleteArchive(resultId, auth.accessToken);
      router.replace('/archive');
    } catch {
      setDeleteError('기록을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setDeleting(false);
    }
  };
  if (error) return <Screen><Text style={styles.error}>{error}</Text><PrimaryButton onPress={() => router.replace('/archive')}>아카이브로 돌아가기</PrimaryButton></Screen>;
  if (!detail) return <Screen scroll={false}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Screen><Text style={styles.eyebrow}>저장된 전생 기록 No.{String(detail.recordNo).padStart(2, '0')}</Text><Text style={styles.headline}>{detail.headline}</Text><ResultExperience image={detail.image} blocks={detail.blocks} highlights={detail.highlights} />{detail.disclaimer ? <Text style={styles.disclaimer}>{detail.disclaimer}</Text> : null}<PrimaryButton onPress={() => router.replace('/archive')}>나의 전생으로 돌아가기</PrimaryButton>{confirmDelete ? <><Text accessibilityRole="alert" style={styles.deleteWarning}>이 기록을 아카이브에서 삭제할까요? 현재 결과와 익명 판정 데이터는 삭제되지 않습니다.</Text>{deleteError ? <Text accessibilityRole="alert" style={styles.error}>{deleteError}</Text> : null}<PrimaryButton disabled={deleting} onPress={() => void deleteArchive()}>{deleting ? '삭제 중' : '삭제 확인'}</PrimaryButton><PrimaryButton disabled={deleting} onPress={() => { setConfirmDelete(false); setDeleteError(null); }}>취소</PrimaryButton></> : <PrimaryButton onPress={() => setConfirmDelete(true)}>기록 삭제</PrimaryButton>}<AppNav /></Screen>;
}

const styles = StyleSheet.create({ eyebrow: { color: colors.accent, fontSize: 15 }, headline: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '700' }, disclaimer: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.md }, deleteWarning: { color: colors.text, lineHeight: 23, padding: spacing.md, backgroundColor: colors.surfaceRaised, borderRadius: 14 }, error: { color: colors.error, lineHeight: 23 } });
