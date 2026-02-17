import { configureLocalization } from '@lit/localize';
import { allLocales, sourceLocale, targetLocales } from './generated/locale-codes.js';

export type Locale = (typeof allLocales)[number];

const localizedTemplates = new Map(targetLocales.map((locale) => [locale, import(`./generated/locales/${locale}.ts`)]));

export function getDocumentLang() {
  const lang = document.documentElement.lang.split('-')[0];
  return allLocales.find((locale) => lang === locale) ?? sourceLocale;
}

export const { setLocale } = configureLocalization({
  loadLocale: async (locale) => localizedTemplates.get(locale as 'nl'),
  sourceLocale,
  targetLocales,
});

/**
 * Initialize localization based on document language
 * Should be called before any components are rendered
 */
export const initializeLocale = async () => {
  await setLocale(getDocumentLang());
};
