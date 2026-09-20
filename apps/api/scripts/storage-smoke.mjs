import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { inspectStagingEnv } from '../../../scripts/staging-env.mjs';

const SIGNED_URL_TTL_SECONDS = 900;
const SMOKE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

const inspected = inspectStagingEnv(process.env);
const key = `smoke/${Date.now()}-${randomUUID()}.png`;
const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

let uploaded = false;
try {
  await client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: SMOKE_PNG,
    ContentType: 'image/png',
  }));
  uploaded = true;

  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
    { expiresIn: SIGNED_URL_TTL_SECONDS },
  );
  const response = await fetch(signedUrl, { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.ok, true, `Signed download failed with HTTP ${response.status}`);
  const downloaded = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(downloaded, SMOKE_PNG, 'Downloaded object bytes do not match the upload');

  console.log(`Storage smoke passed for endpoint host: ${inspected.storageEndpointHost}`);
  console.log(`Bucket: ${inspected.storageBucket}`);
  console.log(`Object key: ${key}`);
  console.log(`Signed download TTL: ${SIGNED_URL_TTL_SECONDS} seconds`);
} finally {
  if (uploaded) {
    await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    console.log(`Smoke object cleanup passed: ${key}`);
  }
  client.destroy();
}
