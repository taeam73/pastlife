import type { ImageSourcePropType } from 'react-native';
import { remoteAssetSource } from './assetUrl';

/**
 * Story artwork is served from Cloudflare Pages rather than bundled into the
 * Android binary. Shared UI artwork (branding, fonts, and parchment textures)
 * remains packaged through its direct require() calls in the components that
 * use it.
 */
export function resolveLibraryImage(uri: string): ImageSourcePropType | undefined {
  return remoteAssetSource(uri);
}
