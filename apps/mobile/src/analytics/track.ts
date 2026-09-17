import type { AnalyticsEventName, AnalyticsMetadata } from '@pastlife/contracts';
import { Platform } from 'react-native';
import { api } from '../api/client';

function platform(): AnalyticsMetadata['platform'] {
  if (Platform.OS === 'android' || Platform.OS === 'ios' || Platform.OS === 'web') return Platform.OS;
  return 'unknown';
}

export async function trackEvent(name: AnalyticsEventName, metadata: AnalyticsMetadata = {}) {
  try {
    await api.analytics(name, { ...metadata, platform: platform() });
  } catch {
    // Analytics is best-effort and must never block the assessment or result flow.
  }
}
