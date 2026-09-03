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
  const variant = payload?.['variant'];
  const solution = (typeof variant === 'string' ? localised.solutions?.[variant] : undefined) ?? localised.solution;

  return {
    error: interpolate(localised.error, payload),
    ...(solution === undefined ? {} : { solution: interpolate(solution, payload) }),
  };
};
