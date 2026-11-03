export type AdMobBuildConfig = {
  profile?: string;
  appId?: string;
  interstitialId?: string;
  rewardedId?: string;
  testDeviceIds?: string;
  testAds?: boolean;
};

const demoAppId = 'ca-app-pub-3940256099942544~3347511713';

export function parseTestDeviceIds(value?: string): string[] {
  const identifiers = (value ?? '').split(',').map((entry) => entry.trim()).filter(Boolean);
  for (const identifier of identifiers) {
    if (/\s/u.test(identifier)) throw new Error('AdMob test device identifiers cannot contain whitespace');
  }
  return [...new Set(identifiers)];
}

export function assertAdMobBuildConfig(input: AdMobBuildConfig): void {
  if (input.profile !== 'production' && input.profile !== 'production-candidate') return;
  if (!input.appId || input.appId === demoAppId || !input.interstitialId || !input.rewardedId || input.testAds) {
    throw new Error(`${input.profile} Android build requires live AdMob app and unit IDs`);
  }
  if (input.profile === 'production-candidate' && parseTestDeviceIds(input.testDeviceIds).length === 0) {
    throw new Error('Production-candidate Android build requires at least one registered AdMob test device');
  }
}
