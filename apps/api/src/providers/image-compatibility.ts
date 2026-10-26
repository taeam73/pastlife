import { findHistoricalSettingExpansion, historicalLocations } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { ImageAsset } from './image.provider.js';
import { storyImageAssets } from './library-image.provider.js';

export type ImageCompatibilityIssue = { field: 'background' | 'character' | 'layers'; message: string };

export function inspectImageCompatibility(core: ResultCore, image: ImageAsset): ImageCompatibilityIssue[] {
  if (core.storyId) {
    const artwork = storyImageAssets[core.storyId];
    const backgrounds = image.layers?.filter((layer) => layer.role === 'BACKGROUND') ?? [];
    const characters = image.layers?.filter((layer) => layer.role === 'CHARACTER') ?? [];
    if (!artwork) {
      return image.uri === 'asset://branding/main-bg-01.png'
        && backgrounds.length === 1 && backgrounds[0]?.uri === image.uri
        && characters.length === 0 && !image.compositeUri
        ? [] : [{ field: 'background', message: 'Unillustrated story requires the neutral background without a character' }];
    }
    const issues: ImageCompatibilityIssue[] = [];
    if (image.uri !== artwork.backgroundUri || backgrounds.length !== 1 || backgrounds[0]?.uri !== artwork.backgroundUri || image.compositeUri) {
      issues.push({ field: 'background', message: `Story ${core.storyId} requires its own background` });
    }
    if (artwork.characterUri) {
      if (characters.length !== 1 || characters[0]?.uri !== artwork.characterUri) {
        issues.push({ field: 'character', message: `Story ${core.storyId} requires its own character` });
      }
    } else if (characters.length !== 0) {
      issues.push({ field: 'character', message: `Story ${core.storyId} uses a complete single-layer scene` });
    }
    return issues;
  }
  const issues: ImageCompatibilityIssue[] = [];
  const expansion = findHistoricalSettingExpansion(core.locationId);
  const expected = expansion ? [...expansion.imageAssetKeys, ...(expansion.additionalImageAssetKeys ?? [])] : [];
  const background = image.layers?.find((layer) => layer.role === 'BACKGROUND')?.uri ?? image.uri;
  const expectedUri = `asset://${core.libraryImage.key}`;
  if (!historicalLocations.some((location) => location.id === core.locationId)) issues.push({ field: 'background', message: `Unknown historical location: ${core.locationId}` });
  if (!expected.includes(core.libraryImage.key as never) || background !== expectedUri) issues.push({ field: 'background', message: `Background ${background} is not the selected setting asset ${expectedUri}` });
  if (!image.layers?.some((layer) => layer.role === 'CHARACTER')) issues.push({ field: 'character', message: 'Result image has no character layer' });
  if (image.layers?.some((layer) => layer.role === 'CHARACTER' && !layer.uri.startsWith('asset://characters/'))) issues.push({ field: 'character', message: 'Character layer is not a catalog character asset' });
  if (image.layers && image.layers.filter((layer) => layer.role === 'BACKGROUND').length !== 1) issues.push({ field: 'layers', message: 'Result image must contain exactly one background layer' });
  return issues;
}
