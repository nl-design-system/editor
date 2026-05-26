import type { ContentValidator, ValidationResult } from '@/types/validation.ts';
import { contentValidations, validationSeverity } from '@/constants';
import { isEmptyOrWhitespace } from '@/validators/helpers.ts';

/** Parse an HTML string into a wrapper element, or return the element as-is. */
const parseContent = (content: string | HTMLElement): HTMLElement => {
  if (typeof content === 'string') {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div;
  }
  return content;
};

const getElementRange = (element: Element): Range | undefined => {
  try {
    const range = document.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
};

// ── Tag → semantic-type mappings ──────────────────────────────────────────────

/** Maps HTML tag names to the ProseMirror node-type name used in tipPayload. */
const BLOCK_NODE_TYPES: Partial<Record<string, string>> = {
  caption: 'tableCaption',
  dd: 'definitionDescription',
  dt: 'definitionTerm',
  li: 'listItem',
  p: 'paragraph',
  td: 'tableCell',
  th: 'tableHeader',
};

/** Maps HTML tag names to the mark-type name used in tipPayload. */
const MARK_TYPES: Partial<Record<string, string>> = {
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

// ── Content validators ────────────────────────────────────────────────────────

const imageMustHaveAltText: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'IMG') return null;
  const alt = (node as HTMLImageElement).alt;
  if (alt && !isEmptyOrWhitespace(alt)) return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.INFO,
  };
};

const nodeShouldNotBeEmpty: ContentValidator = (_dom, node) => {
  const tag = node.tagName.toLowerCase();
  const nodeType = BLOCK_NODE_TYPES[tag];
  if (!nodeType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.INFO,
    tipPayload: { nodeType },
  };
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

const genericLinkTexts = new Set(['lees meer', 'klik hier']);

const linkShouldNotBeTooGeneric: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'A') return null;
  const text = (node.textContent ?? '').trim().toLowerCase();
  if (!genericLinkTexts.has(text)) return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

const markShouldNotBeUnderlined: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'U') return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

const headingMustNotBeEmpty: ContentValidator = (_dom, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.ERROR,
  };
};

const headingShouldNotContainBoldOrItalic: ContentValidator = (_dom, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!node.querySelector('strong, b, em, i')) return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.INFO,
  };
};

const descriptionListMustContainTerm: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'DL') return null;
  if (node.querySelector('dt')) return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.ERROR,
  };
};

const definitionDescriptionMustFollowTerm: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'DT') return null;
  if (node.nextElementSibling?.tagName === 'DD') return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.ERROR,
  };
};

// ── Validator map & runner ────────────────────────────────────────────────────

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];

export const contentValidatorMap: { [K in ContentValidationKey]: ContentValidator } = {
  [contentValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: definitionDescriptionMustFollowTerm,
  [contentValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: descriptionListMustContainTerm,
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [contentValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: headingShouldNotContainBoldOrItalic,
  [contentValidations.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText,
  [contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: linkShouldNotBeTooGeneric,
  [contentValidations.MARK_SHOULD_NOT_BE_EMPTY]: markShouldNotBeEmpty,
  [contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED]: markShouldNotBeUnderlined,
  [contentValidations.NODE_SHOULD_NOT_BE_EMPTY]: nodeShouldNotBeEmpty,
};

/**
 * Walk the DOM tree of `content` in depth-first pre-order, invoking every
 * validator in `validatorMap` for each Element node encountered.
 */
const contentValidator = (
  content: string | HTMLElement,
  validatorMap: Partial<{ [K in ContentValidationKey]: ContentValidator }> = contentValidatorMap,
): Map<Range, ValidationResult> => {
  const errors = new Map<Range, ValidationResult>();
  const root = parseContent(content);

  const walk = (element: Element): void => {
    for (const [key, validator] of Object.entries(validatorMap)) {
      const result = validator!(root, element);
      if (result?.range) {
        result.validatorKey = key;
        errors.set(result.range, result);
      }
    }
    for (const child of element.children) {
      walk(child);
    }
  };

  for (const child of root.children) {
    walk(child);
  }

  return errors;
};

export default contentValidator;
