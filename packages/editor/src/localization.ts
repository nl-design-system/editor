import type { ReactiveControllerHost } from 'lit';
import { configureLocalization } from '@lit/localize';
import { Task } from '@lit/task';
import { getValidationMessages } from '@/messages';
import { sourceLocale, targetLocales } from './generated/locale-codes.js';

const localizedTemplates = new Map(targetLocales.map((locale) => [locale, import(`./generated/locales/${locale}.ts`)]));

export const { getLocale, setLocale } = configureLocalization({
  loadLocale: async (locale) => localizedTemplates.get(locale as 'nl'),
  sourceLocale,
  targetLocales,
});

/**
 * Initialize localization based on document language
 * Should be called before any components are rendered
 */
export const initializeLocale = async (): Promise<void> => {
  const userLocale = document.documentElement.lang.split('-')[0];

  if (userLocale === 'en' || userLocale === 'nl') {
    console.log(`Setting locale to ${userLocale}`);
    await setLocale(userLocale);
  }
};

export const createLocaleTask = <T>(host: ReactiveControllerHost): Task<readonly [string], T> => {
  return new Task(host, {
    args: () => [getLocale()] as const,
    task: async ([locale]) => (await getValidationMessages(locale as 'en' | 'nl')) as unknown as T,
  });
};
