import type { Question } from '../../types.js';
import questionText from './questions.json';

const text = questionText as Record<string, readonly string[]>;

export function translateJapaneseStoryQuestion(question: Question): Question {
  const translated = text[question.id];
  if (!translated || translated.length !== 7 || question.choices.length !== 6) throw new Error(`Japanese question unavailable: ${question.id}`);
  return { ...question, text: translated[0]!, choices: question.choices.map((choice, index) => ({ ...choice, text: translated[index + 1]! })) };
}

export const japaneseStoryQuestionIds = Object.keys(text);
