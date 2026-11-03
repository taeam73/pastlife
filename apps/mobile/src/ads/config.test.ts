import { describe, expect, it } from 'vitest';

import { assertAdMobBuildConfig, parseTestDeviceIds } from './config';

describe('AdMob configuration', () => {
  it('trims and de-duplicates test device identifiers', () => {
    expect(parseTestDeviceIds('ABC, DEF,ABC')).toEqual(['ABC', 'DEF']);
  });

  it('returns no identifiers for an empty value', () => {
    expect(parseTestDeviceIds('')).toEqual([]);
  });

  it('rejects identifiers containing whitespace', () => {
    expect(() => parseTestDeviceIds('ABC DEF')).toThrow(/whitespace/u);
  });

  it('requires a registered test device for production-candidate builds', () => {
    expect(() => assertAdMobBuildConfig({
      profile: 'production-candidate',
      appId: 'ca-app-pub-4438190626695994~5289298698',
      interstitialId: 'ca-app-pub-4438190626695994/3054017591',
      rewardedId: 'ca-app-pub-4438190626695994/3884717688',
      testDeviceIds: '',
      testAds: false,
    })).toThrow(/test device/u);
  });
});
