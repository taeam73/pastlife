import { ArchiveResponseSchema, ArchiveSaveResponseSchema, AuthResponseSchema, BasicResultResponseSchema, CompleteResponseSchema, CreateSessionResponseSchema, ExtendedResultResponseSchema, GoogleExchangeRequestSchema, ProgressResponseSchema, QuestionResponseSchema, ResultStatusResponseSchema, ShareResultResponseSchema, UnlockResponseSchema } from '@pastlife/contracts';
import type { z } from 'zod';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const jsonHeaders = { 'Content-Type': 'application/json' };

async function request<S extends z.ZodType>(path: string, init: RequestInit, schema: S): Promise<z.infer<S>> {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...jsonHeaders, ...init.headers } });
  const body: unknown = await response.json();
  if (!response.ok) throw Object.assign(new Error((body as { message?: string }).message ?? '요청에 실패했습니다.'), { status: response.status, body });
  return schema.parse(body);
}

export const api = {
  exchangeGoogle: (idToken: string) => request('/auth/google/exchange', { method: 'POST', body: JSON.stringify(GoogleExchangeRequestSchema.parse({ idToken })) }, AuthResponseSchema),
  createSession: () => request('/sessions', { method: 'POST', body: JSON.stringify({ locale: 'ko' }) }, CreateSessionResponseSchema),
  question: (sessionId: string, stage: number) => request(`/sessions/${sessionId}/questions/${stage}`, { method: 'GET' }, QuestionResponseSchema),
  answer: (sessionId: string, stage: number, questionId: string, choiceId: string) => request(`/sessions/${sessionId}/answers/${stage}`, { method: 'PUT', body: JSON.stringify({ questionId, choiceId }) }, ProgressResponseSchema),
  complete: (sessionId: string) => request(`/sessions/${sessionId}/complete`, { method: 'POST' }, CompleteResponseSchema),
  status: (resultId: string) => request(`/results/${resultId}/status`, { method: 'GET' }, ResultStatusResponseSchema),
  fakeAd1: (sessionId: string) => request(`/sessions/${sessionId}/ads/1/complete`, { method: 'POST', body: JSON.stringify({ providerEventId: `fake-ad-1-${sessionId}` }) }, UnlockResponseSchema),
  fakeAd: (sessionId: string, slot: 1 | 2 | 3) => request(`/sessions/${sessionId}/ads/${slot}/complete`, { method: 'POST', body: JSON.stringify({ providerEventId: `fake-ad-${slot}-${sessionId}` }) }, UnlockResponseSchema),
  basic: (resultId: string) => request(`/results/${resultId}/basic`, { method: 'GET' }, BasicResultResponseSchema),
  deep: (resultId: string) => request(`/results/${resultId}/deep`, { method: 'GET' }, ExtendedResultResponseSchema),
  guide: (resultId: string) => request(`/results/${resultId}/guide`, { method: 'GET' }, ExtendedResultResponseSchema),
  share: (resultId: string) => request(`/results/${resultId}/share`, { method: 'GET' }, ShareResultResponseSchema),
  archive: (resultId: string, accessToken: string) => request(`/auth/archive/${resultId}`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } }, ArchiveSaveResponseSchema),
  archiveList: (accessToken: string) => request('/auth/archive', { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }, ArchiveResponseSchema),
};
