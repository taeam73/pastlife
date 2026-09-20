import { AnalyticsEventResponseSchema, ArchiveDetailResponseSchema, ArchiveResponseSchema, ArchiveSaveResponseSchema, AuthResponseSchema, BasicResultResponseSchema, CompleteResponseSchema, CreateAnalyticsEventRequestSchema, CreateSessionResponseSchema, ExtendedResultResponseSchema, GoogleExchangeRequestSchema, ProgressResponseSchema, QuestionResponseSchema, ResultStatusResponseSchema, ShareAssetResponseSchema, ShareResultResponseSchema, UnlockResponseSchema, ViewModeResponseSchema } from '@pastlife/contracts';
import type { AnalyticsEventName, AnalyticsMetadata } from '@pastlife/contracts';
import type { ViewMode } from '../session/store';
import type { z } from 'zod';

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
  createSession: (deviceId: string, preferredViewMode: ViewMode = 'TEXT') => request('/sessions', { method: 'POST', body: JSON.stringify({ locale: 'ko', deviceId, preferredViewMode }) }, CreateSessionResponseSchema),
  question: (sessionId: string, stage: number) => request(`/sessions/${sessionId}/questions/${stage}`, { method: 'GET' }, QuestionResponseSchema),
  answer: (sessionId: string, stage: number, questionId: string, choiceId: string) => request(`/sessions/${sessionId}/answers/${stage}`, { method: 'PUT', body: JSON.stringify({ questionId, choiceId }) }, ProgressResponseSchema),
  complete: (sessionId: string) => request(`/sessions/${sessionId}/complete`, { method: 'POST' }, CompleteResponseSchema),
  status: (resultId: string) => request(`/results/${resultId}/status`, { method: 'GET' }, ResultStatusResponseSchema),
  setViewMode: (sessionId: string, viewMode: ViewMode) => request(`/sessions/${sessionId}/view-mode`, { method: 'PATCH', body: JSON.stringify({ viewMode }) }, ViewModeResponseSchema),
  fakeAd1: (sessionId: string) => request(`/sessions/${sessionId}/ads/1/complete`, { method: 'POST', body: JSON.stringify({ providerEventId: `fake-ad-1-${sessionId}` }) }, UnlockResponseSchema),
  fakeAd: (sessionId: string, slot: 1 | 2 | 3) => request(`/sessions/${sessionId}/ads/${slot}/complete`, { method: 'POST', body: JSON.stringify({ providerEventId: `fake-ad-${slot}-${sessionId}` }) }, UnlockResponseSchema),
  basic: (resultId: string) => request(`/results/${resultId}/basic`, { method: 'GET' }, BasicResultResponseSchema),
  deep: (resultId: string) => request(`/results/${resultId}/deep`, { method: 'GET' }, ExtendedResultResponseSchema),
  guide: (resultId: string) => request(`/results/${resultId}/guide`, { method: 'GET' }, ExtendedResultResponseSchema),
  share: (resultId: string) => request(`/results/${resultId}/share`, { method: 'GET' }, ShareResultResponseSchema),
  shareAsset: (resultId: string, type: 'VIDEO' | 'IMAGE') => request(`/results/${resultId}/share-assets`, { method: 'POST', body: JSON.stringify({ type, locale: 'ko' }) }, ShareAssetResponseSchema),
  archive: (resultId: string, accessToken: string) => request(`/auth/archive/${resultId}`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } }, ArchiveSaveResponseSchema),
  archiveList: (accessToken: string) => request('/auth/archive', { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }, ArchiveResponseSchema),
  archiveDetail: (resultId: string, accessToken: string) => request(`/auth/archive/${resultId}`, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }, ArchiveDetailResponseSchema),
  deleteArchive: (resultId: string, accessToken: string) => requestNoContent(`/auth/archive/${resultId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }),
};
