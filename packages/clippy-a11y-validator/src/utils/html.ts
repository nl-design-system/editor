import type { ViolationPayload } from '../types/validation.ts';

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
export const replacePlaceholders = (html: string, payload: ViolationPayload | undefined): string =>
  html.replace(PLACEHOLDER_REGEX, (placeholder, key: string) => {
    const value = payload?.[key];
    return value === undefined ? placeholder : escaped(String(value));
  });
