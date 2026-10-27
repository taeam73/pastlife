import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceDir = resolve('output/english-source');
const locale = option('locale', 'en');
if (!['en', 'th', 'ja'].includes(locale)) throw new Error(`Unsupported translation locale: ${locale}`);
const outputDir = resolve(`output/${({ en: 'english', th: 'thai', ja: 'japanese' })[locale]}-translations`);
const modelPrices = {
  'gpt-5.6-sol': { input: 4, output: 20 },
  'gpt-5.6-terra': { input: 2, output: 12 },
  'gpt-5.6-luna': { input: 0.2, output: 1.2 },
};
const model = option('model', 'gpt-5.6-sol');
const price = modelPrices[model];
if (!price) throw new Error(`Unsupported translation model: ${model}`);
const cardFields = ['name', 'home', 'identityLine', 'title', 'role', 'world', 'flavor', 'opening', 'life', 'turn', 'decision', 'cost', 'after', 'presentEcho', 'secondLook', 'unresolved', 'readerQuestion', 'signalMoments', 'setting'];
const identityFields = ['era', 'region', 'gender', 'birthYear', 'deathYear', 'summary', 'profilePages'];
const finalFields = ['year', 'place', 'protagonist', 'scene', 'afterword', 'artAlt'];

function option(name, fallback) {
  const at = process.argv.indexOf(`--${name}`);
  return at < 0 ? fallback : process.argv[at + 1];
}

function pick(object, keys) {
  return Object.fromEntries(keys.filter((key) => key in object).map((key) => [key, object[key]]));
}

function sourceTextFields(source) {
  return {
    card: pick(source.card, cardFields),
    manuscript: {
      identity: pick(source.manuscript.identity, identityFields),
      episode: source.manuscript.episode,
      timeline: source.manuscript.timeline,
      memories: source.manuscript.memories,
    },
    finalMoment: pick(source.finalMoment, finalFields),
  };
}

function checkShape(source, translated, path = 'translation') {
  if (typeof source === 'string') {
    if (typeof translated !== 'string' || !translated.trim()) throw new Error(`${path}: empty or non-text translation`);
    if (/[\uac00-\ud7a3]/u.test(translated)) throw new Error(`${path}: Korean text remains`);
    return;
  }
  if (source === null || typeof source === 'number' || typeof source === 'boolean') {
    if (translated !== source) throw new Error(`${path}: source value changed`);
    return;
  }
  if (Array.isArray(source)) {
    if (!Array.isArray(translated) || translated.length !== source.length) throw new Error(`${path}: entry count changed`);
    source.forEach((value, index) => checkShape(value, translated[index], `${path}[${index}]`));
    return;
  }
  if (typeof translated !== 'object' || translated === null || Array.isArray(translated)) throw new Error(`${path}: expected object`);
  const sourceKeys = Object.keys(source).sort();
  const targetKeys = Object.keys(translated).sort();
  if (JSON.stringify(sourceKeys) !== JSON.stringify(targetKeys)) throw new Error(`${path}: field names changed`);
  for (const key of sourceKeys) checkShape(source[key], translated[key], `${path}.${key}`);
}

function checkFacts(source, translated) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  function numberPreserved(original, english, digit) {
    if (english.includes(digit)) return true;
    const month = months[Number(digit) - 1];
    const thaiMonth = thaiMonths[Number(digit) - 1];
    return Boolean(original.includes(`${digit}월`) && ((month && english.toLowerCase().includes(month.toLowerCase())) || (thaiMonth && english.includes(thaiMonth))));
  }
  for (const key of ['birthYear', 'deathYear']) {
    const original = source.manuscript.identity[key];
    const english = translated.manuscript.identity[key];
    const digits = original.match(/\d+/g) ?? [];
    if (digits.some((digit) => !numberPreserved(original, english, digit))) throw new Error(`identity.${key}: year digits changed`);
  }
  for (const [index, item] of source.manuscript.timeline.entries()) {
    const digits = item.when.match(/\d+/g) ?? [];
    if (digits.some((digit) => !numberPreserved(item.when, translated.manuscript.timeline[index].when, digit))) throw new Error(`timeline[${index}].when: digits changed`);
  }
  const finalDigits = source.finalMoment.year.match(/\d+/g) ?? [];
  if (finalDigits.some((digit) => !numberPreserved(source.finalMoment.year, translated.finalMoment.year, digit))) throw new Error('finalMoment.year: digits changed');
  for (const path of ['beforeSignal', 'afterSignal']) {
    const original = source.manuscript.episode[path];
    const english = translated.manuscript.episode[path];
    if (original.split(/\n\s*\n/u).length !== english.split(/\n\s*\n/u).length) throw new Error(`episode.${path}: paragraph count changed`);
  }
  if (source.finalMoment.scene.split(/\n\s*\n/u).length !== translated.finalMoment.scene.split(/\n\s*\n/u).length) throw new Error('finalMoment.scene: paragraph count changed');
}

