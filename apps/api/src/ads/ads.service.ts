import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AD_PROVIDER, type AdProvider } from '../providers/ad.provider.js';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../repositories/assessment.repository.js';

@Injectable()
export class AdsService {
  constructor(
    @Inject(AD_PROVIDER) private readonly provider: AdProvider,
    @Inject(ASSESSMENT_REPOSITORY) private readonly repository: AssessmentRepository,
  ) {}

  async complete(sessionId: string, slot: number, providerEventId: string) {
    const verified = await this.provider.verifyCompletion({ sessionId, slot, providerEventId });
    if (!verified) throw new ConflictException({ code: 'AD_NOT_VERIFIED', message: 'The fake provider could not verify this completion' });
    try {
      await this.repository.completeAd(sessionId, slot, providerEventId);
    } catch {
      throw new ConflictException({ code: 'AD_NOT_VERIFIED', message: 'The provider event was already used by another session' });
    }
    return { sessionId, unlockType: slot === 1 ? 'BASIC' : slot === 2 ? 'DEEP' : 'GUIDE', unlocked: true };
  }
}
