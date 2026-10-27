import { describe, expect, it } from 'vitest';
import { contentLocales, isContentLocaleAvailable, parseContentLocale, selectableContentLocales } from '../src/locales.js';
import { englishStoryTranslationCoverage } from '../src/translations/en/coverage.js';
import { thaiStoryTranslationCoverage } from '../src/translations/th/coverage.js';
import { japaneseStoryTranslationCoverage } from '../src/translations/ja/coverage.js';

describe('content locale registry', () => {
  it('offers complete Korean, English, Thai, and Japanese catalogs in production', () => {
    expect(selectableContentLocales(true)).toEqual(['ko', 'en', 'th', 'ja']);
    expect(selectableContentLocales(false)).toEqual(['ko', 'en', 'th', 'ja']);
    expect(isContentLocaleAvailable('en', true)).toBe(true);
    expect(isContentLocaleAvailable('th', true)).toBe(true);
    expect(isContentLocaleAvailable('ja', true)).toBe(true);
    expect(contentLocales.en.languageTag).toBe('en-US');
    expect(contentLocales.th.languageTag).toBe('th-TH');
    expect(contentLocales.ja.languageTag).toBe('ja-JP');
  });

  it('rejects unknown language codes until their catalog is added', () => {
    expect(parseContentLocale('ko')).toBe('ko');
    expect(parseContentLocale('en')).toBe('en');
    expect(parseContentLocale('th')).toBe('th');
    expect(parseContentLocale('ja')).toBe('ja');
    expect(parseContentLocale('en-US')).toBeNull();
  });

  it('requires all stories and signal paths for every released translation', () => {
    const coverage = { en: englishStoryTranslationCoverage(), th: thaiStoryTranslationCoverage(), ja: japaneseStoryTranslationCoverage() };
    for (const locale of ['en', 'th', 'ja'] as const) {
      if (contentLocales[locale].availability !== 'released') continue;
      expect(coverage[locale].readyStories, locale).toBe(120);
      expect(coverage[locale].readySignalPaths, locale).toBe(360);
    }
  });
});
