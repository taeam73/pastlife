import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('production-candidate build is fail-closed and maps approved variables', async () => {
  const source = await readFile(new URL('./build-android-admob-candidate-local.ps1', import.meta.url), 'utf8');
  for (const name of [
    'PASTLIFE_PROD_API_URL',
    'PASTLIFE_PROD_ADMOB_APP_ID',
    'PASTLIFE_PROD_ADMOB_INTERSTITIAL_UNIT_ID',
    'PASTLIFE_PROD_ADMOB_REWARDED_UNIT_ID',
    'PASTLIFE_ADMOB_TEST_DEVICE_IDS',
  ]) assert.match(source, new RegExp(name, 'u'));
  assert.match(source, /EAS_BUILD_PROFILE\s*=\s*'production-candidate'/u);
  assert.match(source, /EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS/u);
  assert.match(source, /Google demo AdMob IDs are not allowed/u);
  assert.doesNotMatch(source, /EXPO_PUBLIC_ADMOB_TEST_ADS\s*=\s*'true'/u);
  assert.match(source, /assembleRelease/u);
  assert.match(source, /apksigner verify/u);
});
