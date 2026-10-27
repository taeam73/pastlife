import { createHmac, timingSafeEqual, verify } from 'node:crypto';

type Challenge = { sessionId: string; slot: 2 | 3; expiresAt: number };
export type AdMobKey = { keyId: number; pem: string };

export function createAdChallenge(sessionId: string, slot: 2 | 3, secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ sessionId, slot, expiresAt: now + 30 * 60_000 } satisfies Challenge)).toString('base64url');
  const mac = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

function readChallenge(value: string, secret: string, now: number): Challenge {
  const [payload, mac, extra] = value.split('.');
  if (!payload || !mac || extra) throw new Error('Malformed ad challenge');
  const expected = createHmac('sha256', secret).update(payload).digest();
  const received = Buffer.from(mac, 'base64url');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new Error('Invalid ad challenge');
  const parsed: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid ad challenge');
  const challenge = parsed as Partial<Challenge>;
  if (typeof challenge.sessionId !== 'string' || !challenge.sessionId || (challenge.slot !== 2 && challenge.slot !== 3) ||
      typeof challenge.expiresAt !== 'number' || challenge.expiresAt < now || challenge.expiresAt > now + 30 * 60_000) {
    throw new Error('Expired or invalid ad challenge');
  }
  return challenge as Challenge;
}

export function verifyAdMobCallback(input: {
  rawQuery: string;
  keys: readonly AdMobKey[];
  secret: string;
  expectedAdUnitId: string;
  now?: number;
}): { sessionId: string; slot: 2 | 3; transactionId: string } {
  const { rawQuery, keys, secret, expectedAdUnitId } = input;
  const now = input.now ?? Date.now();
  if (!rawQuery || rawQuery.length > 4096) throw new Error('Invalid callback length');
  const signatureMarker = '&signature=';
  const keyMarker = '&key_id=';
  const signatureAt = rawQuery.lastIndexOf(signatureMarker);
  const keyAt = rawQuery.lastIndexOf(keyMarker);
  if (signatureAt < 0 || keyAt < signatureAt || rawQuery.indexOf(signatureMarker) !== signatureAt || rawQuery.indexOf(keyMarker) !== keyAt) {
    throw new Error('Malformed callback signature');
  }
  const signedPart = rawQuery.slice(0, signatureAt);
  const signatureText = rawQuery.slice(signatureAt + signatureMarker.length, keyAt);
  const keyIdText = rawQuery.slice(keyAt + keyMarker.length);
  if (!/^[A-Za-z0-9_-]+$/u.test(signatureText) || !/^\d+$/u.test(keyIdText)) throw new Error('Invalid callback signature fields');
  const key = keys.find((candidate) => candidate.keyId === Number(keyIdText));
  if (!key || !verify('sha256', Buffer.from(signedPart, 'utf8'), key.pem, Buffer.from(signatureText, 'base64url'))) {
    throw new Error('Unverified AdMob callback');
  }
  const params = new URLSearchParams(signedPart);
  for (const field of ['ad_unit', 'custom_data', 'timestamp', 'transaction_id']) {
    if (params.getAll(field).length !== 1) throw new Error(`Invalid callback ${field}`);
  }
  const adUnit = params.get('ad_unit')!;
  const expectedUnit = expectedAdUnitId.split('/').at(-1)!;
  if (adUnit !== expectedAdUnitId && adUnit !== expectedUnit) throw new Error('Unexpected ad unit');
  const timestamp = Number(params.get('timestamp'));
  if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > 24 * 60 * 60_000) throw new Error('Stale callback');
  const transactionId = params.get('transaction_id')!;
  if (!/^[a-fA-F0-9]{16,128}$/u.test(transactionId)) throw new Error('Invalid transaction ID');
  const challenge = readChallenge(params.get('custom_data')!, secret, now);
  return { sessionId: challenge.sessionId, slot: challenge.slot, transactionId };
}
