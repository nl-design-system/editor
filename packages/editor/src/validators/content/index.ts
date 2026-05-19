import type { ContentValidator, CorrectValidationFunction, ValidationResult } from '@/types/validation.ts';
import { contentValidations, validationSeverity } from '@/constants';
import {
  correctDefinitionListMissingTerm,
  correctDefinitionTermMissingDescription,
  correctEmptyHeading,
  correctEmptyMark,
  correctEmptyNode,
  correctGenericLinkText,
  correctHeadingWithFormatting,
  correctUnderlinedMark,
} from '@/correctors';

const isEmptyOrWhitespace = (text: string): boolean => /^\s*$/.test(text);

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

/** `correct` for a block element — resolves its ProseMirror position lazily. */
const correctBlock = (
  element: Element,
  factory: (pos: number) => CorrectValidationFunction,
): CorrectValidationFunction => {
  return (editor) => {
    try {
      const pos = editor.view.posAtDOM(element, 0) - 1;
      factory(pos)(editor);
    } catch {
      /* noop */
    }
  };
};

/** `correct` for an inline element that also needs its text size. */
const correctInlineWithSize = (
  element: Element,
  factory: (pos: number, nodeSize: number) => CorrectValidationFunction,
): CorrectValidationFunction => {
  return (editor) => {
    try {
      const pos = editor.view.posAtDOM(element, 0);
      const nodeSize = element.textContent?.length ?? 0;
      factory(pos, nodeSize)(editor);
    } catch {
      /* noop */
    }
  };
};

// ── Tag → semantic-type mappings ──────────────────────────────────────────────

/** Maps HTML tag names to the ProseMirror node-type name used in tipPayload / corrections. */
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

const imageMustHaveAltText: ContentValidator = (_content, node) => {
  if (node.tagName !== 'IMG') return null;
  const alt = (node as HTMLImageElement).alt;
  if (alt && !isEmptyOrWhitespace(alt)) return null;
  return {
    correct: (editor) => {
      try {
        const pos = editor.view.posAtDOM(node, 0) - 1;
        editor.chain().focus().setNodeSelection(pos).run();
      } catch {
        /* noop */
      }
    },
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.INFO,
  };
};

const nodeShouldNotBeEmpty: ContentValidator = (_content, node) => {
  const tag = node.tagName.toLowerCase();
  const nodeType = BLOCK_NODE_TYPES[tag];
  if (!nodeType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: correctBlock(node, (pos) => correctEmptyNode(pos, nodeType)),
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.INFO,
    tipPayload: { nodeType },
  };
};

const markShouldNotBeEmpty: ContentValidator = (_content, node) => {
  const tag = node.tagName.toLowerCase();
  const markType = MARK_TYPES[tag];
  if (!markType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: correctEmptyMark(node),
    range: getElementRange(node),
    scope: 'inline',
    severity: validationSeverity.INFO,
    tipPayload: { nodeType: markType },
  };
};

const genericLinkTexts = new Set(['lees meer', 'klik hier']);

const linkShouldNotBeTooGeneric: ContentValidator = (_content, node) => {
  if (node.tagName !== 'A') return null;
  const text = (node.textContent ?? '').trim().toLowerCase();
  if (!genericLinkTexts.has(text)) return null;
  return {
    correct: correctInlineWithSize(node, (pos, size) => correctGenericLinkText(pos, size)),
    range: getElementRange(node),
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

const markShouldNotBeUnderlined: ContentValidator = (_content, node) => {
  if (node.tagName !== 'U') return null;
  return {
    correct: correctInlineWithSize(node, (pos, size) => correctUnderlinedMark(pos, size)),
    range: getElementRange(node),
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

const headingMustNotBeEmpty: ContentValidator = (_content, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: correctBlock(node, (pos) => correctEmptyHeading(pos)),
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.ERROR,
  };
};

const headingShouldNotContainBoldOrItalic: ContentValidator = (_content, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!node.querySelector('strong, b, em, i')) return null;
  return {
    correct: correctHeadingWithFormatting(node),
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.INFO,
  };
};

const descriptionListMustContainTerm: ContentValidator = (_content, node) => {
  if (node.tagName !== 'DL') return null;
  if (node.querySelector('dt')) return null;
  return {
    correct: correctBlock(node, (pos) => correctDefinitionListMissingTerm(pos)),
    range: getElementRange(node),
    scope: 'element',
    severity: validationSeverity.ERROR,
  };
};

const definitionDescriptionMustFollowTerm: ContentValidator = (_content, node) => {
  if (node.tagName !== 'DT') return null;
  if (node.nextElementSibling?.tagName === 'DD') return null;
  return {
    correct: correctDefinitionTermMissingDescription(node),
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
): Map<string, ValidationResult> => {
  const errors = new Map<string, ValidationResult>();
  const root = parseContent(content);

  let pos = 0;
  const walk = (element: Element): void => {
    const currentPos = pos++;
    for (const [key, validator] of Object.entries(validatorMap)) {
      const result = validator!(content, element, currentPos);
      if (result) errors.set(`${key}_${currentPos}`, result);
    }
    for (const child of Array.from(element.children)) {
      walk(child);
    }
  };

  for (const child of Array.from(root.children)) {
    walk(child);
  }

  return errors;
};

export default contentValidator;
