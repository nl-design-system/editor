import type { Locale, ResolvedMessages, ValidationMessagesByLocale } from './types/messages.ts';
import type { ValidationPayload } from './types/validation.ts';

const PLACEHOLDER_REGEX = /\{(\w+)\}/g;

const interpolate = (text: string, payload: ValidationPayload | undefined): string =>
  text.replace(PLACEHOLDER_REGEX, (placeholder, key: string) => {
    const value = payload?.[key];
    return value === undefined ? placeholder : String(value);
  });

export const resolveMessages = (
  messages: ValidationMessagesByLocale,
  locale: Locale,
  fallbackLocale: Locale,
  payload?: ValidationPayload,
): ResolvedMessages => {
  const localised = messages[locale] ?? messages[fallbackLocale] ?? messages.nl;
  const { href, solution } = localised;

  return {
    error: interpolate(localised.error, payload),
    ...(href === undefined ? {} : { href }),
    ...(solution === undefined ? {} : { solution: interpolate(solution, payload) }),
  };
};
