import { api } from '../api/client';
import { getOrCreateDeviceId, loadSession, saveSession } from './store';
import { trackEvent } from '../analytics/track';

export async function startNewSession(source: 'main' | 'restart' = 'main') {
  const deviceId = await getOrCreateDeviceId();
  const current = await loadSession();
  if (source === 'restart' && current) void trackEvent('new_past_life_clicked', { sessionId: current.sessionId, contentVersion: current.contentVersion, ...(current.resultId ? { resultId: current.resultId } : {}) });
  const session = await api.createSession(deviceId, 'TEXT');
  await saveSession(session);
  void trackEvent('session_started', { sessionId: session.sessionId, contentVersion: session.contentVersion, locale: 'ko', viewMode: session.viewMode });
  return session;
}
