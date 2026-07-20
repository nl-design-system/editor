import type { ContentValidator } from '../types';
import { inlineValidations, validationSeverity } from '../constants';
import { isEmptyOrWhitespace } from '../helpers';

// ── Inline-type mappings ──────────────────────────────────────────────────────

/** Maps HTML tag names to the inline-type name used in tipPayload. */
const INLINE_TYPES: Partial<Record<string, string>> = {
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
  return {
    element: node,
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

const inlineShouldNotBeEmpty: ContentValidator = (_dom, node) => {
  const tag = node.tagName.toLowerCase();
  const inlineType = INLINE_TYPES[tag];
  if (!inlineType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    element: node,
    scope: 'inline',
    severity: validationSeverity.INFO,
    tipPayload: { nodeType: inlineType },
  };
};

const inlineShouldNotBeUnderlined: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'U') return null;
  return {
    element: node,
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

type InlineValidationKey = (typeof inlineValidations)[keyof typeof inlineValidations];

export const inlineValidatorMap: { [K in InlineValidationKey]: ContentValidator } = {
  [inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY]: inlineShouldNotBeEmpty,
  [inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: inlineShouldNotBeUnderlined,
  [inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: linkShouldNotBeTooGeneric,
};
