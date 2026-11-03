import { createPrivateKey, generateKeyPairSync, sign } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createAdChallenge, isAdMobVerificationProbe, verifyAdMobCallback, verifyAdMobSignature } from '../src/ads/admob-ssv.js';

const now = Date.parse('2026-10-27T08:00:00Z');
const secret = 'an-isolated-ssv-test-secret-with-more-than-32-characters';
const adUnitId = 'ca-app-pub-1234567890123456/9876543210';
const pair = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const keys = [{ keyId: 1234, pem: pair.publicKey.export({ type: 'spki', format: 'pem' }).toString() }];
const privateKey = createPrivateKey(pair.privateKey.export({ type: 'pkcs8', format: 'pem' }));

function callback(overrides: Record<string, string> = {}) {
  const params = new URLSearchParams({
    ad_network: '5450213213286189855',
    ad_unit: '9876543210',
    custom_data: createAdChallenge('session-a', 2, secret, now),
    reward_amount: '1',
    reward_item: '마지막 순간',
    timestamp: String(now),
    transaction_id: 'abcdef0123456789abcdef0123456789',
    ...overrides,
  });
  const signedPart = params.toString();
  const signature = sign('sha256', Buffer.from(decodeURIComponent(signedPart.replace(/\+/gu, ' '))), privateKey).toString('base64url');
  return `${signedPart}&signature=${signature}&key_id=1234`;
}

function verificationProbe(overrides: Record<string, string> = {}) {
  return callback({
    ad_unit: '1234567890',
    transaction_id: '123456789',
    ...overrides,
  });
}

describe('AdMob rewarded SSV', () => {
  it('accepts a signed, current reward bound to a session and slot', () => {
    expect(verifyAdMobCallback({ rawQuery: callback(), keys, secret, expectedAdUnitId: adUnitId, now })).toEqual({
      sessionId: 'session-a', slot: 2, transactionId: 'abcdef0123456789abcdef0123456789',
    });
  });

  it('rejects tampered callback bytes and an unexpected ad unit', () => {
    expect(() => verifyAdMobCallback({ rawQuery: callback().replace('reward_amount=1', 'reward_amount=9'), keys, secret, expectedAdUnitId: adUnitId, now })).toThrow();
    expect(() => verifyAdMobCallback({ rawQuery: callback({ ad_unit: 'other' }), keys, secret, expectedAdUnitId: adUnitId, now })).toThrow('Unexpected ad unit');
  });

  it('rejects expired challenges and stale callbacks', () => {
    expect(() => verifyAdMobCallback({ rawQuery: callback(), keys, secret, expectedAdUnitId: adUnitId, now: now + 31 * 60_000 })).toThrow('Expired or invalid ad challenge');
    expect(() => verifyAdMobCallback({ rawQuery: callback({ timestamp: String(now - 25 * 60 * 60_000) }), keys, secret, expectedAdUnitId: adUnitId, now })).toThrow('Stale callback');
  });

  it('rejects a forged challenge even when the callback has a valid AdMob signature', () => {
    const forged = createAdChallenge('session-b', 2, 'wrong-secret', now);
    expect(() => verifyAdMobCallback({ rawQuery: callback({ custom_data: forged }), keys, secret, expectedAdUnitId: adUnitId, now })).toThrow('Invalid ad challenge');
  });

  it('accepts only the signed AdMob console verification probe without granting a reward', () => {
    const params = verifyAdMobSignature({ rawQuery: verificationProbe(), keys });
    expect(isAdMobVerificationProbe(params)).toBe(true);
    expect(isAdMobVerificationProbe(verifyAdMobSignature({ rawQuery: verificationProbe({ transaction_id: 'other' }), keys }))).toBe(false);
    expect(() => verifyAdMobSignature({ rawQuery: verificationProbe().replace('reward_amount=1', 'reward_amount=9'), keys })).toThrow();
  });
});
