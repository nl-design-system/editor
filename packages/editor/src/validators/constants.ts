export const documentValidations = {
  DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER: 'document-must-have-correct-heading-order',
  DOCUMENT_MUST_HAVE_SEMANTIC_LISTS: 'document-must-have-semantic-lists',
  DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING: 'document-must-have-top-level-heading',
  DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS: 'document-should-not-have-heading-resembling-paragraph',
} as const;

export const contentValidations = {
  HEADING_MUST_NOT_BE_EMPTY: 'heading-must-not-be-empty',
  HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC: 'heading-should-contain-bold-or-italic',
  IMAGE_MUST_HAVE_ALT_TEXT: 'image-must-have-alt-text',
  MARK_SHOULD_NOT_BE_EMPTY: 'mark-should-not-be-empty',
  MARK_SHOULD_NOT_BE_UNDERLINED: 'mark-should-not-be-underlined',
  NODE_SHOULD_NOT_BE_EMPTY: 'node-should-not-be-empty',
} as const;

export const validationSeverity = {
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;
