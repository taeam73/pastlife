import { describe, expect, it } from 'vitest';
import { resolveAuthRuntimeConfig } from '../src/config/auth.js';

describe('auth runtime configuration', () => {
  it('enables mock auth only when explicitly requested outside production', () => {
    expect(resolveAuthRuntimeConfig({ USE_MOCK_GOOGLE: 'true' })).toMatchObject({
      googleMode: 'mock',
      googleClientIds: [],
      jwtSecret: 'dev-secret',
    });
  });

  it('accepts a comma-separated Google audience allowlist', () => {
    expect(resolveAuthRuntimeConfig({
      GOOGLE_CLIENT_IDS: 'web.apps.googleusercontent.com, ios.apps.googleusercontent.com',
      JWT_SECRET: 'development-secret',
    })).toMatchObject({
      googleMode: 'google',
      googleClientIds: ['web.apps.googleusercontent.com', 'ios.apps.googleusercontent.com'],
    });
  });

  it('fails closed when neither real nor mock Google auth is configured', () => {
    expect(() => resolveAuthRuntimeConfig({})).toThrow('GOOGLE_CLIENT_IDS');
  });

  it('rejects mock auth and weak signing secrets in production', () => {
    expect(() => resolveAuthRuntimeConfig({
      NODE_ENV: 'production',
      USE_MOCK_GOOGLE: 'true',
      JWT_SECRET: 'a'.repeat(32),
    })).toThrow('not allowed in production');
    expect(() => resolveAuthRuntimeConfig({
      NODE_ENV: 'production',
      GOOGLE_CLIENT_ID: 'web.apps.googleusercontent.com',
      JWT_SECRET: 'short',
    })).toThrow('at least 32 characters');
    expect(() => resolveAuthRuntimeConfig({
      NODE_ENV: 'production',
      GOOGLE_CLIENT_ID: 'web.apps.googleusercontent.com',
      JWT_SECRET: 'replace-with-a-long-random-secret',
    })).toThrow('non-placeholder');
  });
});
