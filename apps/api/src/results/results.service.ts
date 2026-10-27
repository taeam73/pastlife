import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { eras, findEnglishStoryTranslation, findJapaneseStoryTranslation, findThaiStoryTranslation, findStoryFinalMoment, historicalLocations, isEnglishStoryReady, isJapaneseStoryReady, isThaiStoryReady, occupations, parseContentLocale } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../repositories/assessment.repository.js';
import { IMAGE_PROVIDER, type ImageProvider } from '../providers/image.provider.js';
import { IMAGE_STORAGE, type ImageStorage } from '../providers/storage.provider.js';
import { LibraryImageProvider } from '../providers/library-image.provider.js';
import { buildStoryNarrative, buildStoryProfile } from '../providers/story-narrative.js';
import { buildDeepNarrative, buildPresentGuideNarrative } from '../providers/extended-narratives.js';
import { buildCharacterIntroduction, describeOccupation } from '../providers/occupation-narrative.js';
import { inspectNarrative } from '../providers/narrative-quality.js';
import { inspectResultCanon } from '../providers/narrative-canon.js';
import { inspectImageCompatibility } from '../providers/image-compatibility.js';
import { buildResultPresentation } from './build-result-presentation.js';
import { FinalMomentReadResponseSchema, ResultPresentationSchema, StoryFinalMomentResponseSchema } from '@pastlife/contracts';
import { buildContentStoryExtended, buildContentStoryResult } from './story-result.js';
import { RELEASE_CONTENT_VERSION } from '../config/content.js';

