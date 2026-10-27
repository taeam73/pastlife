export function resolveAdsRuntimeConfig(env: NodeJS.ProcessEnv = process.env) {
  const rewardedUnitId = env.ADMOB_REWARDED_UNIT_ID ?? '';
  if (env.NODE_ENV === 'production' && !/^ca-app-pub-\d{16}\/\d+$/u.test(rewardedUnitId)) {
    throw new Error('ADMOB_REWARDED_UNIT_ID must be configured for production');
  }
  return { rewardedUnitId };
}
