import { configureLocalization, type LocaleModule } from '@lit/localize';
import * as templates_nl from './../src/generated/locales/nl.ts';
import { allLocales, sourceLocale, targetLocales } from './generated/locale-codes.js';

const localizedTemplates = new Map([['nl', templates_nl]]);

export function getDocumentLang() {
  const lang = document.documentElement.lang.split('-')[0];
  return allLocales.find((locale) => lang === locale) ?? sourceLocale;
}

export const { setLocale } = configureLocalization({
  loadLocale: async (locale) => localizedTemplates.get(locale) as LocaleModule,
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
