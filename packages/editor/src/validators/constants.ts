export const documentValidations = {
  DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER: 'document-must-have-correct-heading-order',
  DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING: 'document-must-have-top-level-heading',
} as const;

export const contentValidations = {
  HEADING_MUST_NOT_BE_EMPTY: 'heading-must-not-be-empty',
  PARAGRAPH_MUST_NOT_BE_EMPTY: 'paragraph-must-not-be-empty',
} as const;

export const validationSeverity = {
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;
