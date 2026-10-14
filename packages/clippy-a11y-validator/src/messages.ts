import type { ByLocale, Locale, ResolvedMessages, ValidationMessagesByLocale } from './types/messages.ts';
import type { ViolationPayload } from './types/validation.ts';
import { getRuleById } from './documentation.ts';

const PLACEHOLDER_REGEX = /\{(\w+)\}/g;

/** A text node serialises its content as text, so markup in the value comes out escaped. */
const escaped = (value: string): string => {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
};

/**
 * Only the HTML fields carry placeholders, and a placeholder's value is read off the document — a
 * heading level, but also the link text an author typed. The copy around it is markup a validation
 * wrote and means; the value dropped into it is not, so it goes in as text. A placeholder belongs in
 * text content, never in an attribute value: quotes are not escaped.
 */
const interpolate = (html: string, payload: ViolationPayload | undefined): string =>
  html.replace(PLACEHOLDER_REGEX, (placeholder, key: string) => {
    const value = payload?.[key];
    return value === undefined ? placeholder : escaped(String(value));
  });

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
    ...(explanation === undefined ? {} : { explanation: interpolate(explanation, payload) }),
    ...(href === undefined ? {} : { href }),
    ...(solution === undefined ? {} : { solution: interpolate(solution, payload) }),
  };
};
