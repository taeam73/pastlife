import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import { remoteAssetSource } from './assetUrl';

const pending = new Map<string, Promise<File>>();

function artworkUrl(uri: string): string {
  const url = uri.startsWith('asset://') ? remoteAssetSource(uri)?.uri : uri;
  if (!url || !/^https:\/\//u.test(url)) throw new Error(`Story artwork URL is unavailable: ${uri}`);
  return url;
}

function imageExtension(url: string): string {
  const extension = new URL(url).pathname.match(/\.(jpe?g|png|webp)$/iu)?.[1]?.toLowerCase();
  return extension === 'jpeg' ? 'jpg' : extension ?? 'img';
}

async function validImage(file: File): Promise<boolean> {
  if (!file.exists || (file.size ?? 0) < 128) return false;
  try {
    const bytes = await file.bytes();
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9;
    }
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      const end = bytes.length - 12;
      return bytes[end] === 0 && bytes[end + 1] === 0 && bytes[end + 2] === 0 && bytes[end + 3] === 0
        && bytes[end + 4] === 0x49 && bytes[end + 5] === 0x45 && bytes[end + 6] === 0x4e && bytes[end + 7] === 0x44;
    }
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
      && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      const declaredSize = (bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24) >>> 0;
      return declaredSize + 8 === bytes.length;
    }
    return false;
  } catch {
    return false;
  }
}

async function cacheFile(url: string): Promise<File> {
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, url);
  const target = new File(Paths.cache, `pastlife-art-${hash}.${imageExtension(url)}`);
  if (await validImage(target)) return target;
  if (target.exists) target.delete();
  try {
    await File.downloadFileAsync(url, target);
    if (!await validImage(target)) throw new Error(`Story artwork is incomplete: ${url}`);
    return target;
  } catch (error) {
    if (target.exists) target.delete();
    throw error;
  }
}

/** Screen images and PDF export resolve to the same device file. Cache eviction is safe: missing files are fetched again. */
export function ensureStoryArtworkFile(uri: string): Promise<File> {
  const url = artworkUrl(uri);
  const existing = pending.get(url);
  if (existing) return existing;
  const task = cacheFile(url).finally(() => pending.delete(url));
  pending.set(url, task);
  return task;
}

export async function discardStoryArtworkFile(uri: string): Promise<void> {
  const url = artworkUrl(uri);
  await pending.get(url)?.catch(() => undefined);
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, url);
  const file = new File(Paths.cache, `pastlife-art-${hash}.${imageExtension(url)}`);
  if (file.exists) file.delete();
}
