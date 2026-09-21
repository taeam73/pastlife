import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { eras, historicalLocations, occupations } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../repositories/assessment.repository.js';
import { IMAGE_PROVIDER, type ImageProvider } from '../providers/image.provider.js';
import { IMAGE_STORAGE, type ImageStorage } from '../providers/storage.provider.js';
import { LibraryImageProvider } from '../providers/library-image.provider.js';
import { buildStoryNarrative, buildStoryProfile } from '../providers/story-narrative.js';
import { buildDeepNarrative, buildPresentGuideNarrative } from '../providers/extended-narratives.js';

export const RESULT_DISCLAIMER = '이 이야기는 선택한 답을 바탕으로 만든 창작 콘텐츠입니다. 실제 전생이나 현재의 성격, 미래를 판단하는 결과가 아닙니다.';

@Injectable()
export class ResultsService {
  private readonly imageJobs = new Map<string, Promise<Awaited<ReturnType<ImageProvider['getImage']>>>>();
  constructor(
    @Inject(ASSESSMENT_REPOSITORY) private readonly repository: AssessmentRepository,
    @Inject(IMAGE_PROVIDER) private readonly imageProvider: ImageProvider,
    @Inject(IMAGE_STORAGE) private readonly imageStorage: ImageStorage,
    @Inject(LibraryImageProvider) private readonly libraryImages: LibraryImageProvider,
  ) {}

  async status(resultId: string) {
    const result = await this.requireResult(resultId);
    const session = await this.repository.getSession(result.sessionId);
    const image = await this.ensureImage(resultId);
    return { resultId, sessionId: result.sessionId, status: session?.status ?? 'FAILED', viewMode: session?.viewMode ?? 'TEXT', imageStatus: image.status === 'FALLBACK' ? 'FALLBACK' : 'READY' };
  }

  async basic(resultId: string) {
    const result = await this.requireResult(resultId);
    const session = await this.repository.getSession(result.sessionId);
    if (!session?.unlocks.includes('BASIC')) throw new ForbiddenException({ code: 'UNLOCK_REQUIRED', message: 'AD 1 completion is required', slot: 1 });
    const era = eras.find(({ id }) => id === result.core.eraId)!;
    const location = historicalLocations.find(({ id }) => id === result.core.locationId)!;
    const occupationAliases: Record<string, string> = { OCC_01: 'OCC_SCRIBE', OCC_02: 'OCC_TEACHER', OCC_03: 'OCC_CEREMONIAL', OCC_04: 'OCC_NAVIGATOR', OCC_05: 'OCC_NAVIGATOR', OCC_06: 'OCC_ARTISAN', OCC_07: 'OCC_HEALER', OCC_08: 'OCC_MESSENGER' };
    const occupation = occupations.find(({ id }) => id === (occupationAliases[result.core.occupationId] ?? result.core.occupationId))!;
    const storyProfile = result.storyProfile ?? buildStoryProfile(result.core);
    const blocksNeedRefresh = result.blocks.length !== 6 || result.blocks.some(({ body }) =>
      !body.includes('\n\n') || /사용자의 실제 정체성|창작 서사|창작 설정|서사용 이름|마지막 장의 제목|선택을 바탕으로/.test(body));
    const blocks = blocksNeedRefresh ? buildStoryNarrative(result.core) : result.blocks;
    return {
      resultId,
      recordNo: result.core.recordNo,
      headline: `${era.label} ${location.label}의 ${occupation.label}`,
      character: {
        name: storyProfile.identity.name,
        gender: storyProfile.identity.gender,
        fictional: storyProfile.identity.fictional,
        appearance: storyProfile.identity.appearance,
        temperament: storyProfile.identity.temperament,
        complex: storyProfile.identity.complex,
        socialMask: storyProfile.identity.socialMask,
        stressResponse: storyProfile.identity.stressResponse,
        familyStructure: storyProfile.background.familyStructure,
        primaryCaregiver: storyProfile.background.primaryCaregiver,
        occupation: occupation.label,
        hobby: storyProfile.dailyLife.hobby,
        dream: storyProfile.dailyLife.dream,
        talent: storyProfile.dailyLife.talent,
        weakness: storyProfile.dailyLife.weakness,
        favoritePlace: storyProfile.dailyLife.favoritePlace,
        belief: storyProfile.dailyLife.belief,
        formativeWound: storyProfile.innerLife.formativeWound,
        centralContradiction: storyProfile.characterArc.centralContradiction,
        realization: storyProfile.characterArc.realization,
      },
      lifeSummary: { ageAtDeath: storyProfile.ageAtDeath, lifespanLabel: storyProfile.lifespanLabel, endingTitle: storyProfile.ending.title },
      highlights: storyProfile.highlights,
      image: await this.presentImage(await this.ensureImage(resultId), result.core),
      blocks,
      disclaimer: RESULT_DISCLAIMER,
    };
  }

