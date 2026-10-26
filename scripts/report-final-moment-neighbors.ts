/** Advisory phrase-overlap report for editorial comparison. It never approves a story. */
import { readFileSync } from 'node:fs';
import { storyFinalMoments } from '@pastlife/content';

const [candidateId, draftPath] = process.argv.slice(2);
if (!candidateId) {
  throw new Error('Usage: node scripts/tsx-cli.mjs scripts/report-final-moment-neighbors.ts STORY_ID [draft.txt]');
}

function fragments(text: string): Set<string> {
  const result = new Set<string>();
  for (const word of text.match(/[가-힣]{2,}/g) ?? []) {
    for (let i = 0; i < word.length - 1; i += 1) result.add(word.slice(i, i + 2));
  }
  return result;
}

const entries = storyFinalMoments.map((moment) => ({ id: moment.storyId, tokens: fragments(moment.scene) }));
const documentFrequency = new Map<string, number>();
for (const entry of entries) {
  for (const token of entry.tokens) documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
}

function weight(token: string): number {
  const count = documentFrequency.get(token) ?? 0;
  return count > entries.length / 3 ? 0 : Math.log(2 + entries.length / (1 + count));
}

function score(a: Set<string>, b: Set<string>): number {
  const union = new Set([...a, ...b]);
  let shared = 0;
  let total = 0;
  for (const token of union) {
    const tokenWeight = weight(token);
    total += tokenWeight;
    if (a.has(token) && b.has(token)) shared += tokenWeight;
  }
  return total ? shared / total : 0;
}

if (candidateId === 'ALL') {
  const pairs: { first: string; second: string; value: number }[] = [];
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      pairs.push({ first: entries[i].id, second: entries[j].id, value: score(entries[i].tokens, entries[j].tokens) });
    }
  }
  console.log('Advisory highest lexical overlap pairs; inspect full scenes and art to decide.');
  for (const pair of pairs.sort((a, b) => b.value - a.value).slice(0, 20)) {
    console.log(`${pair.value.toFixed(3)}  ${pair.first}  ${pair.second}`);
  }
} else {
  const registered = storyFinalMoments.find((moment) => moment.storyId === candidateId);
  const candidateText = draftPath ? readFileSync(draftPath, 'utf8') : registered?.scene;
  if (!candidateText) throw new Error(`No registered scene for ${candidateId}; provide a draft.txt path`);
  const candidateTokens = fragments(candidateText);
  const ranked = entries
    .filter((entry) => entry.id !== candidateId)
    .map((entry) => ({ id: entry.id, value: score(candidateTokens, entry.tokens) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  console.log(`Advisory lexical neighbors for ${candidateId}; read the actual scenes and art before deciding.`);
  for (const item of ranked) console.log(`${item.value.toFixed(3)}  ${item.id}`);
}
