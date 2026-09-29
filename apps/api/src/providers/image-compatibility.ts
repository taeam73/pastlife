import { findHistoricalSettingExpansion, historicalLocations } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { ImageAsset } from './image.provider.js';

export type ImageCompatibilityIssue = { field: 'background' | 'character' | 'layers'; message: string };

export function inspectImageCompatibility(core: ResultCore, image: ImageAsset): ImageCompatibilityIssue[] {
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