  async deep(resultId: string) {
    return this.extended(resultId, 'DEEP', 2);
  }

  async guide(resultId: string) {
    return this.extended(resultId, 'GUIDE', 3);
  }

  async share(resultId: string) {
    await this.requireResult(resultId);
    const shareToken = createHash('sha256').update(`pastlife-share:${resultId}`).digest('hex').slice(0, 24);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const baseUrl = process.env.PUBLIC_WEB_URL ?? 'http://localhost:8081';
    return { resultId, shareToken, shareUrl: `${baseUrl.replace(/\/$/, '')}/share/${shareToken}`, expiresAt };
  }

  async createShareAsset(resultId: string, type: 'VIDEO' | 'IMAGE', locale: string) {
    if (type === 'VIDEO') {
      throw new BadRequestException({ code: 'FEATURE_UNAVAILABLE', message: '영상 보기는 첫 출시 이후 제공됩니다.' });
    }
    const result = await this.requireResult(resultId);
    const image = await this.presentImage(await this.ensureImage(resultId), result.core);
    const shareId = createHash('sha256').update(`pastlife-share:${resultId}:${type}:${locale}`).digest('hex').slice(0, 24);
    const publicBaseUrl = (process.env.PUBLIC_SHARE_URL ?? process.env.PUBLIC_WEB_URL ?? 'https://past-life.example').replace(/\/$/, '');
    const deepLink = `${publicBaseUrl}/s/${shareId}?source=share&format=${type.toLowerCase()}`;
    const storeFallbackUrl = process.env.GOOGLE_PLAY_URL ?? 'https://play.google.com/store/apps/details?id=com.pastlife.archive';
    return {
      resultId: result.id,
      shareId,
      type,
      status: 'TEMPLATE_READY' as const,
      uri: `template://share/${shareId}.png`,
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

  private async presentImage(image: Awaited<ReturnType<ImageProvider['getImage']>>, core: ResultCore) {
    if (!image.uri.startsWith('s3://')) return image;
    try {
      return { ...image, uri: await this.imageStorage.getDownloadUrl(image.uri) };
    } catch {
      return this.libraryImages.getImage(core);
    }
  }

  private async extended(
    resultId: string,
    unlockType: 'DEEP' | 'GUIDE',
    slot: number,
  ) {
    const result = await this.requireResult(resultId);
    const session = await this.repository.getSession(result.sessionId);
    if (!session?.unlocks.includes(unlockType)) throw new ForbiddenException({ code: 'UNLOCK_REQUIRED', message: `AD ${slot} completion is required`, slot });
    const storyProfile = result.storyProfile ?? buildStoryProfile(result.core);
    const blocks = unlockType === 'DEEP'
      ? buildDeepNarrative(result.core, storyProfile)
      : buildPresentGuideNarrative(result.core, storyProfile);
    return {
      resultId,
      image: await this.presentImage(await this.ensureImage(resultId), result.core),
      blocks,
      disclaimer: RESULT_DISCLAIMER,
    };
  }

  private async requireResult(id: string) {
    const result = await this.repository.getResult(id);
    if (!result) throw new NotFoundException({ code: 'VALIDATION_ERROR', message: 'Result not found' });
    return result;
  }
}
