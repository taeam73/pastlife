import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { ResultCore } from '@pastlife/scoring';
import type { ImageAsset, ImageProvider } from './image.provider.js';
import { LibraryImageProvider } from './library-image.provider.js';
import { buildAiImagePrompt } from './ai-image-request.js';
import { IMAGE_STORAGE, type ImageStorage } from './storage.provider.js';

const IMAGE_GENERATION_TIMEOUT_MS = 30_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
]);

function readGeneratedImage(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const { uri, alt } = value as { uri?: unknown; alt?: unknown };
  if (typeof uri !== 'string' || typeof alt !== 'string') return null;
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    return null;
  }
  const normalizedAlt = alt.trim();
  if (parsed.protocol !== 'https:' || normalizedAlt.length === 0 || normalizedAlt.length > 500) return null;
  return { uri: parsed.toString(), alt: normalizedAlt };
}

@Injectable()
export class AiImageProvider implements ImageProvider {
  constructor(
    @Inject(LibraryImageProvider) private readonly fallback: LibraryImageProvider,
    @Inject(IMAGE_STORAGE) private readonly storage: ImageStorage,
  ) {}
  async getImage(core: ResultCore): Promise<ImageAsset> {
    const endpoint = process.env.AI_IMAGE_API_URL;
    if (!endpoint) return this.fallback.getImage(core);
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(process.env.AI_IMAGE_API_KEY ? { Authorization: `Bearer ${process.env.AI_IMAGE_API_KEY}` } : {}) },
          signal: AbortSignal.timeout(IMAGE_GENERATION_TIMEOUT_MS),
          body: JSON.stringify({
            prompt: buildAiImagePrompt(core),
            version: process.env.CONTENT_VERSION ?? '2.5.0',
            idempotencyKey: core.answerHash,
            n: 1,
            quality: 'low',
          }),
        });
        if (!response.ok) continue;
        const generated = readGeneratedImage(await response.json());
        if (!generated) continue;
        const storedUri = await this.persistImage(core.answerHash, generated.uri);
        return { sourceType: 'AI', uri: storedUri, alt: generated.alt, status: 'READY', attemptCount: attempt };
      } catch {
        // Retry once. The public result flow never fails solely because image generation failed.
      }
    }
    const fallback = await this.fallback.getImage(core);
    return { ...fallback, attemptCount: 2, errorCode: 'IMAGE_GENERATION_FAILED' };
  }

  private async persistImage(answerHash: string, sourceUri: string) {
    const response = await fetch(sourceUri, { signal: AbortSignal.timeout(IMAGE_GENERATION_TIMEOUT_MS) });
    if (!response.ok) throw new Error('Generated image download failed');
    const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() ?? '';
    const extension = IMAGE_EXTENSIONS.get(contentType);
    if (!extension) throw new Error('Generated asset is not a supported image');
    const declaredSize = Number(response.headers.get('content-length') ?? '0');
    if (Number.isFinite(declaredSize) && declaredSize > MAX_IMAGE_BYTES) throw new Error('Generated image exceeds the size limit');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) throw new Error('Generated image has an invalid size');
    const safeHash = /^[A-Za-z0-9_-]{1,128}$/.test(answerHash) ? answerHash : createHash('sha256').update(answerHash).digest('hex');
    return this.storage.putObject(`results/${safeHash}.${extension}`, bytes, contentType);
  }
}
