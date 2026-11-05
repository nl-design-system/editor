import { configureLocalization, type LocaleModule } from '@lit/localize';
import { allLocales, sourceLocale, targetLocales } from './generated/locale-codes.ts';
import * as templates_nl from './generated/locales/nl.ts';

const localizedTemplates = new Map([['nl', templates_nl]]);

export const SUPPORTED_LOCALES: readonly (typeof allLocales)[number][] = ['en', 'nl'];

const FALLBACK_LOCALE = 'nl';

const closestLang = (element: Element): string => {
  let node: Element | null = element;
  while (node) {
    const withLang: Element | null = node.closest('[lang]');
    if (withLang) return withLang.getAttribute('lang') ?? '';
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return '';
};

const languageOf = (tag: string): string => {
  try {
    return new Intl.Locale(tag).language;
  } catch {
    return '';
  }
};

// Follows the nearest lang, not the document's, so an embedding host decides the wizard's language.
export function getClosestLocale(element: Element) {
  const lang = languageOf(closestLang(element));
  return SUPPORTED_LOCALES.find((locale) => lang === locale) ?? FALLBACK_LOCALE;
}

export const { setLocale } = configureLocalization({
  loadLocale: async (locale) => localizedTemplates.get(locale) as LocaleModule,
  sourceLocale,
  targetLocales,
});

export const localizeHost = async (host: HTMLElement) => {
  if (!host.hasAttribute('lang')) host.lang = getClosestLocale(host);
  await setLocale(getClosestLocale(host));
};
