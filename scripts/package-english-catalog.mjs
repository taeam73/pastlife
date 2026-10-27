import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceDir = resolve('output/english-source');
const localeOption = process.argv.indexOf('--locale');
const locale = localeOption < 0 ? 'en' : process.argv[localeOption + 1];
if (!['en', 'th', 'ja'].includes(locale)) throw new Error(`Unsupported locale: ${locale}`);
const draftDir = resolve(`output/${{ en: 'english', th: 'thai', ja: 'japanese' }[locale]}-translations`);
const catalogPath = resolve(`packages/content/src/translations/${locale}/catalog.json`);
const allowPartial = process.argv.includes('--allow-partial');
const manifest = JSON.parse(await readFile(resolve(sourceDir, 'manifest.json'), 'utf8'));
const catalog = {};
const missing = [];

for (const entry of manifest.stories) {
  let draft;
  try { draft = JSON.parse(await readFile(resolve(draftDir, `${entry.id}.json`), 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') { missing.push(entry.id); continue; }
    throw error;
  }
  const sourceSnapshot = JSON.parse(await readFile(resolve(sourceDir, `${entry.id}.json`), 'utf8'));
  const actualHash = createHash('sha256').update(JSON.stringify(sourceSnapshot.source)).digest('hex');
  if (actualHash !== entry.sourceSha256 || actualHash !== draft.sourceSha256) throw new Error(`${entry.id}: source hash mismatch`);
  if (draft.storyId !== entry.id || draft.reviewStatus !== 'draft' || (draft.locale && draft.locale !== locale)) throw new Error(`${entry.id}: invalid draft metadata`);
  const signals = Object.keys(draft.translation?.manuscript?.episode?.signalMoments ?? {}).sort();
  if (JSON.stringify(signals) !== JSON.stringify([...entry.signals].sort())) throw new Error(`${entry.id}: missing signal path`);
  catalog[entry.id] = { sourceSha256: actualHash, model: draft.model, reviewStatus: draft.reviewStatus, translation: draft.translation };
}

if (missing.length && !allowPartial) throw new Error(`${missing.length} stories lack ${locale} drafts; pass --allow-partial only for development preview`);
await mkdir(resolve(`packages/content/src/translations/${locale}`), { recursive: true });
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
process.stdout.write(`Packaged ${Object.keys(catalog).length}/${manifest.totalStories} ${locale} draft stories; ${missing.length} missing. Production availability requires complete catalog coverage.\n`);
