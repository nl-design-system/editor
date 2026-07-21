/**
 * Content classes ensure identical markup between editors (e.g. Tiptap and CKEditor)
 */

export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

export const headingClasses = (level: number): string => `nl-heading nl-heading--level-${level}`;

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
