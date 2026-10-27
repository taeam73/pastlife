import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  InterstitialAd,
  MaxAdContentRating,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

let initialization: Promise<void> | undefined;
const useDemoUnits = __DEV__ || process.env.EXPO_PUBLIC_ADMOB_TEST_ADS === 'true';

async function initializeAds() {
  initialization ??= (async () => {
    const consent = await AdsConsent.gatherConsent();
    if (!consent.canRequestAds) throw new Error('Ads are unavailable without consent');
    await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.T });
    await mobileAds().initialize();
  })().catch((error: unknown) => { initialization = undefined; throw error; });
  await initialization;
}

function unitId(kind: 'interstitial' | 'rewarded') {
  if (useDemoUnits) return kind === 'interstitial' ? TestIds.INTERSTITIAL : TestIds.REWARDED;
  const value = kind === 'interstitial'
    ? process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID
    : process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID;
  if (!value) throw new Error(`Missing ${kind} AdMob unit ID`);
  return value;
}

export async function showTransitionAd(): Promise<void> {
  await initializeAds();
  const ad = InterstitialAd.createForAdRequest(unitId('interstitial'), { requestNonPersonalizedAdsOnly: true });
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const subscriptions: Array<() => void> = [];
    const timeout = setTimeout(() => finish(new Error('Interstitial load timed out')), 25_000);
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      subscriptions.forEach((unsubscribe) => unsubscribe());
      ad.destroy();
      if (error) reject(error); else resolve();
    };
    subscriptions.push(ad.addAdEventListener(AdEventType.LOADED, () => { void ad.show().catch((error: unknown) => finish(error instanceof Error ? error : new Error('Ad show failed'))); }));
    subscriptions.push(ad.addAdEventListener(AdEventType.CLOSED, () => finish()));
    subscriptions.push(ad.addAdEventListener(AdEventType.ERROR, () => finish(new Error('Ad failed to load'))));
    ad.load();
  });
}

export async function showRewardedAd(customData: string): Promise<void> {
  await initializeAds();
  const ad = RewardedAd.createForAdRequest(unitId('rewarded'), {
    requestNonPersonalizedAdsOnly: true,
    serverSideVerificationOptions: { customData },
  });
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let earned = false;
    const subscriptions: Array<() => void> = [];
    const timeout = setTimeout(() => finish(new Error('Rewarded ad timed out')), 40_000);
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      subscriptions.forEach((unsubscribe) => unsubscribe());
      ad.destroy();
      if (error) reject(error); else resolve();
    };
    subscriptions.push(ad.addAdEventListener(RewardedAdEventType.LOADED, () => { void ad.show().catch((error: unknown) => finish(error instanceof Error ? error : new Error('Ad show failed'))); }));
    subscriptions.push(ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; }));
    subscriptions.push(ad.addAdEventListener(AdEventType.CLOSED, () => finish(earned ? undefined : new Error('Reward not earned'))));
    subscriptions.push(ad.addAdEventListener(AdEventType.ERROR, () => finish(new Error('Rewarded ad failed'))));
    ad.load();
  });
}

export function usingDemoAds() { return useDemoUnits; }

export async function adPrivacyOptionsRequired(): Promise<boolean> {
  const info = await AdsConsent.requestInfoUpdate();
  return info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
}

export async function showAdPrivacyOptions(): Promise<void> {
  await AdsConsent.showPrivacyOptionsForm();
  initialization = undefined;
}
