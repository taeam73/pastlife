import { describe, expect, it } from 'vitest';
import { historicalSettings } from '../src/historical/settings.js';

describe('historical setting variants', () => {
  it('keeps the source location label and visual context', () => {
    const byId = new Map(historicalSettings.map((setting) => [setting.id, setting]));
    for (const variant of historicalSettings.filter((setting) => /_VARIANT_\d+$/u.test(setting.id))) {
      const source = byId.get(variant.id.replace(/_VARIANT_\d+$/u, ''));
      expect(source).toBeDefined();
      expect(variant.label).toBe(source?.label);
      expect(variant.eraId).toBe(source?.eraId);
      expect(variant.visual.fallbackAssetKey).toBe(source?.visual.fallbackAssetKey);
    }
  });
});
