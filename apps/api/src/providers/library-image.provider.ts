import { Injectable } from '@nestjs/common';
import { historicalLocations } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { ImageProvider } from './image.provider.js';

@Injectable()
export class LibraryImageProvider implements ImageProvider {
  async getImage(core: ResultCore) {
    const location = historicalLocations.find(({ id }) => id === core.locationId)!;
    return {
      sourceType: 'LIBRARY' as const,
      uri: `asset://${core.libraryImage.key}`,
      alt: `${location.label}을 표현한 역사 일러스트`,
      status: 'FALLBACK' as const,
      attemptCount: 0,
    };
  }
}
