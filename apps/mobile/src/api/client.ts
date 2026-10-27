import { AdChallengeResponseSchema, AdStatusResponseSchema, AnalyticsEventResponseSchema, ArchiveDetailResponseSchema, ArchiveResponseSchema, ArchiveSaveResponseSchema, AuthResponseSchema, BasicResultResponseSchema, CompleteResponseSchema, CreateAnalyticsEventRequestSchema, CreateSessionResponseSchema, FinalMomentReadResponseSchema, GoogleExchangeRequestSchema, ProgressResponseSchema, QuestionResponseSchema, ResultStatusResponseSchema, ShareAssetResponseSchema, ShareResultResponseSchema, StoryFinalMomentResponseSchema, UnlockResponseSchema, ViewModeResponseSchema } from '@pastlife/contracts';
import type { AnalyticsEventName, AnalyticsMetadata } from '@pastlife/contracts';
import type { ViewMode } from '../session/store';
import type { z } from 'zod';
import type { Locale } from '../i18n/locale';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const jsonHeaders = { 'Content-Type': 'application/json' };

async function request<S extends z.ZodType>(path: string, init: RequestInit, schema: S): Promise<z.infer<S>> {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...jsonHeaders, ...init.headers } });
  const body: unknown = await response.json();
  if (!response.ok) throw Object.assign(new Error((body as { message?: string }).message ?? '요청에 실패했습니다.'), { status: response.status, body });
  return schema.parse(body);
}

async function requestNoContent(path: string, init: RequestInit): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...jsonHeaders, ...init.headers } });
  if (response.ok) return;
  const body = await response.json().catch(() => ({})) as { message?: string };
  throw Object.assign(new Error(body.message ?? '요청에 실패했습니다.'), { status: response.status, body });
}

export const api = {
  analytics: (name: AnalyticsEventName, metadata: AnalyticsMetadata) => request('/analytics/events', { method: 'POST', body: JSON.stringify(CreateAnalyticsEventRequestSchema.parse({ name, metadata, occurredAt: new Date().toISOString() })) }, AnalyticsEventResponseSchema),
  exchangeGoogle: (idToken: string) => request('/auth/google/exchange', { method: 'POST', body: JSON.stringify(GoogleExchangeRequestSchema.parse({ idToken })) }, AuthResponseSchema),
  createSession: (deviceId: string, preferredViewMode: ViewMode = 'TEXT', locale: Locale = 'ko') => request('/sessions', { method: 'POST', body: JSON.stringify({ locale, deviceId, preferredViewMode }) }, CreateSessionResponseSchema),
  setSessionLocale: (sessionId: string, locale: Locale) => requestNoContent(`/sessions/${sessionId}/locale`, { method: 'PATCH', body: JSON.stringify({ locale }) }),
  question: (sessionId: string, stage: number) => request(`/sessions/${sessionId}/questions/${stage}`, { method: 'GET' }, QuestionResponseSchema),
  answer: (sessionId: string, stage: number, questionId: string, choiceId: string) => request(`/sessions/${sessionId}/answers/${stage}`, { method: 'PUT', body: JSON.stringify({ questionId, choiceId }) }, ProgressResponseSchema),
  complete: (sessionId: string) => request(`/sessions/${sessionId}/complete`, { method: 'POST' }, CompleteResponseSchema),
  status: (resultId: string) => request(`/results/${resultId}/status`, { method: 'GET' }, ResultStatusResponseSchema),
  setViewMode: (sessionId: string, viewMode: ViewMode) => request(`/sessions/${sessionId}/view-mode`, { method: 'PATCH', body: JSON.stringify({ viewMode }) }, ViewModeResponseSchema),
  fakeAd: (sessionId: string, slot: 2 | 3) => request(`/sessions/${sessionId}/ads/${slot}/complete`, { method: 'POST', body: JSON.stringify({ providerEventId: `fake-ad-${slot}-${sessionId}` }) }, UnlockResponseSchema),
  adChallenge: (sessionId: string, slot: 2 | 3) => request(`/sessions/${sessionId}/ads/${slot}/challenge`, { method: 'POST' }, AdChallengeResponseSchema),
  adStatus: (sessionId: string, slot: 1 | 2 | 3) => request(`/sessions/${sessionId}/ads/${slot}/status`, { method: 'GET' }, AdStatusResponseSchema),
  basic: (resultId: string) => request(`/results/${resultId}/basic`, { method: 'GET' }, BasicResultResponseSchema),
  finalMoment: (resultId: string) => request(`/results/${resultId}/final-moment`, { method: 'GET' }, StoryFinalMomentResponseSchema),
  markFinalMomentRead: (resultId: string) => request(`/results/${resultId}/final-moment/read`, { method: 'POST' }, FinalMomentReadResponseSchema),
  share: (resultId: string) => request(`/results/${resultId}/share`, { method: 'GET' }, ShareResultResponseSchema),
  shareAsset: (resultId: string, type: 'VIDEO' | 'IMAGE', locale: Locale = 'ko') => request(`/results/${resultId}/share-assets`, { method: 'POST', body: JSON.stringify({ type, locale }) }, ShareAssetResponseSchema),
  archive: (resultId: string, accessToken: string) => request(`/auth/archive/${resultId}`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } }, ArchiveSaveResponseSchema),
  archiveList: (accessToken: string, locale: Locale) => request(`/auth/archive?locale=${locale}`, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }, ArchiveResponseSchema),
  archiveDetail: (resultId: string, accessToken: string, locale: Locale) => request(`/auth/archive/${resultId}?locale=${locale}`, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }, ArchiveDetailResponseSchema),
  deleteArchive: (resultId: string, accessToken: string) => requestNoContent(`/auth/archive/${resultId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }),
};
