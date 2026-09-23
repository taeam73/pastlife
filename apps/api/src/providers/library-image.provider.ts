import { Injectable } from '@nestjs/common';
import { historicalLocations } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { ImageAsset, ImageProvider } from './image.provider.js';
import { selectLifeIdentity } from './life-identity-catalog.js';

@Injectable()
export class LibraryImageProvider implements ImageProvider {
  async getImage(core: ResultCore): Promise<ImageAsset> {
    const location = historicalLocations.find(({ id }) => id === core.locationId)!;
    const characterByOccupation: Record<string, string> = {
      OCC_SOLDIER: 'asset://characters/v1/soldier-male.png',
      OCC_INDEPENDENCE_FIGHTER: 'asset://characters/v1/independence-female.png',
      OCC_PRINTER: 'asset://characters/v1/printer-female.png',
      OCC_CLEANER: 'asset://characters/v1/cleaner-male.png',
      OCC_PERFORMER: 'asset://characters/v1/performer-female.png',
      OCC_TRADER: 'asset://characters/v1/mali-trader-male.png',
      OCC_RADIO_TECHNICIAN: 'asset://characters/v1/radio-repair-female.png',
      OCC_MUSICIAN: 'asset://characters/v1/music-worker-male.png',
      OCC_MERCHANT: 'asset://characters/v1/market-seller-female.png',
      OCC_SCRIBE: 'asset://characters/v1/mesopotamian-scribe-male.png',
      OCC_NURSE: 'asset://characters/v1/nurse-female.png',
      OCC_UNEMPLOYED: 'asset://characters/v1/unemployed-male.png',
      OCC_BEGGAR: 'asset://characters/v1/beggar-female.png',
      OCC_CLOWN: 'asset://characters/v1/clown-male.png',
      OCC_FARMER: 'asset://characters/v1/farmer-female.png',
      OCC_NAVIGATOR: 'asset://characters/v1/navigator-female.png',
      OCC_ARTISAN: 'asset://characters/v1/young-potter-female.png',
      OCC_TEACHER: 'asset://characters/v1/teacher-female.png',
      OCC_COMMUNITY_ORGANIZER: 'asset://characters/v1/community-organizer-male.png',
      OCC_PROGRAMMER: 'asset://characters/v1/programmer-female.png',
      OCC_SCHOLAR: 'asset://characters/v1/elder-scholar-male.png',
      OCC_FISHER: 'asset://characters/v1/middle-aged-fisher-male.png',
      OCC_WEAVER: 'asset://characters/v1/child-weaver-female.png',
    };
    const gender = selectLifeIdentity(core).identity.gender;
    const isFemale = gender.startsWith('여');
    const preferredCharacterUri = characterByOccupation[core.occupationId];
    const exactCharacterBySettingOccupation: Record<string, { female: string; male: string }> = {
      'LOC_HEIAN_KYO:OCC_ARTISAN': {
        female: 'asset://characters/v2/heian-artisan-female.png',
        male: 'asset://characters/v2/heian-artisan-male.png',
      },
    };
    const locationFallbacks: Record<string, { female: string; male: string }> = {
      LOC_HEIAN_KYO: {
        female: 'asset://characters/v1/porcelain-artisan-female.png',
        male: 'asset://characters/v1/rice-farmer-male.png',
      },
    };
    const eraFallbacks: Record<string, { female: string[]; male: string[] }> = {
      ERA_ANCIENT_CIV: {
        female: ['asset://characters/v1/roman-bathkeeper-female.png', 'asset://characters/v1/healer-female.png'],
        male: ['asset://characters/v1/mesopotamian-scribe-male.png', 'asset://characters/v1/artisan-male.png'],
      },
      ERA_MEDIEVAL: {
        female: ['asset://characters/v1/porcelain-artisan-female.png', 'asset://characters/v1/healer-female.png'],
        male: ['asset://characters/v1/rice-farmer-male.png', 'asset://characters/v1/mali-trader-male.png', 'asset://characters/v1/artisan-male.png'],
      },
      ERA_RENAISSANCE_EARLY_MODERN: {
        female: ['asset://characters/v1/teacher-renaissance-female.png', 'asset://characters/v1/young-potter-female.png'],
        male: ['asset://characters/v1/artisan-male.png', 'asset://characters/v1/sailor-male.png'],
      },
    };
    const genderSuffix = isFemale ? '-female.png' : '-male.png';
    const exactCharacter = exactCharacterBySettingOccupation[`${core.locationId}:${core.occupationId}`]?.[isFemale ? 'female' : 'male'];
    const locationFallback = locationFallbacks[core.locationId]?.[isFemale ? 'female' : 'male'];
    const eraCandidates = eraFallbacks[core.eraId]?.[isFemale ? 'female' : 'male'] ?? (isFemale
      ? ['asset://characters/v1/printer-female.png', 'asset://characters/v1/performer-female.png']
      : ['asset://characters/v1/community-organizer-male.png', 'asset://characters/v1/artisan-male.png']);
    const characterUri = exactCharacter ?? (preferredCharacterUri?.endsWith(genderSuffix)
      ? preferredCharacterUri
      : locationFallback ?? eraCandidates[core.recordNo % eraCandidates.length]);
    const backgroundUri = 'asset://' + core.libraryImage.key;
    return {
      sourceType: 'LIBRARY',
      uri: backgroundUri,
      alt: `${location.label} historical scene`,
      status: 'FALLBACK',
      attemptCount: 0,
      layers: [
        { uri: backgroundUri, role: 'BACKGROUND', alt: 'historical background' },
        ...(characterUri ? [{ uri: characterUri, role: 'CHARACTER' as const, alt: 'historical character' }] : []),
      ],
    };
  }
}
