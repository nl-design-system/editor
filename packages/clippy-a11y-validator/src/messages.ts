import type { ByLocale, Locale, ResolvedMessages, ValidationMessagesByLocale } from './types/messages.ts';
import type { ViolationPayload } from './types/validation.ts';

const PLACEHOLDER_REGEX = /\{(\w+)\}/g;

const interpolate = (text: string, payload: ViolationPayload | undefined): string =>
  text.replace(PLACEHOLDER_REGEX, (placeholder, key: string) => {
    const value = payload?.[key];
    return value === undefined ? placeholder : String(value);
  });

/** Which locale wins: the one asked for, else the fallback, else the source language. */
export const resolveLocalised = <T>(byLocale: ByLocale<T>, locale: Locale, fallbackLocale: Locale): T =>
  byLocale[locale] ?? byLocale[fallbackLocale] ?? byLocale.nl;

export const resolveMessages = (
  messages: ValidationMessagesByLocale,
  locale: Locale,
  fallbackLocale: Locale,
  payload?: ViolationPayload,
): ResolvedMessages => {
  const localised = resolveLocalised(messages, locale, fallbackLocale);
  const { href, solution } = localised;

  return {
    error: interpolate(localised.error, payload),
    ...(href === undefined ? {} : { href }),
    ...(solution === undefined ? {} : { solution: interpolate(solution, payload) }),
  };
};
