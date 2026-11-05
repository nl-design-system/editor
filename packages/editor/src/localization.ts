import { configureLocalization, type LocaleModule } from '@lit/localize';
import * as templates_nl from './../src/generated/locales/nl';
import { allLocales, sourceLocale, targetLocales } from './generated/locale-codes.js';

const localizedTemplates = new Map([['nl', templates_nl]]);

export const SUPPORTED_LOCALES: readonly (typeof allLocales)[number][] = ['nl'];

const FALLBACK_LOCALE = 'nl';

export function getDocumentLang() {
  const lang = document.documentElement.lang.split('-')[0];
  return SUPPORTED_LOCALES.find((locale) => lang === locale) ?? FALLBACK_LOCALE;
}

export const { setLocale } = configureLocalization({
  loadLocale: async (locale) => localizedTemplates.get(locale) as LocaleModule,
  sourceLocale,
  targetLocales,
});

export const initializeLocale = async () => {
  await setLocale(getDocumentLang());
};

export const localizeHost = (host: HTMLElement) => {
  if (!host.hasAttribute('lang')) host.lang = getDocumentLang();
  initializeLocale().catch(console.error);
};
