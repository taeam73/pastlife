import { createHash } from 'node:crypto';
import { questionsForVersion, selectQuestion, storyCards, type Question, type Stage, type StorySignal } from '@pastlife/content';
import { calculateResult, hashText } from '../packages/scoring/src/index.js';

// Offline comparison only. This script does not modify production selection or scoring.
const stages: Stage[] = [1, 2, 3, 4, 5, 6];
const signals: StorySignal[] = ['notice', 'connect', 'rest', 'explore', 'repair', 'speak', 'protect', 'release'];
const userCount = 512;
const sessionsPerUser = 8;
const contentVersion = '3.0.0';
type Scenario = 'current' | 'independent' | 'rotation' | 'rotation-and-recent-story';
type AnswerMode = 'stable-preference' | 'uniform-random';

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function indexFor(value: string, count: number) {
  return Number.parseInt(digest(value).slice(0, 8), 16) % count;
}

function candidates(stage: Stage) {
  return questionsForVersion(contentVersion).filter((question) => question.stage === stage).sort((left, right) => left.id.localeCompare(right.id));
}

function independentQuestion(stage: Stage, seed: string, history: string[]) {
  const all = candidates(stage);
  const fresh = all.filter((question) => !history.includes(question.id));
  const selectable = fresh.length ? fresh : all;
  return selectable[indexFor(`${seed}:${contentVersion}:independent-stage:${stage}`, selectable.length)]!;
}

function rotatedQuestion(stage: Stage, user: number, session: number) {
  const round = Math.floor(session / 4);
  const order = candidates(stage).map((question) => ({ question, rank: digest(`user:${user}:round:${round}:stage:${stage}:${question.id}`) }));
  order.sort((a, b) => a.rank.localeCompare(b.rank));
  return order[session % 4]!.question;
}

function preference(user: number) {
  return [...signals].sort((a, b) => digest(`user:${user}:signal:${a}`).localeCompare(digest(`user:${user}:signal:${b}`)));
}

function choose(question: Question, preferred: StorySignal[]) {
  return [...question.choices].sort((a, b) =>
    preferred.indexOf(a.storySignals?.[0] ?? 'notice') - preferred.indexOf(b.storySignals?.[0] ?? 'notice') || a.id.localeCompare(b.id))[0]!;
}

function avoidRecentStory(storyId: string, storySignals: StorySignal[], answers: Array<{ stage: Stage; questionId: string; choiceId: string }>, recent: string[]) {
  if (storyCards.find((card) => card.id === storyId)?.rare) return storyId;
  const signalCount = (signal: StorySignal) => storySignals.filter((value) => value === signal).length;
  const affinities = storyCards.filter((card) => !card.rare).map((card) => ({
    card, score: card.signals.reduce((sum, signal) => sum + Math.min(2, signalCount(signal)), 0),
  }));
  const maximum = Math.max(...affinities.map((item) => item.score));
  const close = affinities.filter((item) => item.score > 0 && item.score >= maximum - 1).sort((a, b) => a.card.id.localeCompare(b.card.id));
  if (!recent.includes(storyId)) return storyId;
  const fresh = close.filter((item) => !recent.includes(item.card.id));
  if (!fresh.length) return storyId;
  const answerKey = answers.map((answer) => `${answer.stage}:${answer.questionId}:${answer.choiceId}`).join('|');
  return fresh[indexFor(`${hashText(answerKey)}:${contentVersion}:story-pick`, fresh.length)]!.card.id;
}

function simulate(scenario: Scenario, answerMode: AnswerMode) {
  const counts = new Map(storyCards.map((card) => [card.id, 0]));
  const firstPaths = new Set<string>();
  const allPaths = new Set<string>();
  let repeatPrevious = 0;
  let totalTransitions = 0;
  let usersWithFourDistinctStories = 0;
  let totalUniqueStoriesPerUser = 0;
  let firstFourQuestionsDistinct = 0;
  let repeatAvoided = 0;
  for (let user = 0; user < userCount; user += 1) {
    const seenQuestions: string[][] = [];
    const stories: string[] = [];
    const preferred = preference(user);
    for (let session = 0; session < sessionsPerUser; session += 1) {
      const seed = digest(`simulation:user:${user}:session:${session}`).slice(0, 32);
      const history = seenQuestions.slice(-10).flat();
      const selected = stages.map((stage) => scenario === 'current'
        ? selectQuestion({ stage, sessionSeed: seed, contentVersion, excludedQuestionIds: history })
        : scenario === 'independent'
          ? independentQuestion(stage, seed, history)
          : rotatedQuestion(stage, user, session));
      const path = selected.map((question) => question.id).join(',');
      allPaths.add(path);
      if (session === 0) firstPaths.add(path);
      seenQuestions.push(selected.map((question) => question.id));
      const answers = selected.map((question, offset) => ({
        stage: stages[offset]!, questionId: question.id,
        choiceId: answerMode === 'stable-preference'
          ? choose(question, preferred).id
          : question.choices[indexFor(`user:${user}:session:${session}:stage:${stages[offset]}:choice`, question.choices.length)]!.id,
      }));
      const result = calculateResult({ answers, sessionSeed: seed, contentVersion });
      const original = result.storyId!;
      const story = scenario === 'rotation-and-recent-story'
        ? avoidRecentStory(original, result.storySignals ?? [], answers, stories.slice(-3))
        : original;
      if (story !== original) repeatAvoided += 1;
      stories.push(story);
      counts.set(story, counts.get(story)! + 1);
      if (session && stories[session - 1] === story) repeatPrevious += 1;
      if (session) totalTransitions += 1;
    }
    if (new Set(stories.slice(0, 4)).size === 4) usersWithFourDistinctStories += 1;
    totalUniqueStoriesPerUser += new Set(stories).size;
    if (stages.every((_, offset) => new Set(seenQuestions.slice(0, 4).map((questions) => questions[offset])).size === 4)) firstFourQuestionsDistinct += 1;
  }
  const regular = storyCards.filter((card) => !card.rare).map((card) => ({ id: card.id, count: counts.get(card.id)! }));
  const sorted = [...regular].sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
  return {
    scenario, answerMode, users: userCount, sessionsPerUser, results: userCount * sessionsPerUser,
    firstSessionQuestionPaths: firstPaths.size, allQuestionPaths: allPaths.size,
    firstFourSessionsShowAllQuestionsPerStage: firstFourQuestionsDistinct / userCount,
    distinctRegularStories: regular.filter((card) => card.count > 0).length,
    regularRange: [sorted.at(-1)!.count, sorted[0]!.count],
    topStory: sorted[0], top10Share: sorted.slice(0, 10).reduce((sum, card) => sum + card.count, 0) / (userCount * sessionsPerUser),
    rareResults: storyCards.filter((card) => card.rare).reduce((sum, card) => sum + counts.get(card.id)!, 0),
    repeatPreviousRate: repeatPrevious / totalTransitions,
    usersWithFourDistinctStoriesRate: usersWithFourDistinctStories / userCount,
    meanUniqueStoriesInEightSessions: totalUniqueStoriesPerUser / userCount,
    repeatAvoided,
  };
}

console.log(JSON.stringify((['stable-preference', 'uniform-random'] as const).flatMap((answerMode) =>
  (['current', 'independent', 'rotation', 'rotation-and-recent-story'] as const).map((scenario) => simulate(scenario, answerMode))), null, 2));
