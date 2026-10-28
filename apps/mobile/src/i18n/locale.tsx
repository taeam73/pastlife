import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { isContentLocaleAvailable, parseContentLocale, type ContentLocale } from '@pastlife/content/locales';
import { english } from './en';
import { thai } from './th';
import { japanese } from './ja';

export type Locale = ContentLocale;
const KEY = 'pastlife.locale.v1';
const uiCatalog: Record<Locale, Readonly<Record<string, string>> | null> = { ko: null, en: english, th: thai, ja: japanese };
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => Promise<void> }>({ locale: 'ko', setLocale: async () => undefined });

export function defaultLocaleForRegion(regionCode: string | null | undefined): Locale {
  switch (regionCode?.toUpperCase()) {
    case 'KR': return 'ko';
    case 'TH': return 'th';
    case 'JP': return 'ja';
    default: return 'en';
  }
}

function deviceDefaultLocale(): Locale {
  return defaultLocaleForRegion(getLocales()[0]?.regionCode);
}

export async function loadLocale(): Promise<Locale> {
  const stored = parseContentLocale(await AsyncStorage.getItem(KEY));
  return stored && isContentLocaleAvailable(stored, process.env.NODE_ENV === 'production') ? stored : deviceDefaultLocale();
}

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, update] = useState<Locale | null>(null);
  useEffect(() => { void loadLocale().then(update).catch(() => update(deviceDefaultLocale())); }, []);
  const setLocale = useCallback(async (next: Locale) => {
    if (!isContentLocaleAvailable(next, process.env.NODE_ENV === 'production')) throw new Error(`Locale unavailable: ${next}`);
    await AsyncStorage.setItem(KEY, next);
    update(next);
  }, []);
  const value = useMemo(() => ({ locale: locale ?? 'ko', setLocale }), [locale, setLocale]);
  if (locale === null) return null;
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }

export function localeText(locale: Locale, values: Record<Locale, string>): string { return values[locale]; }

export function translate(locale: Locale, korean: string): string {
  if (locale === 'ko') return korean;
  const value = uiCatalog[locale]?.[korean];
  if (!value) throw new Error(`Missing ${locale} UI translation: ${korean}`);
  return value;
}

export function useTranslate() {
  const { locale } = useLocale();
  return useCallback((korean: string) => translate(locale, korean), [locale]);
}
