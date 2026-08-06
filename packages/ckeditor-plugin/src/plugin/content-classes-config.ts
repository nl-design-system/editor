import {
  HEADING_LEVELS,
  HEADING_LEVEL_TOKEN,
  contentClasses,
  headingClassPattern,
} from '@nl-design-system-community/editor/content-classes';

/**
 * The editable content-class contract, shared by every CMS integration (Drupal, TYPO3, ...).
 */

export { HEADING_LEVEL_TOKEN };

export interface ContentClassField {
  key: string;
  defaultValue: string;
  label: string;
  tags: readonly string[];
  modelElements: readonly string[];
  listTypes: readonly string[];
}

const HEADING_TAGS = HEADING_LEVELS.map((level) => `h${level}`);
const HEADING_MODEL_ELEMENTS = HEADING_LEVELS.map((level) => `heading${level}`);

export const CONTENT_CLASS_FIELDS = [
  {
    defaultValue: contentClasses.paragraph,
    key: 'paragraph',
    label: 'Paragraph',
    listTypes: [],
    modelElements: ['paragraph'],
    tags: ['p'],
  },
  {
    defaultValue: headingClassPattern,
    key: 'heading',
    label: 'Heading',
    listTypes: [],
    modelElements: HEADING_MODEL_ELEMENTS,
    tags: HEADING_TAGS,
  },
  {
    defaultValue: contentClasses.bulletList,
    key: 'bulletList',
    label: 'Bulleted list',
    listTypes: ['bulleted'],
    modelElements: [],
    tags: ['ul'],
  },
  {
    defaultValue: contentClasses.orderedList,
    key: 'orderedList',
    label: 'Numbered list',
    listTypes: ['numbered'],
    modelElements: [],
    tags: ['ol'],
  },
  {
    defaultValue: contentClasses.blockquote,
    key: 'blockquote',
    label: 'Block quote',
    listTypes: [],
    modelElements: ['blockQuote'],
    tags: ['blockquote'],
  },
  {
    defaultValue: contentClasses.codeBlock,
    key: 'codeBlock',
    label: 'Code block',
    listTypes: [],
    modelElements: ['codeBlock'],
    tags: ['code'],
  },
  {
    defaultValue: contentClasses.image,
    key: 'image',
    label: 'Image',
    listTypes: [],
    modelElements: ['imageBlock', 'imageInline'],
    // A block image is downcast to `<figure class="image"><img></figure>`, an inline one to `<img>`.
    tags: ['figure', 'img'],
  },
  {
    defaultValue: contentClasses.table,
    key: 'table',
    label: 'Table',
    listTypes: [],
    modelElements: ['table'],
    // A table is downcast to `<figure class="table"><table></figure>`.
    tags: ['figure'],
  },
] as const satisfies readonly ContentClassField[];

export type ContentClassKey = (typeof CONTENT_CLASS_FIELDS)[number]['key'];
export type ContentClassesConfig = Partial<Record<ContentClassKey, string>>;

// `??` rather than `||`, so an explicit empty string survives as "render this element without a class".
export const resolveContentClasses = (config: ContentClassesConfig = {}): Record<ContentClassKey, string> =>
  Object.fromEntries(CONTENT_CLASS_FIELDS.map(({ defaultValue, key }) => [key, config[key] ?? defaultValue])) as Record<
    ContentClassKey,
    string
  >;

export const contentClassNames = (value: string, tagName = ''): string[] => {
  const level = /^h([1-6])$/u.exec(tagName)?.[1];
  // A pattern without a level to fill in would render as `nl-heading--level-`, so add nothing instead.
  if (value.includes(HEADING_LEVEL_TOKEN) && level === undefined) {
    return [];
  }
  return value
    .replaceAll(HEADING_LEVEL_TOKEN, level ?? '')
    .trim()
    .split(/\s+/u)
    .filter(Boolean);
};
