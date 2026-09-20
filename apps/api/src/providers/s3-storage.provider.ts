import { Injectable } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ImageStorage } from './storage.provider.js';

const SIGNED_URL_TTL_SECONDS = 900;

@Injectable()
export class S3StorageProvider implements ImageStorage {
  async putObject(key: string, body: Uint8Array, contentType: string): Promise<string> {
    const { client, bucket } = this.config();
    const normalizedKey = this.validateKey(key);
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: normalizedKey, Body: body, ContentType: contentType }));
    return `s3://${bucket}/${normalizedKey}`;
  }

  async getDownloadUrl(reference: string): Promise<string> {
    const { client, bucket } = this.config();
    const parsed = new URL(reference);
    const key = this.validateKey(decodeURIComponent(parsed.pathname.replace(/^\//, '')));
    if (parsed.protocol !== 's3:' || parsed.hostname !== bucket) throw new Error('Image reference does not match the configured S3 bucket');
    return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: SIGNED_URL_TTL_SECONDS });
  }

  private config() {
    const endpoint = process.env.S3_ENDPOINT;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) throw new Error('Complete S3 storage configuration is required');
    return {
      bucket,
      client: new S3Client({
        endpoint,
        region: process.env.S3_REGION ?? 'us-east-1',
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
      }),
    };
  }

  private validateKey(key: string) {
    const normalized = key.replace(/^\/+/, '');
    if (!normalized || normalized.includes('..') || normalized.includes('\\')) throw new Error('Invalid object key');
    return normalized;
  }
}
