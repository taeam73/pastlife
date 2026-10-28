import { api } from '../api/client';
import { getOrCreateDeviceId, loadSession, saveSession } from './store';
import { trackEvent } from '../analytics/track';
import { loadLocale } from '../i18n/locale';

export async function startNewSession(source: 'main' | 'restart' = 'main') {
  const deviceId = await getOrCreateDeviceId();
  const current = await loadSession();
  if (source === 'restart' && current) void trackEvent('new_past_life_clicked', { sessionId: current.sessionId, contentVersion: current.contentVersion, ...(current.resultId ? { resultId: current.resultId } : {}) });
  const locale = await loadLocale();
  const session = await api.createSession(deviceId, 'TEXT', locale);
  await saveSession({ ...session, locale });
  void import('../results/storyArtworkCache').then(({ clearStoryArtworkFiles }) => clearStoryArtworkFiles()).catch(() => undefined);
  void trackEvent('session_started', { sessionId: session.sessionId, contentVersion: session.contentVersion, locale, viewMode: session.viewMode });
  return session;
}
