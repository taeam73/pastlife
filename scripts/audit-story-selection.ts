import { createHash } from 'node:crypto';
import { selectQuestion, storyCards, type Stage } from '@pastlife/content';
import { calculateResult, hashText } from '../packages/scoring/src/index.js';

const stages: Stage[] = [1, 2, 3, 4, 5, 6];
const sampleCount = 4096;
const counts = new Map(storyCards.map((card) => [card.id, 0]));
const questionCounts = new Map<string, number>();
const questionPaths = new Map<string, number>();
const signalCounts = new Map<string, number>();
let rareCount = 0;
let changedAnswers = 0;
let changedStories = 0;
const positionResults = { first: new Map<string, number>(), last: new Map<string, number>() };

function answerSet(index: number) {
  // The API issues a 16-byte hex seed. Hashing the index makes this audit
  // deterministic while retaining the same seed shape and independent bits.
  const seed = createHash('sha256').update(`bias-audit-${index}`).digest('hex').slice(0, 32);
  const answers = stages.map((stage) => {
    const question = selectQuestion({ stage, sessionSeed: seed, contentVersion: '3.0.0', excludedQuestionIds: [] });
    const choiceIndex = Number.parseInt(hashText(`${seed}:choice:${stage}`).slice(0, 8), 16) % question.choices.length;
    const choice = question.choices[choiceIndex]!;
    questionCounts.set(question.id, (questionCounts.get(question.id) ?? 0) + 1);
    for (const signal of choice.storySignals ?? []) signalCounts.set(signal, (signalCounts.get(signal) ?? 0) + 1);
    return { stage, questionId: question.id, choiceId: choice.id };
  });
  return { seed, answers };
}

for (let index = 0; index < sampleCount; index += 1) {
  const { seed, answers } = answerSet(index);
  const path = answers.map((answer) => answer.questionId).join(',');
  questionPaths.set(path, (questionPaths.get(path) ?? 0) + 1);
  const result = calculateResult({ answers, contentVersion: '3.0.0' });
  const id = result.storyId!;
  counts.set(id, (counts.get(id) ?? 0) + 1);
  if (storyCards.find((card) => card.id === id)?.rare) rareCount += 1;

  for (const position of ['first', 'last'] as const) {
    const positioned = answers.map((answer) => {
      const question = selectQuestion({ stage: answer.stage, sessionSeed: seed, contentVersion: '3.0.0', excludedQuestionIds: [] });
      return { ...answer, choiceId: position === 'first' ? question.choices[0]!.id : question.choices.at(-1)!.id };
    });
    const selected = calculateResult({ answers: positioned, contentVersion: '3.0.0' }).storyId!;
    const bucket = positionResults[position];
    bucket.set(selected, (bucket.get(selected) ?? 0) + 1);
  }

  // A single changed answer should usually change the selected story. This
  // measures sensitivity, rather than assuming a uniform story distribution.
  if (index >= 512) continue;
  for (const stage of stages) {
    const answerIndex = stage - 1;
    const question = selectQuestion({ stage, sessionSeed: seed, contentVersion: '3.0.0', excludedQuestionIds: [] });
    const currentChoice = question.choices.findIndex((choice) => choice.id === answers[answerIndex]!.choiceId);
    const alternate = question.choices[(currentChoice + 1) % question.choices.length]!;
    const changed = answers.map((answer, offset) => offset === answerIndex ? { ...answer, choiceId: alternate.id } : answer);
    changedAnswers += 1;
    if (calculateResult({ answers: changed, contentVersion: '3.0.0' }).storyId !== id) changedStories += 1;
  }
}

const regular = storyCards.filter((card) => !card.rare).map((card) => ({ id: card.id, name: card.name, count: counts.get(card.id)! }));
const sorted = [...regular].sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
const totalRegular = regular.reduce((sum, card) => sum + card.count, 0);
const expected = totalRegular / regular.length;
const chiSquare = regular.reduce((sum, card) => sum + (card.count - expected) ** 2 / expected, 0);
const positionSummary = Object.fromEntries((['first', 'last'] as const).map((position) => {
  const entries = [...positionResults[position]].sort((a, b) => b[1] - a[1]);
  return [position, { uniqueStories: entries.length, top5: entries.slice(0, 5), top5Share: entries.slice(0, 5).reduce((sum, [, count]) => sum + count, 0) / sampleCount }];
}));
console.log(JSON.stringify({
  sampleCount,
  regularStoryCount: regular.length,
  regularStoryHits: totalRegular,
  zeroHitStories: regular.filter((card) => card.count === 0),
  rareCount,
  expectedPerRegularStory: expected,
  min: sorted.at(-1),
  max: sorted[0],
  top10: sorted.slice(0, 10),
  bottom10: sorted.slice(-10),
  chiSquareVsUniform: chiSquare,
  questionCounts: Object.fromEntries([...questionCounts].sort()),
  questionPathCount: questionPaths.size,
  questionPathHits: Object.fromEntries([...questionPaths].sort()),
  signalCounts: Object.fromEntries([...signalCounts].sort()),
  storySignalCounts: Object.fromEntries([...new Set(storyCards.flatMap((card) => card.signals))].sort().map((signal) => [signal, storyCards.filter((card) => card.signals.includes(signal)).length])),
  genderBreakdown: Object.fromEntries(['남성', '여성', '미기재'].map((gender) => [gender, {
    catalog: storyCards.filter((card) => (card.setting?.gender ?? '미기재') === gender).length,
    selected: storyCards.filter((card) => (card.setting?.gender ?? '미기재') === gender).reduce((sum, card) => sum + counts.get(card.id)!, 0),
  }])),
  positionSummary,
  changedStoryAfterOneChoice: { changedStories, changedAnswers, rate: changedStories / changedAnswers },
}, null, 2));
