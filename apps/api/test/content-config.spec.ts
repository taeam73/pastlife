import { describe, expect, it } from 'vitest';
import { resolveContentRuntimeConfig } from '../src/config/content.js';

describe('release content version', () => {
  it('defaults to 3.0.0 and rejects an older production version', () => {
    expect(resolveContentRuntimeConfig({} as NodeJS.ProcessEnv).contentVersion).toBe('3.0.0');
    expect(() => resolveContentRuntimeConfig({ NODE_ENV: 'production', CONTENT_VERSION: '2.5.0' } as NodeJS.ProcessEnv)).toThrow('3.0.0');
    expect(resolveContentRuntimeConfig({ NODE_ENV: 'production', CONTENT_VERSION: '3.0.0' } as NodeJS.ProcessEnv).contentVersion).toBe('3.0.0');
  });
});
