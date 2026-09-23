import { inflateSync } from 'node:zlib';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const assetDirectory = resolve('apps/mobile/assets/characters/v2');
const mobileRegistry = readFileSync(resolve('apps/mobile/src/results/libraryImages.ts'), 'utf8');
const apiSelector = readFileSync(resolve('apps/api/src/providers/library-image.provider.ts'), 'utf8');
const files = readdirSync(assetDirectory).filter((name) => name.endsWith('.png'));

if (files.length === 0) throw new Error('No v2 character assets found');

function inspectPng(path) {
  const data = readFileSync(path);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!data.subarray(0, 8).equals(signature)) throw new Error(`${basename(path)} is not a PNG`);

  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  const idat = [];
  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString('ascii', offset + 4, offset + 8);
    const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      bitDepth = chunk[8];
      colorType = chunk[9];
    } else if (type === 'IDAT') idat.push(chunk);
    offset += length + 12;
  }

  if (width !== 1024 || height !== 1536) throw new Error(`${basename(path)} must be 1024x1536, received ${width}x${height}`);
  if (bitDepth !== 8 || colorType !== 6) throw new Error(`${basename(path)} must be an 8-bit RGBA PNG with a real alpha channel`);

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const raw = inflateSync(Buffer.concat(idat));
  let previous = Buffer.alloc(stride);
  let cursor = 0;
  let transparent = 0;
  let opaque = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor];
    cursor += 1;
    const row = Buffer.from(raw.subarray(cursor, cursor + stride));
    cursor += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const up = previous[x];
      const upperLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
      if (filter === 1) row[x] = (row[x] + left) & 255;
      else if (filter === 2) row[x] = (row[x] + up) & 255;
      else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const p = left + up - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upperLeft);
        row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft)) & 255;
      } else if (filter !== 0) throw new Error(`${basename(path)} uses unsupported PNG filter ${filter}`);
    }
    for (let x = 3; x < stride; x += 4) {
      if (row[x] === 0) transparent += 1;
      if (row[x] >= 250) opaque += 1;
    }
    previous = row;
  }
  const pixels = width * height;
  if (transparent / pixels < 0.1) throw new Error(`${basename(path)} does not contain enough genuinely transparent background pixels`);
  if (opaque / pixels < 0.1) throw new Error(`${basename(path)} does not contain enough visible character pixels`);
}

for (const file of files) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*-(?:male|female)\.png$/.test(file)) throw new Error(`Invalid v2 character filename: ${file}`);
  inspectPng(resolve(assetDirectory, file));
  const uri = `asset://characters/v2/${file}`;
  if (!mobileRegistry.includes(uri)) throw new Error(`${file} is missing from the mobile static image registry`);
  if (!apiSelector.includes(uri)) throw new Error(`${file} is missing from the API character selector`);
}

console.info(`Verified ${files.length} v2 upper-body character assets with real PNG transparency and complete mappings`);
