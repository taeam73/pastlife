import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const provider = readFileSync(resolve('apps/api/src/providers/library-image.provider.ts'), 'utf8');
const mobileRegistry = readFileSync(resolve('apps/mobile/src/results/libraryImages.ts'), 'utf8');
const uris = [...new Set(provider.match(/asset:\/\/stories\/v3\/[a-z0-9-]+\.(?:jpg|webp)/g) ?? [])];

if (uris.length === 0 || uris.length % 2 !== 0) throw new Error('Story art registry must have background/character pairs');
if (uris.filter((uri) => uri.endsWith('.jpg')).length !== uris.filter((uri) => uri.endsWith('.webp')).length) {
  throw new Error('Each registered story needs one JPEG background and one WebP character');
}

function jpegSize(data, filename) {
  if (data.readUInt16BE(0) !== 0xffd8) throw new Error(`${filename} is not a JPEG`);
  let offset = 2;
  while (offset + 9 < data.length) {
    if (data[offset] !== 0xff) throw new Error(`${filename} has an invalid JPEG marker`);
    const marker = data[offset + 1];
    offset += 2;
    const length = data.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  throw new Error(`${filename} has no JPEG dimensions`);
}

function webpSizeAndAlpha(data, filename) {
  if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WEBP'
    || data.toString('ascii', 12, 16) !== 'VP8X') throw new Error(`${filename} must be extended WebP with alpha metadata`);
  const width = 1 + data.readUIntLE(24, 3);
  const height = 1 + data.readUIntLE(27, 3);
  if (!(data[20] & 0x10) || !data.includes(Buffer.from('ALPH'))) throw new Error(`${filename} has no alpha layer`);
  return { width, height };
}

for (const uri of uris) {
  if (!mobileRegistry.includes(uri)) throw new Error(`${uri} is missing from the mobile static asset registry`);
  const filename = uri.replace('asset://stories/v3/', '');
  const path = resolve('apps/mobile/assets/stories/v3', filename);
  const data = readFileSync(path);
  const bytes = statSync(path).size;
  if (bytes > 700_000) throw new Error(`${filename} is ${bytes} bytes; optimize it below 700KB without reducing native dimensions`);
  if (filename.endsWith('.jpg')) {
    const { width, height } = jpegSize(data, filename);
    if (width < 1024 || height < 1024 || width !== height) throw new Error(`${filename} must be a native square background of at least 1024px`);
  } else {
    const { width, height } = webpSizeAndAlpha(data, filename);
    if (width < 1024 || height < width) throw new Error(`${filename} must be a native portrait transparent character at least 1024px wide`);
  }
}

console.info(`Verified ${uris.length / 2} separate 1024px-class story background/character pairs with mobile mappings`);
