export const documentValidations = {
  DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER: 'document-must-have-correct-heading-order',
  DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE: 'document-must-have-single-heading-one',
  DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE: 'document-must-have-top-level-heading',
} as const;

export const blockValidations = {
  DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM: 'definition-description-must-follow-term',
  DESCRIPTION_LIST_MUST_CONTAIN_TERM: 'description-list-must-contain-term',
  HEADING_MUST_NOT_BE_EMPTY: 'heading-must-not-be-empty',
  HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC: 'heading-should-contain-bold-or-italic',
  IMAGE_MUST_HAVE_ALT_TEXT: 'image-must-have-alt-text',
  NODE_SHOULD_NOT_BE_EMPTY: 'node-should-not-be-empty',
  PARAGRAPH_MUST_USE_SEMANTIC_LIST: 'document-must-have-semantic-lists',
  PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING: 'document-should-not-have-heading-resembling-paragraph',
  TABLE_MUST_HAVE_HEADINGS: 'document-must-have-table-with-headings',
  TABLE_MUST_HAVE_MULTIPLE_ROWS: 'document-must-have-table-with-multiple-rows',
} as const;

export const inlineValidations = {
  INLINE_SHOULD_NOT_BE_EMPTY: 'mark-should-not-be-empty',
  INLINE_SHOULD_NOT_BE_UNDERLINED: 'mark-should-not-be-underlined',
  LINK_SHOULD_NOT_BE_TOO_GENERIC: 'link-should-not-be-too-generic',
} as const;

export const validationSeverity = {
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;
