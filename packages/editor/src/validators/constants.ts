export const documentValidations = {
  DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER: 'document-must-have-correct-heading-order',
  DOCUMENT_MUST_HAVE_HEADING_1: 'document-must-have-heading-1',
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
