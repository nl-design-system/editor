import rosetta from 'rosetta';
import type { Locale, MessageTable, Translate } from './locales/types';
import type { ValidationContext, ValidatorSettings } from './types';
import { en } from './locales/en';
import { nl } from './locales/nl';

export const DEFAULT_LOCALE: Locale = 'en';

const i18n = rosetta<MessageTable>({ en, nl });
i18n.locale(DEFAULT_LOCALE);

/**
 * A translator for one locale. `undefined` when a key is absent, so a rule that
 * ships no `solution` / `href` / `correctLabel` reads as having none.
 *
 * The locale is bound here rather than held as instance state: a run must not be
 * able to change the language a later run reads, and two editors on one page may
 * legitimately differ.
 */
export const translator =
  (locale: Locale = DEFAULT_LOCALE): Translate =>
  (key, params) =>
    i18n.t(key, params, locale) || undefined;

/** Pair settings with a translator bound to their locale — what every validator receives. */
export const validationContext = (settings: ValidatorSettings = { enableRules: ['*'] }): ValidationContext => ({
  ...settings,
  t: translator(settings.locale),
});
