import { describe, expect, it, vi } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import { ResultPresentationSchema } from '@pastlife/contracts';
import { buildStoryProfile } from '../src/providers/story-narrative.js';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { buildResultPresentation } from '../src/results/build-result-presentation.js';
import { historicalSettings } from '@pastlife/content';
import { selectLifeIdentity } from '../src/providers/life-identity-catalog.js';
import { MemoryAssessmentRepository } from '../src/repositories/memory-assessment.repository.js';
import { ResultsService } from '../src/results/results.service.js';

const core = {
  contentVersion: '2.5.0', answerHash: 'presentation-fixture', recordNo: 17,
  scores: { tags: {}, axes: {}, topTags: [] },
  eraId: 'ERA_ANCIENT_CIV', regionId: 'REG_EAST_ASIA', locationId: 'LOC_MESOPOTAMIA',
  classId: 'CLASS_SCHOLAR', occupationId: 'OCC_SCRIBE', personalityId: 'PERSON_ANALYTIC',
  relationshipId: 'REL_COMPANION', eventId: 'EVENT_01', lastMemoryId: 'MEM_RAIN',
  basicBlockIds: [], libraryImage: { key: 'library/v4/mesopotamia-ur-daily.webp', promptTags: [] },
} as unknown as ResultCore;

