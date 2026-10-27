import type { ImageURISource } from 'react-native';

export function remoteAssetSource(
  assetUri: string,
  baseUrl = process.env.EXPO_PUBLIC_ASSET_BASE_URL,
): ImageURISource | undefined {
  const normalizedBase = baseUrl?.trim().replace(/\/+$/u, '');
  if (!normalizedBase || !/^https:\/\//u.test(normalizedBase) || !assetUri.startsWith('asset://')) return undefined;
  const relativePath = assetUri.slice('asset://'.length);
  if (!relativePath || relativePath.split('/').some((segment) => segment === '..')) return undefined;
  const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
  return { uri: `${normalizedBase}/assets/${encodedPath}` };
}
