import type { Question } from '../types.js';
import type { ContentLocale } from '../locales.js';
import { translateEnglishStoryQuestion } from './en/questions.js';
import { translateThaiStoryQuestion } from './th/questions.js';
import { translateJapaneseStoryQuestion } from './ja/questions.js';

const questionTranslators: Record<ContentLocale, (question: Question) => Question> = {
  ko: (question) => question,
  en: translateEnglishStoryQuestion,
  th: translateThaiStoryQuestion,
  ja: translateJapaneseStoryQuestion,
};

export function localizeStoryQuestion(question: Question, locale: ContentLocale): Question {
  return questionTranslators[locale](question);
}
