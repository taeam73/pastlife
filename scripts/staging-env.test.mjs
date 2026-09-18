import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectStagingEnv } from './staging-env.mjs';

const validEnv = {
  DATABASE_URL: 'postgresql://user:secret@ep-demo-pooler.ap-northeast-2.aws.neon.tech/app?sslmode=require',
  DIRECT_URL: 'postgresql://user:secret@ep-demo.ap-northeast-2.aws.neon.tech/app?sslmode=require',
  USE_IN_MEMORY_DB: 'false',
  CONTENT_VERSION: '2.5.0',
};

test('accepts pooled runtime and direct migration Neon endpoints', () => {
  assert.deepEqual(inspectStagingEnv(validEnv), {
    runtimeHost: 'ep-demo-pooler.ap-northeast-2.aws.neon.tech',
    migrationHost: 'ep-demo.ap-northeast-2.aws.neon.tech',
    provider: 'neon',
    contentVersion: '2.5.0',
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

test('does not expose credentials in its result', () => {
  const serialized = JSON.stringify(inspectStagingEnv(validEnv));
  assert.equal(serialized.includes('user'), false);
  assert.equal(serialized.includes('secret'), false);
});
