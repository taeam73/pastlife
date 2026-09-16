import { describe, expect, it } from 'vitest';
import { resolveDatabaseRuntimeConfig } from '../src/config/database.js';

describe('database runtime configuration', () => {
  it('uses memory only when development explicitly requests it', () => {
    expect(resolveDatabaseRuntimeConfig({ USE_IN_MEMORY_DB: 'true' })).toEqual({
      mode: 'memory',
      provider: 'memory',
      pooled: false,
    });
  });

  it('accepts a Neon pooled URL for Prisma runtime traffic', () => {
    expect(
      resolveDatabaseRuntimeConfig({
        DATABASE_URL:
          'postgresql://user:secret@ep-example-pooler.ap-northeast-2.aws.neon.tech/db?sslmode=require',
        USE_IN_MEMORY_DB: 'false',
      }),
    ).toMatchObject({
      mode: 'prisma',
      provider: 'postgresql',
      host: 'ep-example-pooler.ap-northeast-2.aws.neon.tech',
      pooled: true,
    });
  });

  it('rejects a Neon direct URL at API runtime', () => {
    expect(() =>
      resolveDatabaseRuntimeConfig({
        DATABASE_URL:
          'postgresql://user:secret@ep-example.ap-northeast-2.aws.neon.tech/db?sslmode=require',
        USE_IN_MEMORY_DB: 'false',
      }),
    ).toThrow('use DIRECT_URL for migrations');
  });

  it('rejects implicit or explicit memory storage in production', () => {
    expect(() => resolveDatabaseRuntimeConfig({ NODE_ENV: 'production' })).toThrow(
      'DATABASE_URL is required in production',
    );
    expect(() =>
      resolveDatabaseRuntimeConfig({
        NODE_ENV: 'production',
        USE_IN_MEMORY_DB: 'true',
      }),
    ).toThrow('not allowed in production');
  });
});
