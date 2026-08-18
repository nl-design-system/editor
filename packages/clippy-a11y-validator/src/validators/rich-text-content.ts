import type { ContentValidator } from '@/types';
import { richTextContentValidations, validationSeverity } from '@/constants';
import { correctEmptyMark, correctEmptyNode, correctUnderlinedMark } from '@/correctors';
import { isEmptyOrWhitespace } from '@/helpers';

// ── Tag → semantic-type mappings ──────────────────────────────────────────────

/** Maps block-level HTML tags to the ProseMirror node-type name used in solutionPayload. */
const BLOCK_NODE_TYPES: Partial<Record<string, string>> = {
  caption: 'tableCaption',
  dd: 'definitionDescription',
  dt: 'definitionTerm',
  li: 'listItem',
  p: 'paragraph',
  td: 'tableCell',
  th: 'tableHeader',
};

/** Maps inline-markup HTML tags to the inline-type name used in solutionPayload. */
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

// ── Element validators ────────────────────────────────────────────────────────

const nodeShouldNotBeEmpty: ContentValidator = (_dom, node) => {
  const tag = node.tagName.toLowerCase();
  const nodeType = BLOCK_NODE_TYPES[tag];
  if (!nodeType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: correctEmptyNode(node, nodeType),
    element: node,
    scope: 'block',
    severity: validationSeverity.INFO,
    solutionPayload: { nodeType },
  };
};

const inlineShouldNotBeEmpty: ContentValidator = (_dom, node) => {
  const tag = node.tagName.toLowerCase();
  const inlineType = INLINE_TYPES[tag];
  if (!inlineType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: correctEmptyMark(node),
    element: node,
    scope: 'inline',
    severity: validationSeverity.WARNING,
    solutionPayload: { nodeType: inlineType },
  };
};

const inlineShouldNotBeUnderlined: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'U') return null;
  return {
    correct: correctUnderlinedMark(node),
    element: node,
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

export const richTextContentValidators: Record<string, ContentValidator> = {
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_EMPTY]: inlineShouldNotBeEmpty,
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: inlineShouldNotBeUnderlined,
  [richTextContentValidations.NODE_SHOULD_NOT_BE_EMPTY]: nodeShouldNotBeEmpty,
};
