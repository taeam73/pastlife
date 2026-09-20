import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectStagingEnv } from './staging-env.mjs';

const validEnv = {
  DATABASE_URL: 'postgresql://user:secret@ep-demo-pooler.ap-northeast-2.aws.neon.tech/app?sslmode=require',
  DIRECT_URL: 'postgresql://user:secret@ep-demo.ap-northeast-2.aws.neon.tech/app?sslmode=require',
  USE_IN_MEMORY_DB: 'false',
  CONTENT_VERSION: '2.5.0',
  AI_IMAGE_API_URL: 'https://images.example.com/generate',
  AI_IMAGE_API_KEY: 'ai-secret',
  S3_ENDPOINT: 'https://objects.example.com',
  S3_REGION: 'ap-northeast-2',
  S3_BUCKET: 'pastlife-staging-private',
  S3_ACCESS_KEY: 'storage-user',
  S3_SECRET_KEY: 'storage-secret',
};

test('accepts pooled runtime and direct migration Neon endpoints', () => {
  assert.deepEqual(inspectStagingEnv(validEnv), {
    runtimeHost: 'ep-demo-pooler.ap-northeast-2.aws.neon.tech',
    migrationHost: 'ep-demo.ap-northeast-2.aws.neon.tech',
    provider: 'neon',
    contentVersion: '2.5.0',
    aiImageEndpointHost: 'images.example.com',
    storageEndpointHost: 'objects.example.com',
    storageBucket: 'pastlife-staging-private',
    storageRegion: 'ap-northeast-2',
  });
});

test('accepts separate non-Neon PostgreSQL endpoints', () => {
  assert.deepEqual(inspectStagingEnv({
    ...validEnv,
    DATABASE_URL: 'postgresql://runtime:secret@runtime-db.internal/app',
    DIRECT_URL: 'postgresql://migration:secret@migration-db.internal/app',
  }), {
    runtimeHost: 'runtime-db.internal',
    migrationHost: 'migration-db.internal',
    provider: 'postgresql',
    contentVersion: '2.5.0',
    aiImageEndpointHost: 'images.example.com',
    storageEndpointHost: 'objects.example.com',
    storageBucket: 'pastlife-staging-private',
    storageRegion: 'ap-northeast-2',
  });
});

test('rejects unsafe staging modes and versions', () => {
  assert.throws(() => inspectStagingEnv({ ...validEnv, USE_IN_MEMORY_DB: 'true' }), /must be false/);
  assert.throws(() => inspectStagingEnv({ ...validEnv, CONTENT_VERSION: '2.0.0' }), /must be 2\.5\.0/);
});

test('rejects invalid Neon runtime and migration roles', () => {
  assert.throws(() => inspectStagingEnv({ ...validEnv, DATABASE_URL: validEnv.DIRECT_URL.replace('user:', 'runtime:') }), /pooler/);
  assert.throws(() => inspectStagingEnv({ ...validEnv, DIRECT_URL: validEnv.DATABASE_URL.replace('user:', 'migration:') }), /non-pooler/);
  assert.throws(() => inspectStagingEnv({ ...validEnv, DIRECT_URL: validEnv.DATABASE_URL }), /separate/);
});

test('rejects Neon endpoints without required TLS', () => {
  assert.throws(() => inspectStagingEnv({ ...validEnv, DIRECT_URL: validEnv.DIRECT_URL.replace('?sslmode=require', '') }), /sslmode=require/);
});

test('requires complete AI image and private storage configuration', () => {
  for (const name of ['AI_IMAGE_API_URL', 'AI_IMAGE_API_KEY', 'S3_ENDPOINT', 'S3_REGION', 'S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY']) {
    assert.throws(() => inspectStagingEnv({ ...validEnv, [name]: '' }), new RegExp(`${name} is required`));
  }
});

test('requires HTTPS service endpoints and a safe bucket name', () => {
  assert.throws(() => inspectStagingEnv({ ...validEnv, AI_IMAGE_API_URL: 'http://images.example.com/generate' }), /AI_IMAGE_API_URL must use https/);
  assert.throws(() => inspectStagingEnv({ ...validEnv, S3_ENDPOINT: 'http://objects.example.com' }), /S3_ENDPOINT must use https/);
  assert.throws(() => inspectStagingEnv({ ...validEnv, S3_BUCKET: '../private' }), /S3_BUCKET/);
});

test('does not expose credentials in its result', () => {
  const serialized = JSON.stringify(inspectStagingEnv(validEnv));
  assert.equal(serialized.includes('user'), false);
  assert.equal(serialized.includes('secret'), false);
  assert.equal(serialized.includes('ai-secret'), false);
  assert.equal(serialized.includes('storage-user'), false);
  assert.equal(serialized.includes('storage-secret'), false);
});
