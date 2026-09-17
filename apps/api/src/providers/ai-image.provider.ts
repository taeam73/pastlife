import { Inject, Injectable } from '@nestjs/common';
import type { ResultCore } from '@pastlife/scoring';
import type { ImageAsset, ImageProvider } from './image.provider.js';
import { LibraryImageProvider } from './library-image.provider.js';

@Injectable()
export class AiImageProvider implements ImageProvider {
  constructor(@Inject(LibraryImageProvider) private readonly fallback: LibraryImageProvider) {}
  async getImage(core: ResultCore): Promise<ImageAsset> {
    const endpoint = process.env.AI_IMAGE_API_URL;
    if (!endpoint) return this.fallback.getImage(core);
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(process.env.AI_IMAGE_API_KEY ? { Authorization: `Bearer ${process.env.AI_IMAGE_API_KEY}` } : {}) },
          body: JSON.stringify({ core, version: process.env.CONTENT_VERSION ?? '2.5.0', idempotencyKey: core.answerHash }),
        });
        if (!response.ok) continue;
        const body = (await response.json()) as Partial<ImageAsset>;
        if (!body.uri || !body.alt) continue;
        return { sourceType: 'AI', uri: body.uri, alt: body.alt, status: 'READY', attemptCount: attempt };
      } catch {
        // Retry once. The public result flow never fails solely because image generation failed.
      }
    }
    const fallback = await this.fallback.getImage(core);
    return { ...fallback, attemptCount: 2, errorCode: 'IMAGE_GENERATION_FAILED' };
  }
}
