import { selectQuestion, storyManuscripts } from '@pastlife/content';
import { calculateResult } from '../packages/scoring/src/result.js';

const ages = new Map(storyManuscripts.map((story) => [story.id, story.identity.ageAtDeath]));
const counts = new Map<string, number>();
const ageBands = new Map<string, number>();
const routeCount = 4096;

function answersFor(seed: string, offset: number) {
  return ([1, 2, 3, 4, 5, 6] as const).map((stage) => {
    const question = selectQuestion({ stage, sessionSeed: seed, contentVersion: '3.0.0', excludedQuestionIds: [] });
    return { stage, questionId: question.id, choiceId: question.choices[(stage + Math.floor(offset / 6 ** (stage - 1))) % 6]!.id };
  });
}

function ageBand(age: number | null): string {
  if (age === null) return '비인간·미설정';
  if (age < 20) return '20세 미만';
  if (age < 40) return '20~39세';
  if (age < 60) return '40~59세';
  if (age < 80) return '60~79세';
  return '80세 이상';
}

for (let index = 0; index < routeCount; index += 1) {
  const seed = `reader-${index}`;
  const id = calculateResult({ answers: answersFor(seed, index), contentVersion: '3.0.0' }).storyId;
  if (!id || !ages.has(id)) throw new Error(`Missing story or age for route ${index}: ${id}`);
  counts.set(id, (counts.get(id) ?? 0) + 1);
  const band = ageBand(ages.get(id)!);
  ageBands.set(band, (ageBands.get(band) ?? 0) + 1);
}

console.log(`Current 3.0 selection: ${routeCount} deterministic answer routes; ${counts.size} distinct stories`);
for (const band of ['20세 미만', '20~39세', '40~59세', '60~79세', '80세 이상', '비인간·미설정']) {
  const count = ageBands.get(band) ?? 0;
  console.log(`${band}: ${count} (${(count / routeCount * 100).toFixed(1)}%)`);
}
console.log('Most frequent story IDs:');
for (const [id, count] of [...counts].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`${id}: ${count} (${ageBand(ages.get(id)!)})`);
}
