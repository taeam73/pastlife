import { describe, expect, it } from 'vitest';
import { resolveAdsRuntimeConfig } from '../src/config/ads.js';

describe('production ads configuration', () => {
  it('requires a real AdMob rewarded unit ID', () => {
    expect(() => resolveAdsRuntimeConfig({ NODE_ENV: 'production' })).toThrow('ADMOB_REWARDED_UNIT_ID');
    expect(() => resolveAdsRuntimeConfig({ NODE_ENV: 'production', ADMOB_REWARDED_UNIT_ID: 'test-slot-2' })).toThrow('ADMOB_REWARDED_UNIT_ID');
    expect(resolveAdsRuntimeConfig({ NODE_ENV: 'production', ADMOB_REWARDED_UNIT_ID: 'ca-app-pub-1234567890123456/9876543210' }).rewardedUnitId).toBe('ca-app-pub-1234567890123456/9876543210');
  });
});
