import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { AD_PROVIDER, type AdProvider } from '../providers/ad.provider.js';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../repositories/assessment.repository.js';
import { createAdChallenge, verifyAdMobCallback, type AdMobKey } from './admob-ssv.js';
import { resolveAdsRuntimeConfig } from '../config/ads.js';

@Injectable()
export class AdsService {
  private keys: AdMobKey[] = [];
  private keysLoadedAt = 0;
  constructor(
    @Inject(AD_PROVIDER) private readonly provider: AdProvider,
    @Inject(ASSESSMENT_REPOSITORY) private readonly repository: AssessmentRepository,
  ) {}

  async complete(sessionId: string, slot: number, providerEventId: string) {
    if (process.env.NODE_ENV === 'production') throw new ForbiddenException({ code: 'AD_NOT_VERIFIED', message: 'Client ad completion is disabled' });
    const verified = await this.provider.verifyCompletion({ sessionId, slot, providerEventId });
    if (!verified) throw new ConflictException({ code: 'AD_NOT_VERIFIED', message: 'The fake provider could not verify this completion' });
    try {
      await this.repository.completeAd(sessionId, slot, providerEventId);
    } catch {
      throw new ConflictException({ code: 'AD_NOT_VERIFIED', message: 'The provider event was already used by another session' });
    }
    return { sessionId, unlockType: slot === 1 ? 'BASIC' : slot === 2 ? 'DEEP' : 'GUIDE', unlocked: true };
  }

  async challenge(sessionId: string, slot: number) {
    if (slot !== 2 && slot !== 3) throw new ForbiddenException({ code: 'INVALID_AD_SLOT', message: 'Rewarded ad slot required' });
    if (process.env.NODE_ENV === 'production' && slot === 3) throw new NotFoundException({ code: 'FEATURE_UNAVAILABLE', message: 'Ad slot not found' });
    const session = await this.repository.getSession(sessionId);
    if (!session) throw new NotFoundException({ code: 'SESSION_NOT_FOUND', message: 'Session not found' });
    const secret = process.env.JWT_SECRET ?? 'dev-secret';
    return { customData: createAdChallenge(sessionId, slot, secret) };
  }

  async status(sessionId: string, slot: number) {
    if (slot < 1 || slot > 3 || !Number.isInteger(slot)) throw new ForbiddenException({ code: 'INVALID_AD_SLOT', message: 'Invalid ad slot' });
    const session = await this.repository.getSession(sessionId);
    if (!session) throw new NotFoundException({ code: 'SESSION_NOT_FOUND', message: 'Session not found' });
    const unlockType = slot === 1 ? 'BASIC' : slot === 2 ? 'DEEP' : 'GUIDE';
    return { sessionId, slot, unlocked: session.unlocks.includes(unlockType) };
  }

  async admobCallback(rawQuery: string) {
    const adUnit = resolveAdsRuntimeConfig().rewardedUnitId;
    if (!adUnit) throw new ServiceUnavailableException({ code: 'AD_NOT_CONFIGURED', message: 'AdMob rewarded unit is not configured' });
    const keyId = new URLSearchParams(rawQuery).get('key_id');
    const keys = await this.publicKeys(keyId);
    let event: ReturnType<typeof verifyAdMobCallback>;
    try {
      event = verifyAdMobCallback({ rawQuery, keys, secret: process.env.JWT_SECRET ?? 'dev-secret', expectedAdUnitId: adUnit });
    } catch {
      throw new ForbiddenException({ code: 'AD_NOT_VERIFIED', message: 'Invalid AdMob callback' });
    }
    try {
      await this.repository.completeAd(event.sessionId, event.slot, `admob:${event.transactionId}`);
    } catch {
      throw new ConflictException({ code: 'AD_NOT_VERIFIED', message: 'AdMob transaction could not be applied' });
    }
    return { verified: true };
  }

  private async publicKeys(keyId: string | null): Promise<AdMobKey[]> {
    if (Date.now() - this.keysLoadedAt < 60 * 60_000 && this.keys.some((key) => String(key.keyId) === keyId)) return this.keys;
    try {
      const response = await fetch('https://www.gstatic.com/admob/reward/verifier-keys.json', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('AdMob key server unavailable');
      const payload: unknown = await response.json();
      const candidates = (payload as { keys?: unknown })?.keys;
      if (!Array.isArray(candidates)) throw new Error('Invalid AdMob keys');
      const keys = candidates.filter((key): key is AdMobKey =>
        key && typeof key === 'object' && Number.isInteger((key as AdMobKey).keyId) && typeof (key as AdMobKey).pem === 'string');
      if (keys.length === 0) throw new Error('No AdMob keys');
      this.keys = keys;
      this.keysLoadedAt = Date.now();
      return keys;
    } catch {
      if (this.keys.some((key) => String(key.keyId) === keyId)) return this.keys;
      throw new ServiceUnavailableException({ code: 'AD_VERIFICATION_UNAVAILABLE', message: 'Ad verification is temporarily unavailable' });
    }
  }
}
