import type { ContentValidator } from '@/types/validation.ts';
import { inlineValidations, validationSeverity } from '@/constants';
import { getElementRange } from '@/validators/element/index.ts';
import { isEmptyOrWhitespace } from '@/validators/helpers.ts';

// ── Mark-type mappings ────────────────────────────────────────────────────────

/** Maps HTML tag names to the mark-type name used in tipPayload. */
export const MARK_TYPES: Partial<Record<string, string>> = {
  a: 'link',
  b: 'bold',
  code: 'code',
  del: 'strike',
  em: 'italic',
  i: 'italic',
  mark: 'highlight',
  s: 'strike',
  strike: 'strike',
  strong: 'bold',
  u: 'underline',
};

// ── Inline validators ─────────────────────────────────────────────────────────

const genericLinkTexts = new Set(['lees meer', 'klik hier']);

const linkShouldNotBeTooGeneric: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'A') return null;
  const text = (node.textContent ?? '').trim().toLowerCase();
  if (!genericLinkTexts.has(text)) return null;
  return { correct: () => {}, range: getElementRange(node), scope: 'inline', severity: validationSeverity.INFO };
};

const markShouldNotBeEmpty: ContentValidator = (_dom, node) => {
  const tag = node.tagName.toLowerCase();
  const markType = MARK_TYPES[tag];
  if (!markType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'inline',
    severity: validationSeverity.INFO,
    tipPayload: { nodeType: markType },
  };
};

const markShouldNotBeUnderlined: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'U') return null;
  return { correct: () => {}, range: getElementRange(node), scope: 'inline', severity: validationSeverity.INFO };
};

// ── Validator map ─────────────────────────────────────────────────────────────

type InlineValidationKey = (typeof inlineValidations)[keyof typeof inlineValidations];

export const inlineValidatorMap: { [K in InlineValidationKey]: ContentValidator } = {
  [inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: linkShouldNotBeTooGeneric,
  [inlineValidations.MARK_SHOULD_NOT_BE_EMPTY]: markShouldNotBeEmpty,
  [inlineValidations.MARK_SHOULD_NOT_BE_UNDERLINED]: markShouldNotBeUnderlined,
};
