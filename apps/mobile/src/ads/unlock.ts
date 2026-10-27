import { Platform } from 'react-native';
import { api } from '../api/client';
import { showRewardedAd, usingDemoAds } from './admob';

export async function unlockWithRewardedAd(sessionId: string, slot: 2 | 3): Promise<void> {
  if (Platform.OS === 'web') {
    await api.fakeAd(sessionId, slot);
    return;
  }
  if ((await api.adStatus(sessionId, slot)).unlocked) return;
  const challenge = await api.adChallenge(sessionId, slot);
  await showRewardedAd(challenge.customData);
  if (usingDemoAds()) {
    await api.fakeAd(sessionId, slot);
    return;
  }
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const state = await api.adStatus(sessionId, slot);
    if (state.unlocked) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  }
  throw new Error('AdMob reward confirmation timed out');
}
