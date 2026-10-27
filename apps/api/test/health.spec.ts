import { describe, expect, it } from 'vitest';
import { HealthController } from '../src/health/health.controller.js';

describe('HealthController', () => {
  it('returns a sanitized liveness response', () => {
    process.env.CONTENT_VERSION = '3.0.0';
    expect(new HealthController().get()).toEqual({ status: 'ok', contentVersion: '3.0.0' });
  });
});
