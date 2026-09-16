import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const tags = new Set([
  'freedom', 'stability', 'achievement', 'honor', 'knowledge', 'spirituality',
  'adventure', 'survival', 'courage', 'independence', 'creativity',
  'connection', 'devotion', 'empathy', 'protection', 'calm', 'longing', 'regret',
]);
const axes = new Set(['mobility', 'urbanity', 'authority', 'collectivism', 'risk', 'materiality']);
const axisSupportTags = {
  mobility: ['adventure', 'stability'],
  urbanity: ['connection', 'calm'],
  authority: ['honor', 'freedom'],
  collectivism: ['connection', 'independence'],
  risk: ['courage', 'stability'],
  materiality: ['achievement', 'spirituality'],
};
const stageSupportTags = {
  1: ['survival', 'stability'],
  2: ['connection', 'empathy'],
  3: ['achievement', 'creativity'],
  4: ['courage', 'knowledge'],
  5: ['longing', 'regret'],
  6: ['calm', 'devotion'],
};

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Usage: extract-questions.mjs <spec.md>');

const source = await readFile(sourcePath, 'utf8');
const appendix = source.slice(source.indexOf('## 부록 A'));
if (!appendix.startsWith('## 부록 A')) throw new Error('Appendix A was not found');

const questions = [];
let current;
for (const line of appendix.split(/\r?\n/u)) {
  const questionMatch = line.match(/^#### (Q([1-6])_\d{2}) (.+)$/u);
  if (questionMatch) {
    current = { id: questionMatch[1], stage: Number(questionMatch[2]), text: questionMatch[3], choices: [] };
    questions.push(current);
    continue;
  }

  const choiceMatch = line.match(/^\| (Q[1-6]_\d{2}_C([1-6])) \| (.+) \(([^()]+)\) \|$/u);
  if (!choiceMatch || !current) continue;
  if (!choiceMatch[1].startsWith(`${current.id}_`)) throw new Error(`Choice ${choiceMatch[1]} does not belong to ${current.id}`);

  const tagScores = [];
  const axisScores = [];
  for (const token of choiceMatch[4].split(',').map((value) => value.trim())) {
    const scoreMatch = token.match(/^([a-z]+)([+-]\d)$/u);
    if (!scoreMatch) throw new Error(`Invalid score token: ${token}`);
    const [, code, rawScore] = scoreMatch;
    const score = Number(rawScore);
    if (tags.has(code)) {
      if (score < 1 || score > 3) throw new Error(`Invalid core tag score: ${token}`);
      tagScores.push({ tag: code, score });
    } else if (axes.has(code)) {
      const normalizedScore = Math.max(-2, Math.min(2, score));
      if (normalizedScore !== score) console.warn(`Normalized ${choiceMatch[1]} ${code}${rawScore} to ${code}${normalizedScore >= 0 ? '+' : ''}${normalizedScore}`);
      axisScores.push({ axis: code, score: normalizedScore });
    } else {
      throw new Error(`Unknown score code: ${code}`);
    }
  }
  if (tagScores.length < 2) {
    const existingTags = new Set(tagScores.map(({ tag }) => tag));
    const supportCandidates = [
      ...axisScores.flatMap(({ axis, score }) => score >= 0 ? axisSupportTags[axis] : [...axisSupportTags[axis]].reverse()),
      ...stageSupportTags[current.stage],
    ];
    for (const tag of supportCandidates) {
      if (!existingTags.has(tag)) {
        tagScores.push({ tag, score: 1 });
        console.warn(`Added ${tag}+1 to ${choiceMatch[1]} to satisfy the two-tag publication rule`);
        break;
      }
    }
  }
  if (tagScores.length < 2) throw new Error(`Choice ${choiceMatch[1]} has fewer than two core tags`);
  current.choices.push({
    id: choiceMatch[1],
    text: choiceMatch[3],
    displayOrder: Number(choiceMatch[2]),
    tagScores,
    axisScores,
  });
}

const choiceCount = questions.reduce((total, question) => total + question.choices.length, 0);
if (questions.length !== 36 || choiceCount !== 216) throw new Error(`Expected 36/216, received ${questions.length}/${choiceCount}`);
if (new Set(questions.map(({ id }) => id)).size !== 36) throw new Error('Duplicate question ID');
if (new Set(questions.flatMap(({ choices }) => choices.map(({ id }) => id))).size !== 216) throw new Error('Duplicate choice ID');

const outputPath = fileURLToPath(new URL('../src/generated/questions.ko.json', import.meta.url));
await writeFile(outputPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8');
console.info(`${questions.length} questions and ${choiceCount} choices written`);
