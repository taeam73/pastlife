import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { bonusTemplates, eras, guideTemplates, historicalLocations, occupations } from '@pastlife/content';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../repositories/assessment.repository.js';
import { IMAGE_PROVIDER, type ImageProvider } from '../providers/image.provider.js';

export const RESULT_DISCLAIMER = '이 결과는 종교적 또는 과학적 사실을 판정하거나 현재의 성격과 미래를 진단하지 않습니다. 선택을 바탕으로 구성된 창작 스토리텔링입니다.';

@Injectable()
export class ResultsService {
  private readonly imageJobs = new Map<string, Promise<Awaited<ReturnType<ImageProvider['getImage']>>>>();
  constructor(
    @Inject(ASSESSMENT_REPOSITORY) private readonly repository: AssessmentRepository,
    @Inject(IMAGE_PROVIDER) private readonly imageProvider: ImageProvider,
  ) {}

  async status(resultId: string) {
    const result = await this.requireResult(resultId);
    const session = await this.repository.getSession(result.sessionId);
    const image = await this.ensureImage(resultId);
    return { resultId, sessionId: result.sessionId, status: session?.status ?? 'FAILED', viewMode: session?.viewMode ?? 'VIDEO', imageStatus: image.status === 'FALLBACK' ? 'FALLBACK' : 'READY' };
  }

  async basic(resultId: string) {
    const result = await this.requireResult(resultId);
    const session = await this.repository.getSession(result.sessionId);
    if (!session?.unlocks.includes('BASIC')) throw new ForbiddenException({ code: 'UNLOCK_REQUIRED', message: 'AD 1 completion is required', slot: 1 });
    const era = eras.find(({ id }) => id === result.core.eraId)!;
    const location = historicalLocations.find(({ id }) => id === result.core.locationId)!;
    const occupation = occupations.find(({ id }) => id === result.core.occupationId)!;
    return {
      resultId,
      recordNo: result.core.recordNo,
      headline: `${era.label} ${location.label}의 ${occupation.label}`,
      image: await this.ensureImage(resultId),
      blocks: result.blocks,
      disclaimer: RESULT_DISCLAIMER,
    };
  }

  async deep(resultId: string) {
    return this.extended(resultId, 'DEEP', bonusTemplates, 2);
  }

  async guide(resultId: string) {
    return this.extended(resultId, 'GUIDE', guideTemplates, 3);
  }

  async share(resultId: string) {
    await this.requireResult(resultId);
    const shareToken = createHash('sha256').update(`pastlife-share:${resultId}`).digest('hex').slice(0, 24);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const baseUrl = process.env.PUBLIC_WEB_URL ?? 'http://localhost:8081';
    return { resultId, shareToken, shareUrl: `${baseUrl.replace(/\/$/, '')}/share/${shareToken}`, expiresAt };
  }

  async createShareAsset(resultId: string, type: 'VIDEO' | 'IMAGE', locale: string) {
    const result = await this.requireResult(resultId);
    const image = await this.ensureImage(resultId);
    const shareId = createHash('sha256').update(`pastlife-share:${resultId}:${type}:${locale}`).digest('hex').slice(0, 24);
    const publicBaseUrl = (process.env.PUBLIC_SHARE_URL ?? process.env.PUBLIC_WEB_URL ?? 'https://past-life.example').replace(/\/$/, '');
    const deepLink = `${publicBaseUrl}/s/${shareId}?source=share&format=${type.toLowerCase()}`;
    const storeFallbackUrl = process.env.GOOGLE_PLAY_URL ?? 'https://play.google.com/store/apps/details?id=com.pastlife.archive';
    const extension = type === 'VIDEO' ? 'mp4' : 'png';
    return {
      resultId: result.id,
      shareId,
      type,
      status: 'TEMPLATE_READY' as const,
      uri: `template://share/${shareId}.${extension}`,
      sourceImageUri: image.uri,
      deepLink,
      storeFallbackUrl,
    };
  }

  private async ensureImage(resultId: string) {
    const result = await this.requireResult(resultId);
    if (result.image) return result.image;
    const existingJob = this.imageJobs.get(resultId);
    if (existingJob) return existingJob;
    const job = this.imageProvider.getImage(result.core)
      .then((image) => this.repository.saveResultImage(resultId, image))
      .finally(() => this.imageJobs.delete(resultId));
    this.imageJobs.set(resultId, job);
    return job;
  }

  private async extended<T extends readonly { id: string; title: string; body: string }[]>(
    resultId: string,
    unlockType: 'DEEP' | 'GUIDE',
    templates: T,
    slot: number,
  ) {
    const result = await this.requireResult(resultId);
    const session = await this.repository.getSession(result.sessionId);
    if (!session?.unlocks.includes(unlockType)) throw new ForbiddenException({ code: 'UNLOCK_REQUIRED', message: `AD ${slot} completion is required`, slot });
    return {
      resultId,
      image: await this.ensureImage(resultId),
      blocks: templates.map(({ id, title, body }) => ({ id, title, body })),
      disclaimer: RESULT_DISCLAIMER,
    };
  }

  private async requireResult(id: string) {
    const result = await this.repository.getResult(id);
    if (!result) throw new NotFoundException({ code: 'VALIDATION_ERROR', message: 'Result not found' });
    return result;
  }
}
