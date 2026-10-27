import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { storyQuestions } from '../packages/content/src/story-questions.js';
import { english } from '../apps/mobile/src/i18n/en.js';

async function main() {
  const destination = resolve('output/localization-source');
  await mkdir(destination, { recursive: true });
  const source = {
    ui: Object.keys(english),
    questions: Object.fromEntries(storyQuestions.map(({ id, text, choices }) => [id, [text, ...choices.map((choice) => choice.text)]])),
  };
  await writeFile(resolve(destination, 'ko.json'), `${JSON.stringify(source, null, 2)}\n`, 'utf8');
  process.stdout.write(`Exported ${source.ui.length} UI keys and ${Object.keys(source.questions).length} questions\n`);
}

void main().catch((error: unknown) => { process.stderr.write(`${error}\n`); process.exitCode = 1; });
