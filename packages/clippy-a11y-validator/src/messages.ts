import type { ByLocale, Locale, ResolvedMessages, ValidationMessagesByLocale } from './types/messages.ts';
import type { ViolationPayload } from './types/validation.ts';
import { getRuleById } from './documentation.ts';
import { replacePlaceholders } from './utils/html.ts';

/** Which locale wins: the one asked for, else the fallback, else the source language. */
export const resolveLocalised = <T>(byLocale: ByLocale<T>, locale: Locale, fallbackLocale: Locale): T =>
  byLocale[locale] ?? byLocale[fallbackLocale] ?? byLocale.nl;

export const resolveMessages = (
  messages: ValidationMessagesByLocale,
  locale: Locale,
  fallbackLocale: Locale,
  payload?: ViolationPayload,
  documentationId?: string,
): ResolvedMessages => {
  const { explanation, href, solution, title } = resolveLocalised(messages, locale, fallbackLocale);
  const rule = getRuleById(documentationId);

  return {
    ...rule,
    // A title names the rule rather than this violation, so a named rule gets to name it.
    title: rule?.title ?? title ?? '',
    ...(explanation === undefined ? {} : { explanation: replacePlaceholders(explanation, payload) }),
    ...(href === undefined ? {} : { href }),
    ...(solution === undefined ? {} : { solution: replacePlaceholders(solution, payload) }),
  };
};
