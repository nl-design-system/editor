/**
 * Content classes ensure identical markup between editors (e.g. Tiptap and CKEditor)
 */

export const HEADING_LEVEL_TOKEN = '{level}';

export const headingClassPattern = `nl-heading nl-heading--level-${HEADING_LEVEL_TOKEN}`;

export const headingClasses = (level: number): string =>
  headingClassPattern.replaceAll(HEADING_LEVEL_TOKEN, String(level));

export const contentClasses = {
  blockquote: 'utrecht-blockquote utrecht-blockquote--html-blockquote',
  bulletList: 'utrecht-unordered-list utrecht-unordered-list--html-content',
  code: 'nl-code',
  codeBlock: 'nl-code-block',
  highlight: 'nl-mark',
  horizontalRule: 'utrecht-separator',
  image: 'utrecht-image',
  link: 'nl-link',
  orderedList: 'utrecht-ordered-list utrecht-ordered-list--html-content',
  paragraph: 'nl-paragraph',
  subscript: 'utrecht-subscript',
  superscript: 'utrecht-superscript',
  table: 'utrecht-table utrecht-table--html-table',
} as const;
