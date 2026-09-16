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
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.AI_IMAGE_API_KEY ? { Authorization: `Bearer ${process.env.AI_IMAGE_API_KEY}` } : {}) }, body: JSON.stringify({ core, version: process.env.CONTENT_VERSION ?? '2.0.0' }) });
      if (!response.ok) return this.fallback.getImage(core);
      const body = (await response.json()) as Partial<ImageAsset>;
      if (body.sourceType !== 'LIBRARY' || !body.uri || !body.alt) return this.fallback.getImage(core);
      return body as ImageAsset;
    } catch { return this.fallback.getImage(core); }
  }
}