function responseText(response) {
  const pieces = (response.output ?? []).flatMap((entry) => (entry.content ?? []).filter((part) => part.type === 'output_text').map((part) => part.text));
  if (!pieces.length) throw new Error(`API response has no text (status=${response.status ?? 'unknown'})`);
  return pieces.join('');
}

function restoreMisnestedSections(translation) {
  // Some long JSON responses put these complete sibling objects one level too deep.
  // Move only the known sections, then run the exact-shape and fact checks below.
  if (!translation.finalMoment && translation.manuscript?.finalMoment) {
    translation.finalMoment = translation.manuscript.finalMoment;
    delete translation.manuscript.finalMoment;
  }
  for (const section of ['timeline', 'memories']) {
    if (!translation.manuscript?.[section] && translation.manuscript?.episode?.[section]) {
      translation.manuscript[section] = translation.manuscript.episode[section];
      delete translation.manuscript.episode[section];
    }
  }
  return translation;
}

async function translate(id, source, key) {
  const texts = sourceTextFields(source);
  const language = ({ en: 'English', th: 'Thai', ja: 'Japanese' })[locale];
  const prompt = `Translate the following Korean story into publication-ready ${language} for a narrative app read by teenagers. The root object MUST contain all three keys: card, manuscript, and finalMoment; do not stop after card or move card.setting to the root. Return ONLY a JSON object with exactly the same keys, arrays, and item counts as the input. Translate EVERY string; preserve paragraph breaks (blank-line separated paragraph counts), dialogue speakers, all events, relationships, ages, dates, place names, and three independent signal paths. Preserve Arabic numeric digits in year/age fields and all numbers, including fictional calendar years. Do not summarize, add plot, or omit details. Use natural, concrete ${language} with consistent spellings of each name across the entire story. The story is imaginative entertainment, not a literal past-life claim. Retain the narrator's opening and closing. Keep every profile-page line and timeline/memory item. The source JSON follows:\n${JSON.stringify(texts)}`;
  const request = {
    model,
    instructions: `You are a careful literary translator from Korean to ${language}. Return valid JSON only. Preserve the exact JSON structure, line breaks, story facts, and signal-specific differences.`,
    input: prompt,
    reasoning: { effort: 'none' },
    text: { format: { type: 'json_object' } },
    max_output_tokens: 16000,
    store: false,
  };
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const result = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!result.ok) {
      const error = await result.json().catch(() => ({}));
      const code = error.error?.code ?? 'unknown';
      if ((result.status === 429 && code !== 'credit_balance_exhausted') || result.status >= 500) {
        if (attempt < 6) {
          const retryAfter = Number(result.headers.get('retry-after'));
          const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 60000)
            : Math.min(10000 * 2 ** attempt, 60000);
          process.stdout.write(`Temporary API limit for ${id}; retrying in ${Math.ceil(backoffMs / 1000)}s\n`);
          await new Promise((done) => setTimeout(done, backoffMs));
          continue;
        }
      }
      throw new Error(`API status=${result.status}, code=${code}`);
    }
    const response = await result.json();
    const translation = restoreMisnestedSections(JSON.parse(responseText(response)));
    const usage = response.usage ?? {};
    try {
      checkShape(texts, translation);
      checkFacts(source, translation);
    } catch (error) {
      const failedDir = resolve(outputDir, 'failed');
      await mkdir(failedDir, { recursive: true });
      await writeJsonAtomic(resolve(failedDir, `${id}.json`), {
        storyId: id,
        locale,
        sourceSha256: createHash('sha256').update(JSON.stringify(source)).digest('hex'),
        model,
        translation,
        usage: { inputTokens: usage.input_tokens ?? 0, outputTokens: usage.output_tokens ?? 0 },
        validationError: error instanceof Error ? error.message : String(error),
      });
      if (attempt < 2) {
        process.stdout.write(`Invalid translation structure for ${id}; retrying (${attempt + 1}/2)\n`);
        continue;
      }
      throw error;
    }
    return {
      translation,
      usage: { inputTokens: usage.input_tokens ?? 0, outputTokens: usage.output_tokens ?? 0 },
    };
  }
  throw new Error('API retry limit reached');
}

