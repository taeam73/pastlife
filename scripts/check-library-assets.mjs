import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const expansions = readFileSync(resolve('packages/content/src/historical/expansions.ts'), 'utf8');
const slugs = [...readFileSync(resolve('packages/content/src/historical/settings.ts'), 'utf8').matchAll(/fallbackAssetKey: 'library\/v3\/([^'.]+)\.(?:jpg|webp)'/g)].map((match) => match[1]);
const keys = slugs.flatMap((slug) => [
  `${slug}-daily.webp`,
  `${slug}-work.png`,
  `${slug}-turning.png`,
]);
const missing = keys.filter((key) => !existsSync(resolve('apps/mobile/assets/library/v4', key)));
if (!expansions.includes('imageAssetKeys')) throw new Error('Historical image expansion catalog is missing');
if (keys.length !== 48) throw new Error(`Expected 48 fallback asset keys, received ${keys.length}`);
if (missing.length > 0) throw new Error(`Missing fallback assets: ${missing.join(', ')}`);
console.info(`Verified ${keys.length} historical fallback image slots across ${slugs.length} settings`);
