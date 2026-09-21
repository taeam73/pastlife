import { Injectable } from '@nestjs/common';
import { historicalLocations } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { ImageAsset, ImageProvider } from './image.provider.js';

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
      OCC_ARTISAN: 'asset://characters/v1/artisan-male.png',
      OCC_TEACHER: 'asset://characters/v1/teacher-female.png',
      OCC_COMMUNITY_ORGANIZER: 'asset://characters/v1/community-organizer-male.png',
      OCC_PROGRAMMER: 'asset://characters/v1/programmer-female.png',
    };
    const backgroundUri = `asset://${core.libraryImage.key}`;
    const characterUri = characterByOccupation[core.occupationId];
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
