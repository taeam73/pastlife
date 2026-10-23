import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const mobile = readFileSync(resolve('apps/mobile/src/results/libraryImages.ts'), 'utf8');
const api = readFileSync(resolve('apps/api/src/providers/library-image.provider.ts'), 'utf8');
const entries = mobile.split(/\r?\n/u).flatMap((line) => {
  const match = line.match(/^\s*'(asset:\/\/[^']+)': require\('([^']+)'\),?\s*$/u);
  return match ? [{ uri: match[1], relativeFile: match[2] }] : [];
});
const storyUri = /^asset:\/\/stories\/v3\/[a-z0-9-]+\.(?:jpg|webp)$/u;
const fallbackUri = 'asset://branding/main-bg-01.png';
const unexpected = entries.filter(({ uri }) => !storyUri.test(uri) && uri !== fallbackUri);
if (unexpected.length > 0) throw new Error(`Non-3.0 images are bundled: ${unexpected.map(({ uri }) => uri).join(', ')}`);
if (entries.filter(({ uri }) => uri === fallbackUri).length !== 1) throw new Error('The story fallback background must be registered once');

const mobileStories = entries.filter(({ uri }) => storyUri.test(uri)).map(({ uri }) => uri);
const apiStories = [...api.matchAll(/asset:\/\/stories\/v3\/[a-z0-9-]+\.(?:jpg|webp)/gu)].map(([uri]) => uri);
if (mobileStories.length === 0 || mobileStories.length % 2 !== 0) throw new Error('Story images must form background/portrait pairs');
if (new Set(mobileStories).size !== mobileStories.length || new Set(apiStories).size !== apiStories.length) {
  throw new Error('Duplicate story image URI in mobile or API registry');
}
const missingOnMobile = apiStories.filter((uri) => !mobileStories.includes(uri));
const missingOnApi = mobileStories.filter((uri) => !apiStories.includes(uri));
if (missingOnMobile.length || missingOnApi.length) {
  throw new Error(`Story image registry mismatch: mobile missing ${missingOnMobile.join(', ') || 'none'}; API missing ${missingOnApi.join(', ') || 'none'}`);
}
const backgrounds = mobileStories.filter((uri) => uri.endsWith('.jpg'));
const portraits = mobileStories.filter((uri) => uri.endsWith('.webp'));
if (backgrounds.length !== portraits.length) throw new Error('Story background and portrait counts differ');

let bytes = 0;
for (const { uri, relativeFile } of entries) {
  const file = resolve('apps/mobile/src/results', relativeFile);
  if (!existsSync(file)) throw new Error(`Registered ${uri} has no file at ${file}`);
  bytes += statSync(file).size;
}
console.info(`3.0 mobile image registry: ${backgrounds.length} story pairs + 1 fallback, ${entries.length} reachable assets, ${(bytes / 1024 / 1024).toFixed(2)} MiB source bytes`);