export const RESULT_DISCLAIMER = '';

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);
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
    if (!session || (!session.contentVersion?.startsWith('3.') && !session.unlocks.includes('BASIC'))) {
      throw new ForbiddenException({ code: 'UNLOCK_REQUIRED', message: 'AD 1 completion is required', slot: 1 });
    }
    if (process.env.NODE_ENV === 'production' && !result.core.storyId) {
      throw new NotFoundException({ code: 'RESULT_NOT_FOUND', message: 'Result not found' });
    }
    if (result.core.storyId) {
      const image = await this.presentImage(await this.ensureImage(resultId), result.core);
      const locale = parseContentLocale(session.locale);
      if (!locale) throw new NotFoundException({ code: 'UNSUPPORTED_LOCALE', message: 'Unsupported session locale' });
      try { return buildContentStoryResult(resultId, result.core, image, Boolean(result.finalMomentReadAt), locale); }
      catch (error) {
        if ((session.locale === 'en' || session.locale === 'th' || session.locale === 'ja') && error instanceof Error && error.message.startsWith(`${{ en: 'English', th: 'Thai', ja: 'Japanese' }[session.locale]} preview unavailable`)) {
          throw new NotFoundException({ code: 'TRANSLATION_NOT_READY', message: 'Translation for this story is not ready' });
        }
        throw error;
      }
    }
    const era = eras.find(({ id }) => id === result.core.eraId)!;
    const location = historicalLocations.find(({ id }) => id === result.core.locationId)!;
    const occupationAliases: Record<string, string> = { OCC_01: 'OCC_SCRIBE', OCC_02: 'OCC_TEACHER', OCC_03: 'OCC_CEREMONIAL', OCC_04: 'OCC_NAVIGATOR', OCC_05: 'OCC_NAVIGATOR', OCC_06: 'OCC_ARTISAN', OCC_07: 'OCC_HEALER', OCC_08: 'OCC_MESSENGER' };
    const occupation = occupations.find(({ id }) => id === (occupationAliases[result.core.occupationId] ?? result.core.occupationId))!;
    const storyProfile = result.storyProfile ?? buildStoryProfile(result.core);
    const storedImage = await this.ensureImage(resultId);
    const presentedImage = await this.presentImage(storedImage, result.core);
    let presentation;
    try {
      const storedPresentation = result.presentation ? ResultPresentationSchema.parse(result.presentation) : undefined;
      if (storedPresentation?.version === 3) {
        presentation = storedPresentation;
      } else {
        const matchedCharacter = await this.libraryImages.getImage(result.core);
        const generatedPresentation = buildResultPresentation(result.core, storyProfile, storedImage, matchedCharacter);
        presentation = storedPresentation
          ? await this.repository.updateResultPresentation(resultId, ResultPresentationSchema.parse({
            ...storedPresentation,
            version: 3,
            hero: { ...storedPresentation.hero, signatureQuote: generatedPresentation.hero.signatureQuote },
          }))
          : await this.repository.saveResultPresentation(resultId, generatedPresentation);
      }
    } catch (error) {
      this.logger.warn(`Presentation unavailable for ${resultId}: ${error instanceof Error ? error.message : String(error)}`);
    }
    const occupationDescription = describeOccupation(result.core);
    const blocksNeedRefresh = inspectResultCanon(result.core, result.blocks).length > 0 || result.blocks.some(({ body }) => body.length > 1800 || inspectNarrative(body).score < 80) || result.blocks.length !== 6 || result.blocks.some(({ body }) =>
      !body.includes('\n\n') || /사용자의 실제 정체성|창작 서사|창작 설정|서사용 이름|마지막 장의 제목|선택을 바탕으로/.test(body));
    const blocks = blocksNeedRefresh ? buildStoryNarrative(result.core) : result.blocks;
    return {
      resultId,
      finalMomentRead: Boolean(result.finalMomentReadAt),
      finalMomentAvailable: false,
      recordNo: result.core.recordNo,
      headline: `${era.label}, ${location.label}에서 일한 ${occupation.label}`,
      character: {
        name: storyProfile.identity.name,
        gender: storyProfile.identity.gender,
        fictional: storyProfile.identity.fictional,
        introduction: buildCharacterIntroduction(storyProfile, occupationDescription),
        occupationDescription,
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
      image: presentedImage,
      ...(presentation ? { presentation: {
        ...presentation,
        hero: { ...presentation.hero, backgroundUri: presentedImage.layers?.find((layer) => layer.role === 'BACKGROUND')?.uri ?? presentedImage.uri },
      } } : {}),
      blocks,
      disclaimer: RESULT_DISCLAIMER,
    };
  }

  async deep(resultId: string) {
    if (process.env.NODE_ENV === 'production') throw new NotFoundException({ code: 'FEATURE_UNAVAILABLE', message: 'Result not found' });
    return this.extended(resultId, 'DEEP', 2);
  }

  async finalMoment(resultId: string) {
    const result = await this.requireResult(resultId);
    const session = await this.repository.getSession(result.sessionId);
    if (!session?.unlocks.includes('DEEP')) throw new ForbiddenException({ code: 'UNLOCK_REQUIRED', message: 'AD 2 completion is required', slot: 2 });
    if (!session.contentVersion.startsWith('3.')) throw new NotFoundException({ code: 'FEATURE_UNAVAILABLE', message: 'Final moment is available for 3.0 stories only' });
    const moment = result.core.storyId ? findStoryFinalMoment(result.core.storyId) : undefined;
    if (!moment) throw new NotFoundException({ code: 'CONTENT_NOT_READY', message: 'Final moment is not ready for this story' });
    const locale = parseContentLocale(session.locale);
    if (!locale) throw new NotFoundException({ code: 'UNSUPPORTED_LOCALE', message: 'Unsupported session locale' });
    let translated: NonNullable<ReturnType<typeof findEnglishStoryTranslation>>['finalMoment'] | null;
    if (locale === 'ko') translated = null;
    else if (locale === 'en') {
      if (!isEnglishStoryReady(result.core.storyId ?? '')) throw new NotFoundException({ code: 'TRANSLATION_NOT_READY', message: 'English story preview is unavailable' });
      translated = findEnglishStoryTranslation(result.core.storyId ?? '')?.finalMoment ?? null;
      if (!translated) throw new NotFoundException({ code: 'TRANSLATION_NOT_READY', message: 'English story preview is unavailable' });
    } else if (locale === 'th') {
      if (!isThaiStoryReady(result.core.storyId ?? '')) throw new NotFoundException({ code: 'TRANSLATION_NOT_READY', message: 'Thai story preview is unavailable' });
      translated = findThaiStoryTranslation(result.core.storyId ?? '')?.finalMoment ?? null;
      if (!translated) throw new NotFoundException({ code: 'TRANSLATION_NOT_READY', message: 'Thai story translation is unavailable' });
    } else if (locale === 'ja') {
      if (!isJapaneseStoryReady(result.core.storyId ?? '')) throw new NotFoundException({ code: 'TRANSLATION_NOT_READY', message: 'Japanese story translation is unavailable' });
      translated = findJapaneseStoryTranslation(result.core.storyId ?? '')?.finalMoment ?? null;
      if (!translated) throw new NotFoundException({ code: 'TRANSLATION_NOT_READY', message: 'Japanese story translation is unavailable' });
    } else {
      const unsupported: never = locale;
      throw new Error(`Missing final moment locale implementation: ${unsupported}`);
    }
    return StoryFinalMomentResponseSchema.parse({
      resultId,
      storyId: moment.storyId,
      protagonist: translated?.protagonist ?? moment.protagonist,
      year: translated?.year ?? moment.year,
      place: translated?.place ?? moment.place,
      scene: translated?.scene ?? moment.scene,
      afterword: translated?.afterword ?? moment.afterword,
      illustration: { uri: moment.artUri, alt: translated?.artAlt ?? moment.artAlt },
    });
  }

  async markFinalMomentRead(resultId: string) {
    await this.finalMoment(resultId);
    const readAt = await this.repository.markFinalMomentRead(resultId);
    return FinalMomentReadResponseSchema.parse({ resultId, finalMomentRead: true, readAt: readAt.toISOString() });
  }

  async guide(resultId: string) {
    if (process.env.NODE_ENV === 'production') throw new NotFoundException({ code: 'FEATURE_UNAVAILABLE', message: 'Result not found' });
    return this.extended(resultId, 'GUIDE', 3);
  }

  async share(resultId: string) {
    const result = await this.requireResult(resultId);
    await this.requireFinalMomentReadFor3(result);
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
    await this.requireFinalMomentReadFor3(result);
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
      sourceImageUri: image.compositeUri ?? image.uri,
      layers: image.layers ?? [],
      compositeSource: image.compositeUri ? 'SERVER_COMPOSITE' as const : image.layers && image.layers.length > 1 ? 'LAYERED_PREVIEW' as const : 'SINGLE_IMAGE' as const,
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
      .then((image) => {
        const issues = inspectImageCompatibility(result.core, image);
        if (issues.length > 0) throw new Error(`Image compatibility check failed: ${issues.map(({ message }) => message).join('; ')}`);
        return image;
      })
      .then((image) => this.repository.saveResultImage(resultId, image))
      .finally(() => this.imageJobs.delete(resultId));
    this.imageJobs.set(resultId, job);
    return job;
  }

  private async presentImage(image: Awaited<ReturnType<ImageProvider['getImage']>>, core: ResultCore) {
    const layered = image.layers?.length ? image : {
      ...image,
      layers: [{ uri: image.uri, role: 'BACKGROUND' as const, alt: image.alt }],
    };
    const layers = layered.layers ?? [];
    if (!layered.uri.startsWith('s3://') && !layers.some((layer) => layer.uri.startsWith('s3://')) && !layered.compositeUri?.startsWith('s3://')) return layered;
    try {
      const resolveUri = async (uri: string) => uri.startsWith('s3://') ? this.imageStorage.getDownloadUrl(uri) : uri;
      return {
        ...layered,
        uri: await resolveUri(layered.uri),
        ...(layered.compositeUri ? { compositeUri: await resolveUri(layered.compositeUri) } : {}),
        layers: await Promise.all(layers.map(async (layer) => ({ ...layer, uri: await resolveUri(layer.uri) }))),
      };
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
    if (result.core.storyId) {
      const image = await this.presentImage(await this.ensureImage(resultId), result.core);
      return buildContentStoryExtended(resultId, result.core, image, unlockType);
    }
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
    if (process.env.NODE_ENV === 'production' && result.core.contentVersion !== RELEASE_CONTENT_VERSION) {
      throw new NotFoundException({ code: 'RESULT_NOT_FOUND', message: 'Result not found' });
    }
    return result;
  }

  private async requireFinalMomentReadFor3(result: Awaited<ReturnType<AssessmentRepository['getResult']>>) {
    if (!result) return;
    const session = await this.repository.getSession(result.sessionId);
    if (session?.contentVersion.startsWith('3.') && !result.finalMomentReadAt) {
      throw new ForbiddenException({ code: 'FINAL_MOMENT_REQUIRED', message: '마지막 순간을 마치면 공유할 수 있습니다.' });
    }
  }
}
