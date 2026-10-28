import { readFile, writeFile } from 'node:fs/promises';
import { storyCards, findEnglishStoryTranslation, findThaiStoryTranslation, findJapaneseStoryTranslation } from '../packages/content/src/index.ts';

type Locale = 'ko' | 'en' | 'th' | 'ja';
type Intro = { summary: string; hook: string };
type Entry = Record<Locale, Intro>;
const target = new URL('../apps/api/src/results/story-intros.json', import.meta.url);
async function main() {
const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error('OPENAI_API_KEY is unavailable');
let saved: Record<string, Entry> = {};
try { saved = JSON.parse(await readFile(target, 'utf8')) as Record<string, Entry>; } catch { /* First run. */ }

const sources = storyCards.map((card) => {
  const localized = { en: findEnglishStoryTranslation(card.id)?.card, th: findThaiStoryTranslation(card.id)?.card, ja: findJapaneseStoryTranslation(card.id)?.card };
  if (Object.values(localized).some((value) => !value)) throw new Error(`Missing translation: ${card.id}`);
  const pick = (value: typeof card) => ({ name: value.name, identityLine: value.identityLine, opening: value.opening, turn: value.turn });
  return { id: card.id, ko: pick(card), en: pick(localized.en!), th: pick(localized.th!), ja: pick(localized.ja!) };
});

for (let start = 0; start < sources.length; start += 6) {
  const batch = sources.slice(start, start + 6).filter((source) => !saved[source.id]);
  if (!batch.length) continue;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-5.6-sol', reasoning: { effort: 'none' }, store: false,
          instructions: `You are writing the first on-screen teaser page of an imaginative past-life reading app. Return a JSON object keyed by story id. Each id has ko,en,th,ja objects, each with summary and hook strings. Use the supplied language-specific facts. In every language, the archive addresses the reader directly in second person throughout: Korean 당신, English you, Thai คุณ, Japanese あなた. Never switch to he/she/third-person for the protagonist. summary: one concise sentence identifying who the reader was and what they did. hook: one concise sentence about an unresolved choice or surprising encounter; do not reveal the choice or ending. Do not invent facts. Natural, literary, calm, inviting language; no diagnosis, reincarnation certainty, or history claim. Do not include a call to swipe; app adds that separately. Each string should fit a 320px phone page: Korean/Japanese max 85 characters, English max 190 characters, Thai max 180 characters. Return only JSON.`,
          input: `Return the JSON object for these stories:\n${JSON.stringify(batch)}`, text: { format: { type: 'json_object' } }, max_output_tokens: 9500,
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}: ${(await response.text()).slice(0, 200)}`);
      const result = await response.json() as { output?: { content?: { type: string; text?: string }[] }[]; usage?: { input_tokens?: number; output_tokens?: number } };
      const body = result.output?.flatMap((entry) => entry.content?.filter((part) => part.type === 'output_text').map((part) => part.text ?? '') ?? []).join('') ?? '';
      const generated = JSON.parse(body) as Record<string, Entry>;
      for (const source of batch) {
        const entry = generated[source.id];
        if (!entry || !(['ko', 'en', 'th', 'ja'] as const).every((locale) => entry[locale]?.summary?.trim() && entry[locale]?.hook?.trim())) throw new Error(`Incomplete intro: ${source.id}`);
        saved[source.id] = entry;
      }
      await writeFile(target, `${JSON.stringify(saved, null, 2)}\n`);
      process.stdout.write(`Saved ${Object.keys(saved).length}/${sources.length} intros (${result.usage?.input_tokens ?? 0} input, ${result.usage?.output_tokens ?? 0} output tokens)\n`);
      break;
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
}
}

void main().catch((error: unknown) => { process.stderr.write(`${String(error)}\n`); process.exitCode = 1; });
