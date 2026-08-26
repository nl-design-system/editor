import { isEmptyOrWhitespace } from '@/helpers';

/** Maps block-level HTML tags to the ProseMirror node-type name named in `solution` text. */
const BLOCK_NODE_TYPES: Partial<Record<string, string>> = {
  caption: 'tableCaption',
  dd: 'definitionDescription',
  dt: 'definitionTerm',
  li: 'listItem',
  p: 'paragraph',
  td: 'tableCell',
  th: 'tableHeader',
};

/** Maps inline-markup HTML tags to the inline-type name named in `solution` text. */
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

/** Looks up `element` in a tag→type map, and reports its type only when it holds no text. */
const emptyTypeFrom = (types: Partial<Record<string, string>>, element: Element): string | null => {
  const type = types[element.tagName.toLowerCase()];
  if (!type) return null;
  return isEmptyOrWhitespace(element.textContent ?? '') ? type : null;
};

/** The node type of an empty block element, or `null` if it isn't one, or isn't empty. */
export const emptyBlockNodeType = (element: Element): string | null => emptyTypeFrom(BLOCK_NODE_TYPES, element);

/** The inline type of empty inline markup, or `null` if it isn't inline markup, or isn't empty. */
export const emptyInlineType = (element: Element): string | null => emptyTypeFrom(INLINE_TYPES, element);

/** Underlining reads as a link to most users, so prose should not use it. */
export const isUnderlined = (element: Element): boolean => element.tagName === 'U';
