import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = JSON.parse(await readFile(resolve('output/localization-source/ko.json'), 'utf8'));
const destination = resolve('output/japanese-translations');
const key = process.env.OPENAI_API_KEY;
if (!key || !/^sk-\S{20,}$/u.test(key)) throw new Error('OPENAI_API_KEY is unavailable or malformed');
await mkdir(destination, { recursive: true });

async function translate(section, content) {
  const target = resolve(destination, `${section}.json`);
  try {
    const saved = JSON.parse(await readFile(target, 'utf8'));
    validate(section, content, saved.translation);
    process.stdout.write(`Using saved ${section} translation\n`);
    return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-5.6-sol', reasoning: { effort: 'none' }, store: false,
      instructions: 'Translate Korean app user interface and interactive story questions into natural Japanese. Preserve the exact JSON structure and all keys, IDs, array lengths, newline characters, Google brand name, and meaning of each option. Return only valid JSON.',
      input: `Translate every user-visible string to Japanese and return a JSON object. This is an imaginative narrative app; questions should sound natural and choices must retain distinct actions. Do not translate object keys, only values. Source ${section}:\n${JSON.stringify(content)}`,
      text: { format: { type: 'json_object' } }, max_output_tokens: 14000,
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`API status=${response.status}, code=${body.error?.code ?? 'unknown'}, message=${String(body.error?.message ?? '').slice(0, 300)}`);
  }
  const result = await response.json();
  const output = (result.output ?? []).flatMap((entry) => (entry.content ?? []).filter((part) => part.type === 'output_text').map((part) => part.text)).join('');
  const translation = JSON.parse(output);
  validate(section, content, translation);
  const usage = { inputTokens: result.usage?.input_tokens ?? 0, outputTokens: result.usage?.output_tokens ?? 0 };
  const estimatedCostUsd = (usage.inputTokens * 4 + usage.outputTokens * 20) / 1_000_000;
  await writeFile(target, `${JSON.stringify({ locale: 'ja', model: 'gpt-5.6-sol', section, translation, usage: { ...usage, estimatedCostUsd }, reviewStatus: 'draft' }, null, 2)}\n`);
  process.stdout.write(`Saved ${section}: ${usage.inputTokens} input, ${usage.outputTokens} output, $${estimatedCostUsd.toFixed(4)} estimated\n`);
}

function validate(section, input, output) {
  if (section === 'ui') {
    if (!output || typeof output !== 'object' || Array.isArray(output)) throw new Error('UI translation must be an object');
    if (Object.keys(output).length !== Object.keys(input).length) throw new Error('UI key count differs');
    for (const key of Object.keys(input)) if (!Object.hasOwn(output, key) || typeof output[key] !== 'string' || !output[key].trim() || /[가-힣]/u.test(output[key])) throw new Error(`Missing Japanese UI value: ${key}`);
    return;
  }
  if (JSON.stringify(Object.keys(output).sort()) !== JSON.stringify(Object.keys(input).sort())) throw new Error('Question IDs changed');
  for (const [id, lines] of Object.entries(input)) {
    if (!Array.isArray(output[id]) || output[id].length !== lines.length || output[id].some((line) => typeof line !== 'string' || !line.trim() || /[가-힣]/u.test(line))) throw new Error(`Invalid Japanese question: ${id}`);
  }
}

await translate('ui', Object.fromEntries(source.ui.map((key) => [key, key])));
await translate('questions', source.questions);
const ui = JSON.parse(await readFile(resolve(destination, 'ui.json'), 'utf8')).translation;
const questions = JSON.parse(await readFile(resolve(destination, 'questions.json'), 'utf8')).translation;
ui['일본어'] = '日本語';
await writeFile(resolve('apps/mobile/src/i18n/ja.json'), `${JSON.stringify(ui, null, 2)}\n`);
await writeFile(resolve('packages/content/src/translations/ja/questions.json'), `${JSON.stringify(questions, null, 2)}\n`);
process.stdout.write(`Packaged ${Object.keys(ui).length} UI strings and ${Object.keys(questions).length} questions\n`);
