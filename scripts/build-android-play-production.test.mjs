import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('production Play build is isolated from development and test-ad settings', async () => {
  const engine = await readFile(new URL('./build-android-play-internal-local.ps1', import.meta.url), 'utf8');
  const entrypoint = await readFile(new URL('./build-android-play-production-local.ps1', import.meta.url), 'utf8');
  assert.match(entrypoint, /BuildTarget production/u);
  for (const name of [
    'PASTLIFE_PROD_API_URL',
    'PASTLIFE_PROD_ADMOB_APP_ID',
    'PASTLIFE_PROD_ADMOB_INTERSTITIAL_UNIT_ID',
    'PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID',
  ]) assert.match(engine, new RegExp(name, 'u'));
  assert.match(engine, /EAS_BUILD_PROFILE\s*=\s*'production'/u);
  assert.match(engine, /pastlife-assets\.pages\.dev/u);
  assert.match(engine, /Google demo AdMob IDs are not allowed in a production build/u);
  assert.match(engine, /Remove-Item Env:EXPO_PUBLIC_ADMOB_TEST_ADS,Env:EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS/u);
  assert.match(engine, /expo prebuild --platform android --no-install/u);
  assert.match(engine, /bundleRelease/u);
  assert.match(engine, /jarsigner\.exe/u);
});
