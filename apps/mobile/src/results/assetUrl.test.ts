import { describe, expect, it } from 'vitest';
import { remoteAssetSource } from './assetUrl';

describe('remoteAssetSource', () => {
  it('maps asset identifiers to an HTTPS CDN URL', () => {
    expect(remoteAssetSource('asset://stories/v3/sample image.jpg', 'https://assets.example.com/')).toEqual({
      uri: 'https://assets.example.com/assets/stories/v3/sample%20image.jpg',
    });
  });

  it('returns undefined without a safe base URL', () => {
    expect(remoteAssetSource('asset://stories/v3/sample.jpg', undefined)).toBeUndefined();
    expect(remoteAssetSource('asset://stories/v3/sample.jpg', 'http://assets.example.com')).toBeUndefined();
    expect(remoteAssetSource('https://example.com/sample.jpg', 'https://assets.example.com')).toBeUndefined();
    expect(remoteAssetSource('asset://../secret', 'https://assets.example.com')).toBeUndefined();
  });
});
