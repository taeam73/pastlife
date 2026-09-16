import { Injectable } from '@nestjs/common';
import type { ImageStorage } from './storage.provider.js';

@Injectable()
export class S3StorageProvider implements ImageStorage {
  async putObject(key: string, body: Uint8Array, contentType: string): Promise<string> {
    const endpoint = process.env.S3_ENDPOINT;
    const bucket = process.env.S3_BUCKET ?? 'pastlife-private';
    if (!endpoint) throw new Error('S3_ENDPOINT is required for object storage');
    const url = `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`;
    const response = await fetch(url, { method: 'PUT', headers: { 'Content-Type': contentType, ...(process.env.S3_ACCESS_KEY ? { 'X-Access-Key': process.env.S3_ACCESS_KEY } : {}) }, body: body as BodyInit });
    if (!response.ok) throw new Error(`S3 upload failed: ${response.status}`);
    return url;
  }
}
