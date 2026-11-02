import type { ContentLocale } from '@pastlife/content/locales';
import { api } from '../api/client';
import { loadSession, saveSession } from './store';

export async function syncCurrentSessionLocale(locale: ContentLocale): Promise<void> {
  const session = await loadSession();
  if (!session || session.resultId || session.locale === locale) return;

  await api.setSessionLocale(session.sessionId, locale);
  await saveSession({ ...session, locale });
}