async function writeJsonAtomic(path, value) {
  const temp = `${path}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temp, path);
}

async function main() {
  const maxStories = Number(option('max-stories', '2'));
  const maxUsd = Number(option('max-usd', '1'));
  const only = option('only', '');
  const skip = new Set(option('skip', '').split(',').filter(Boolean));
  const includeClown = process.argv.includes('--include-clown');
  const shardIndex = Number(option('shard-index', '0'));
  const shardCount = Number(option('shard-count', '1'));
  if (!Number.isInteger(maxStories) || maxStories < 1 || !Number.isFinite(maxUsd) || maxUsd <= 0 || !Number.isInteger(shardIndex) || !Number.isInteger(shardCount) || shardCount < 1 || shardIndex < 0 || shardIndex >= shardCount) throw new Error('Invalid batch options');
  const key = process.env.OPENAI_API_KEY;
  if (!key || !/^sk-\S{20,}$/u.test(key)) throw new Error('OPENAI_API_KEY is unavailable or malformed');
  const manifest = JSON.parse(await readFile(resolve(sourceDir, 'manifest.json'), 'utf8'));
  if (manifest.totalStories !== manifest.stories.length) throw new Error('Source manifest count mismatch');
  await mkdir(outputDir, { recursive: true });
  let spent = 0;
  let completed = 0;
  for (const [index, entry] of manifest.stories.entries()) {
    if (index % shardCount !== shardIndex) continue;
    if (only && entry.id !== only) continue;
    if (skip.has(entry.id)) continue;
    if (entry.id === 'CLOWN' && !includeClown) continue; // Existing manually translated pilot.
    const snapshot = JSON.parse(await readFile(resolve(sourceDir, `${entry.id}.json`), 'utf8'));
    const actualHash = createHash('sha256').update(JSON.stringify(snapshot.source)).digest('hex');
    if (actualHash !== entry.sourceSha256 || snapshot.sourceSha256 !== actualHash) throw new Error(`${entry.id}: source hash changed; re-export and review before continuing`);
    const target = resolve(outputDir, `${entry.id}.json`);
    let existing;
    try { existing = JSON.parse(await readFile(target, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (existing) {
      if (existing.sourceSha256 !== actualHash) throw new Error(`${entry.id}: saved translation is stale`);
      checkShape(sourceTextFields(snapshot.source), existing.translation);
      checkFacts(snapshot.source, existing.translation);
      continue;
    }
    if (completed >= maxStories || spent >= maxUsd) break;
    process.stdout.write(`Translating ${entry.id}...\n`);
    const { translation, usage } = await translate(entry.id, snapshot.source, key);
    const costUsd = (usage.inputTokens * price.input + usage.outputTokens * price.output) / 1_000_000;
    await writeJsonAtomic(target, { storyId: entry.id, locale, sourceSha256: actualHash, model, translation, usage: { ...usage, estimatedCostUsd: costUsd }, reviewStatus: 'draft' });
    spent += costUsd;
    completed += 1;
    process.stdout.write(`Saved ${entry.id}; input=${usage.inputTokens}, output=${usage.outputTokens}, estimated_cost_usd=${costUsd.toFixed(4)}\n`);
  }
  process.stdout.write(`This run: ${completed} stories, estimated_cost_usd=${spent.toFixed(4)}. Outputs are drafts pending source review.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
