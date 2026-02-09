import type { ReactiveControllerHost } from 'lit';
import { configureLocalization } from '@lit/localize';
import { Task } from '@lit/task';
import { getValidationMessages } from '@/messages';
import { allLocales, sourceLocale, targetLocales } from './generated/locale-codes.js';

export type Locale = (typeof allLocales)[number];

const localizedTemplates = new Map(targetLocales.map((locale) => [locale, import(`./generated/locales/${locale}.ts`)]));

export function getDocumentLang() {
  const lang = document.documentElement.lang.split('-')[0];
  return allLocales.find((locale) => lang === locale) ?? sourceLocale;
}

export const { getLocale, setLocale } = configureLocalization({
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

export const createLocaleTask = <T>(host: ReactiveControllerHost): Task<readonly [string], T> => {
  return new Task(host, {
    args: () => [getLocale()] as const,
    task: async ([locale]) => (await getValidationMessages(locale as Locale)) as unknown as T,
  });
};
