import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { storyCards, storyFinalMoments, storyManuscripts } from '../packages/content/src/index.js';

async function main() {
const manifest = JSON.parse(await readFile(resolve('output/english-source/manifest.json'), 'utf8')) as {
  totalStories: number;
  stories: { id: string; sourceSha256: string }[];
};
const manuscripts = new Map(storyManuscripts.map((item) => [item.id, item]));
const moments = new Map(storyFinalMoments.map((item) => [item.storyId, item]));
const hashes = new Map(manifest.stories.map((item) => [item.id, item.sourceSha256]));
if (storyCards.length !== manifest.totalStories || hashes.size !== storyCards.length) throw new Error('Story count differs from the frozen source');
for (const card of storyCards) {
  const manuscript = manuscripts.get(card.id);
  const finalMoment = moments.get(card.id);
  if (!manuscript || !finalMoment) throw new Error(`Missing live story section: ${card.id}`);
  const source = { storyId: card.id, card, manuscript, finalMoment };
  const currentHash = createHash('sha256').update(JSON.stringify(source)).digest('hex');
  if (currentHash !== hashes.get(card.id)) throw new Error(`Korean source changed since English export: ${card.id}`);
}
process.stdout.write(`Current Korean catalog matches all ${storyCards.length} frozen English source hashes.\n`);
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
