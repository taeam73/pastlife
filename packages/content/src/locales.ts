export const contentLocales = {
  ko: { languageTag: 'ko-KR', uiNameKey: '한국어', availability: 'released' },
  en: { languageTag: 'en-US', uiNameKey: 'English', availability: 'released' },
  th: { languageTag: 'th-TH', uiNameKey: '태국어', availability: 'released' },
  ja: { languageTag: 'ja-JP', uiNameKey: '일본어', availability: 'released' },
} as const;

export type ContentLocale = keyof typeof contentLocales;

export function parseContentLocale(value: unknown): ContentLocale | null {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(contentLocales, value)
    ? value as ContentLocale
    : null;
}

export function isContentLocaleAvailable(locale: ContentLocale, production: boolean): boolean {
  return !production || contentLocales[locale].availability === 'released';
}

export function selectableContentLocales(production: boolean): ContentLocale[] {
  return (Object.keys(contentLocales) as ContentLocale[]).filter((locale) => isContentLocaleAvailable(locale, production));
}