describe('result presentation', () => {
  it('builds one stable scene and four ordered text chapters', async () => {
    const provider = new LibraryImageProvider();
    const image = await provider.getImage(core);
    const presentation = buildResultPresentation(core, buildStoryProfile(core), image, image);
    expect(ResultPresentationSchema.parse(presentation)).toEqual(presentation);
    expect(presentation.chapters.map(({ id }) => id)).toEqual(['MEETING', 'TRIAL', 'CHOICE', 'NOW']);
    expect(presentation.hero.backgroundUri).toBe(image.uri);
    expect(presentation.version).toBe(3);
    expect(presentation.hero.signatureQuote).toMatch(/^“.+[.!?]”$/u);
    expect(Array.from(presentation.hero.signatureQuote).length).toBeLessThanOrEqual(80);
    expect(['갈대 첨필', '봉인 인장'].some((object) => presentation.hero.signatureQuote.includes(object))).toBe(true);
    expect(new Set(presentation.chapters.map(({ crop }) => crop.focusX)).size).toBe(4);
    expect(presentation.hero.characterUri).toContain('mesopotamian-scribe');
    expect(presentation.chapters[2].body).toContain('.');
  });
  it('backfills and persists a signature quote for a legacy presentation', async () => {
    const repository = new MemoryAssessmentRepository();
    const provider = new LibraryImageProvider();
    const profile = buildStoryProfile(core);
    const image = await provider.getImage(core);
    const generated = buildResultPresentation(core, profile, image, image);
    const { signatureQuote: _signatureQuote, ...legacyHero } = generated.hero;
    await repository.createSession({ id: 'presentation-session', anonymousId: 'anonymous', locale: 'ko', seed: 'seed', contentVersion: '2.5.0', status: 'CREATED', viewMode: 'TEXT', expiresAt: new Date(Date.now() + 60_000) });
    await repository.completeAd('presentation-session', 1, 'presentation-ad');
    await repository.saveResult({ id: 'presentation-result', sessionId: 'presentation-session', status: 'READY', core, storyProfile: profile, blocks: [] });
    await repository.saveResultImage('presentation-result', image);
    await repository.saveResultPresentation('presentation-result', { ...generated, version: 2, hero: legacyHero });
    const storage = { putObject: async () => '', getDownloadUrl: async (reference: string) => reference };
    const service = new ResultsService(repository, provider, storage, provider);

    const response = await service.basic('presentation-result');
    const upgraded = ResultPresentationSchema.parse(response.presentation);
    expect(upgraded.version).toBe(3);
    if (upgraded.version !== 3) throw new Error('Expected an upgraded presentation');
    expect(upgraded.hero.signatureQuote).toBe(generated.hero.signatureQuote);
    const stored = await repository.getResult('presentation-result');
    expect(stored?.presentation?.version).toBe(3);

    const imageLookup = vi.spyOn(provider, 'getImage').mockRejectedValue(new Error('catalog unavailable'));
    const repeated = await service.basic('presentation-result');
    expect(repeated.presentation).toEqual(response.presentation);
    expect(imageLookup).not.toHaveBeenCalled();
  });
  it('uses the source setting identity and matched character for a variant', async () => {
    const variant = historicalSettings.find((item) => item.id.startsWith('LOC_SWASHILI_VARIANT_'))!;
    const swahiliCore = { ...core, locationId: variant.id, eraId: variant.eraId, regionId: variant.regionId, occupationId: 'OCC_SHIPWRIGHT', libraryImage: { key: 'library/v4/swahili-kilwa-daily.webp', promptTags: [] } } as ResultCore;
    const provider = new LibraryImageProvider();
    const image = await provider.getImage(swahiliCore);
    const presentation = buildResultPresentation(swahiliCore, buildStoryProfile(swahiliCore), image, image);
    expect(presentation.hero.lifeSummary).toContain('스와힐리 해안 도시권');
    expect(presentation.hero.title).toBe('스와힐리 해안 도시권');
    expect(presentation.hero.lifeSummary).not.toContain('철도');
    expect(presentation.hero.characterUri).toContain('kilwa-shipwright-male');
    expect(presentation.chapters[1].body).toContain('스와힐리 해안 도시권');
  });
  it('shows a matching Andean woman farmer portrait and a concise life line', async () => {
    const base = { ...core, locationId: 'LOC_ANDES', eraId: 'ERA_AGE_OF_EXPLORATION', regionId: 'REG_AMERICAS', occupationId: 'OCC_FARMER', libraryImage: { key: 'library/v4/inca-andes-work.png', promptTags: [] } } as ResultCore;
    const answerHash = Array.from({ length: 20 }, (_, index) => `andes-farmer-${index}`).find((hash) => selectLifeIdentity({ ...base, answerHash: hash }).identity.gender === '여성')!;
    const farmerCore = { ...base, answerHash };
    const image = await new LibraryImageProvider().getImage(farmerCore);
    const presentation = buildResultPresentation(farmerCore, buildStoryProfile(farmerCore), image, image);
    expect(image.matchQuality).toBe('EXACT');
    expect(presentation.hero.characterUri).toContain('andes-farmer-female');
    expect(presentation.hero.tagline).not.toContain('성향');
    expect(presentation.hero.tagline).not.toContain('언제나 괜찮고');
    expect(Array.from(presentation.hero.tagline).length).toBeLessThanOrEqual(65);
    expect(presentation.hero.signatureQuote).not.toBe(presentation.hero.tagline);
  });
  it('does not substitute a market seller for a female Timbuktu scribe', async () => {
    const base = { ...core, locationId: 'LOC_MALI_TIMBUKTU', eraId: 'ERA_MEDIEVAL', regionId: 'REG_SUBSAHARAN_AFRICA', occupationId: 'OCC_SCRIBE', libraryImage: { key: 'library/v4/mali-timbuktu-work.png', promptTags: [] } } as ResultCore;
    const answerHash = Array.from({ length: 20 }, (_, index) => `mali-scribe-${index}`).find((hash) => selectLifeIdentity({ ...base, answerHash: hash }).identity.gender === '여성')!;
    const scribeCore = { ...base, answerHash };
    const image = await new LibraryImageProvider().getImage(scribeCore);
    const presentation = buildResultPresentation(scribeCore, buildStoryProfile(scribeCore), image, image);
    expect(presentation.hero.characterUri).toBe('asset://characters/v2/mali-scribe-female.png');
  });
  it('uses an Ottoman artisan instead of a European craftsman for Istanbul', async () => {
    const base = { ...core, locationId: 'LOC_OTTOMAN_ISTANBUL', eraId: 'ERA_RENAISSANCE_EARLY_MODERN', occupationId: 'OCC_ARTISAN', libraryImage: { key: 'library/v4/ottoman-istanbul-work.png', promptTags: [] } } as ResultCore;
    const answerHash = Array.from({ length: 20 }, (_, index) => `ottoman-artisan-${index}`).find((hash) => selectLifeIdentity({ ...base, answerHash: hash }).identity.gender === '남성')!;
    const image = await new LibraryImageProvider().getImage({ ...base, answerHash });
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers?.find(({ role }) => role === 'CHARACTER')?.uri).toBe('asset://characters/v2/ottoman-artisan-male.png');
  });
  it('does not call an unrelated legacy portrait an exact match', async () => {
    const base = { ...core, locationId: 'LOC_HAN_CHANGAN', occupationId: 'OCC_SCRIBE', libraryImage: { key: 'library/v4/han-changan-work.png', promptTags: [] } } as ResultCore;
    const answerHash = Array.from({ length: 20 }, (_, index) => `han-scribe-${index}`).find((hash) => selectLifeIdentity({ ...base, answerHash: hash }).identity.gender === '남성')!;
    const image = await new LibraryImageProvider().getImage({ ...base, answerHash });
    expect(image.matchQuality).toBe('FALLBACK');
  });
});
