import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { storyCards, storyFinalMoments, storyManuscripts } from '../packages/content/src/index.js';

async function main() {
  const destination = resolve('output/english-source');
  await mkdir(destination, { recursive: true });

  const manuscripts = new Map(storyManuscripts.map((manuscript) => [manuscript.id, manuscript]));
  const moments = new Map(storyFinalMoments.map((moment) => [moment.storyId, moment]));
  const manifest: { id: string; sourceSha256: string; sourceCharacters: number; signals: readonly string[] }[] = [];

  for (const card of storyCards) {
    const manuscript = manuscripts.get(card.id);
    const finalMoment = moments.get(card.id);
    if (!manuscript || !finalMoment) throw new Error(`Incomplete source story: ${card.id}`);
    for (const signal of card.signals) {
      if (!manuscript.episode.signalMoments[signal] || !card.signalMoments[signal]) {
        throw new Error(`Missing source signal: ${card.id}/${signal}`);
      }
    }
    const source = { storyId: card.id, card, manuscript, finalMoment };
    const sourceText = JSON.stringify(source);
    const sourceSha256 = createHash('sha256').update(sourceText).digest('hex');
    await writeFile(resolve(destination, `${card.id}.json`), `${JSON.stringify({ sourceSha256, source }, null, 2)}\n`, 'utf8');
    manifest.push({ id: card.id, sourceSha256, sourceCharacters: sourceText.length, signals: card.signals });
  }

  await writeFile(resolve(destination, 'manifest.json'), `${JSON.stringify({ totalStories: manifest.length, totalCharacters: manifest.reduce((sum, item) => sum + item.sourceCharacters, 0), stories: manifest }, null, 2)}\n`, 'utf8');
  process.stdout.write(`Exported ${manifest.length} stories to ${destination}\n`);
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
