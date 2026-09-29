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
      'LOC_MESOPOTAMIA:OCC_SCRIBE': { female: 'asset://characters/v2/mesopotamia-scribe-female.png', male: 'asset://characters/v1/mesopotamian-scribe-male.png' },
      'LOC_MESOPOTAMIA:OCC_MERCHANT': { female: 'asset://characters/v1/market-seller-female.png', male: 'asset://characters/v2/mesopotamia-merchant-male.png' },
      'LOC_GANGES:OCC_HEALER': { female: 'asset://characters/v2/ganges-healer-female.png', male: 'asset://characters/v2/ganges-healer-male.png' },
      'LOC_GANGES:OCC_MERCHANT': { female: 'asset://characters/v1/market-seller-female.png', male: 'asset://characters/v2/ganges-merchant-male.png' },
      'LOC_ABBASID:OCC_SCRIBE': { female: 'asset://characters/v2/abbasid-scribe-female.png', male: 'asset://characters/v1/mesopotamian-scribe-male.png' },
      'LOC_ABBASID:OCC_MERCHANT': { female: 'asset://characters/v1/market-seller-female.png', male: 'asset://characters/v2/abbasid-merchant-male.png' },
      'LOC_VENICE:OCC_PRINTER': { female: 'asset://characters/v2/venice-printer-female.png', male: 'asset://characters/v2/venice-printer-male.png' },
      'LOC_VENICE:OCC_NAVIGATOR': { female: 'asset://characters/v1/navigator-female.png', male: 'asset://characters/v2/venice-navigator-male.png' },
      'LOC_HEIAN_KYO:OCC_TEXTILE': { female: 'asset://characters/v2/heian-textile-female.png', male: 'asset://characters/v1/rice-farmer-male.png' },
      'LOC_HEIAN_KYO:OCC_SCRIBE': { female: 'asset://characters/v1/teacher-female.png', male: 'asset://characters/v2/heian-scribe-male.png' },
      'LOC_SWASHILI:OCC_MERCHANT': { female: 'asset://characters/v2/kilwa-merchant-female.png', male: 'asset://characters/v1/mali-trader-male.png' },
      'LOC_SWASHILI:OCC_SHIPWRIGHT': { female: 'asset://characters/v1/dock-worker-female.png', male: 'asset://characters/v2/kilwa-shipwright-male.png' },
      'LOC_ANDES:OCC_TEXTILE': { female: 'asset://characters/v2/andes-textile-female.png', male: 'asset://characters/v1/artisan-male.png' },
      'LOC_ANDES:OCC_MESSENGER': { female: 'asset://characters/v2/andes-messenger-female.png', male: 'asset://characters/v2/andes-messenger-male.png' },
      'LOC_STEPPE:OCC_HEALER': { female: 'asset://characters/v2/steppe-healer-female2.png', male: 'asset://characters/v2/steppe-healer-male2.png' },
      'LOC_STEPPE:OCC_MESSENGER': { female: 'asset://characters/v1/navigator-female.png', male: 'asset://characters/v2/steppe-messenger-male.png' },
      'LOC_POLYNESIA:OCC_CEREMONIAL': { female: 'asset://characters/v2/polynesia-ceremonial-female.png', male: 'asset://characters/v1/griot-musician-male.png' },
      'LOC_POLYNESIA:OCC_NAVIGATOR': { female: 'asset://characters/v1/navigator-female.png', male: 'asset://characters/v2/polynesia-navigator-male2.png' },
      'LOC_HAN_CHANGAN:OCC_ARTISAN': { female: 'asset://characters/v2/han-artisan-female.png', male: 'asset://characters/v1/artisan-male.png' },
      'LOC_HAN_CHANGAN:OCC_OFFICIAL': { female: 'asset://characters/v1/teacher-female.png', male: 'asset://characters/v2/han-official-male.png' },
      'LOC_JOSEON_HANYANG:OCC_PRINTER': { female: 'asset://characters/v2/joseon-printer-female.png', male: 'asset://characters/v2/joseon-printer-male.png' },
      'LOC_JOSEON_HANYANG:OCC_OFFICIAL': { female: 'asset://characters/v2/joseon-official-female.png', male: 'asset://characters/v2/joseon-official-male.png' },
      'LOC_AZTEC_TENOCHTITLAN:OCC_MERCHANT': { female: 'asset://characters/v2/mexica-merchant-female2.png', male: 'asset://characters/v2/mexica-merchant-male2.png' },
      'LOC_AZTEC_TENOCHTITLAN:OCC_FARMER': { female: 'asset://characters/v1/farmer-female.png', male: 'asset://characters/v2/mexica-farmer-male.png' },
      'LOC_INDUSTRIAL_HANSEONG:OCC_JOURNALIST': { female: 'asset://characters/v2/hanseong-journalist-female.png', male: 'asset://characters/v2/hanseong-journalist-male.png' },
      'LOC_INDUSTRIAL_HANSEONG:OCC_RADIO_TECHNICIAN': { female: 'asset://characters/v1/radio-repair-female.png', male: 'asset://characters/v2/hanseong-radio-male.png' },
      'LOC_SHANGHAI_1920:OCC_PHOTOGRAPHER': { female: 'asset://characters/v2/shanghai-photographer-female.png', male: 'asset://characters/v1/photographer-male.png' },
      'LOC_SHANGHAI_1920:OCC_PRINTER': { female: 'asset://characters/v1/printer-female.png', male: 'asset://characters/v2/shanghai-printer-male.png' },
      'LOC_SEOUL_1940:OCC_JOURNALIST': { female: 'asset://characters/v2/seoul-bookbinder-female.png', male: 'asset://characters/v2/seoul-journalist-male.png' },
      'LOC_SEOUL_1940:OCC_COMMUNITY_ORGANIZER': { female: 'asset://characters/v2/seoul-organizer-female.png', male: 'asset://characters/v2/seoul-organizer-male.png' },
      'LOC_BUSAN_1950:OCC_MERCHANT': { female: 'asset://characters/v2/busan-merchant-female.png', male: 'asset://characters/v2/busan-merchant-male.png' },
      'LOC_BUSAN_1950:OCC_RADIO_TECHNICIAN': { female: 'asset://characters/v1/radio-repair-female.png', male: 'asset://characters/v2/busan-radio-male.png' },
      'LOC_TOKYO_1960:OCC_RADIO_TECHNICIAN': { female: 'asset://characters/v2/tokyo-radio-female.png', male: 'asset://characters/v2/tokyo-radio-male.png' },
      'LOC_TOKYO_1960:OCC_PERFORMER': { female: 'asset://characters/v1/performer-female.png', male: 'asset://characters/v2/tokyo-performer-male.png' },
      'LOC_LAGOS_1980:OCC_MUSICIAN': { female: 'asset://characters/v2/lagos-musician-female.png', male: 'asset://characters/v1/music-worker-male.png' },
      'LOC_LAGOS_1980:OCC_JOURNALIST': { female: 'asset://characters/v1/journalist-female.png', male: 'asset://characters/v2/lagos-journalist-male.png' },
      'LOC_SAO_PAULO_1990:OCC_PROGRAMMER': { female: 'asset://characters/v2/saopaulo-programmer-female2.png', male: 'asset://characters/v2/saopaulo-programmer-male.png' },
      'LOC_SAO_PAULO_1990:OCC_JOURNALIST': { female: 'asset://characters/v1/journalist-female.png', male: 'asset://characters/v2/saopaulo-journalist-male.png' },
      'LOC_MALI_TIMBUKTU:OCC_TEACHER': { female: 'asset://characters/v2/mali-teacher-female.png', male: 'asset://characters/v2/mali-teacher-male.png' },
      'LOC_MALI_TIMBUKTU:OCC_BUILDER': { female: 'asset://characters/v2/mali-builder-female.png', male: 'asset://characters/v2/mali-builder-male.png' },
      'LOC_EDO:OCC_ARTISAN': { female: 'asset://characters/v2/edo-artisan-female.png', male: 'asset://characters/v1/artisan-male.png' },
      'LOC_EDO:OCC_MERCHANT': { female: 'asset://characters/v1/market-seller-female.png', male: 'asset://characters/v2/edo-merchant-male.png' },
      'LOC_OTTOMAN_ISTANBUL:OCC_ARTISAN': { female: 'asset://characters/v2/ottoman-artisan-female.png', male: 'asset://characters/v1/artisan-male.png' },
      'LOC_OTTOMAN_ISTANBUL:OCC_OFFICIAL': { female: 'asset://characters/v2/ottoman-official-female.png', male: 'asset://characters/v2/ottoman-official-male2.png' },
      'LOC_HAN_CHANGAN:OCC_SCRIBE': {
        female: 'asset://characters/v2/han-scribe-female.png',
        male: 'asset://characters/v1/mesopotamian-scribe-male.png',
      },
      'LOC_ABBASID:OCC_HEALER': {
        female: 'asset://characters/v1/healer-female.png',
        male: 'asset://characters/v2/abbasid-healer-male.png',
      },
      'LOC_MALI_TIMBUKTU:OCC_SCRIBE': {
        female: 'asset://characters/v1/market-seller-female.png',
        male: 'asset://characters/v2/mali-scribe-male.png',
      },
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
