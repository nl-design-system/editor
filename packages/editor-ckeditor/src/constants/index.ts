export const documentValidations = {
  DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE: 'document-must-have-single-heading-one',
} as const;

export const contentValidations = {
  IMAGE_MUST_HAVE_ALT_TEXT: 'image-must-have-alt-text',
} as const;

export const validationSeverity = {
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;
