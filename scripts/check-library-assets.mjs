import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const expansions = readFileSync(resolve('packages/content/src/historical/expansions.ts'), 'utf8');
const settingsSource = readFileSync(resolve('packages/content/src/historical/settings.ts'), 'utf8');
const slugs = [...settingsSource.matchAll(/fallbackAssetKey: 'library\/v3\/([^'.]+)\.(?:jpg|webp)'/g)].map((match) => match[1]);
const expandedKeys = slugs.flatMap((slug) => [
  `${slug}-daily.webp`,
  `${slug}-work.png`,
  `${slug}-turning.png`,
]);
const directKeys = [...settingsSource.matchAll(/fallbackAssetKey: '(library\/v5\/[^']+)'/g)].map((match) => match[1]);
const missingExpanded = expandedKeys.filter((key) => !existsSync(resolve('apps/mobile/assets/library/v4', key)));
const missingDirect = directKeys.filter((key) => !existsSync(resolve('apps/mobile/assets', key)));
const missing = [...missingExpanded, ...missingDirect];
const characterAssets = [
  'characters/v2/heian-artisan-male.png',
  'characters/v2/heian-artisan-female.png',
];
const missingCharacters = characterAssets.filter((key) => !existsSync(resolve('apps/mobile/assets', key)));
if (!expansions.includes('imageAssetKeys')) throw new Error('Historical image expansion catalog is missing');
if (expandedKeys.length !== 48) throw new Error(`Expected 48 expanded fallback asset keys, received ${expandedKeys.length}`);
if (missing.length > 0) throw new Error(`Missing fallback assets: ${missing.join(', ')}`);
if (missingCharacters.length > 0) throw new Error(`Missing character assets: ${missingCharacters.join(', ')}`);
console.info(`Verified ${expandedKeys.length + directKeys.length} historical fallback image assets across ${slugs.length + directKeys.length} settings`);
