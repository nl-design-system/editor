// Validations are grouped by the NL Design System component they apply to
// (https://nldesignsystem.nl/componenten), not by DOM position. The rule id
// *values* are stable identifiers — they appear in `enable-rules` / `disable-rules`
// attributes, report output and localisation keys — so they never change when a
// rule moves between component groups.

// https://nldesignsystem.nl/heading
export const headingValidations = {
  DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER: 'DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER',
  DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE: 'DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE',
  DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE: 'DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE',
  HEADING_MUST_NOT_BE_EMPTY: 'HEADING_MUST_NOT_BE_EMPTY',
  HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC: 'HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC',
} as const;

// https://nldesignsystem.nl/paragraph
export const paragraphValidations = {
  PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD: 'PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD',
  PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING: 'PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING',
  PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST: 'PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST',
} as const;

// https://nldesignsystem.nl/link
export const linkValidations = {
  LINK_SHOULD_NOT_BE_TOO_GENERIC: 'LINK_SHOULD_NOT_BE_TOO_GENERIC',
} as const;

// https://nldesignsystem.nl/image
export const imageValidations = {
  IMAGE_MUST_HAVE_ALT_TEXT: 'IMAGE_MUST_HAVE_ALT_TEXT',
} as const;

// https://nldesignsystem.nl/table
export const tableValidations = {
  TABLE_MUST_HAVE_HEADINGS: 'TABLE_MUST_HAVE_HEADINGS',
  TABLE_MUST_HAVE_MULTIPLE_ROWS: 'TABLE_MUST_HAVE_MULTIPLE_ROWS',
} as const;

// https://nldesignsystem.nl/definition-list
export const definitionListValidations = {
  DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM: 'DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM',
  DESCRIPTION_LIST_MUST_CONTAIN_TERM: 'DESCRIPTION_LIST_MUST_CONTAIN_TERM',
} as const;

// https://nldesignsystem.nl/rich-text-content — cross-component rules for generic
// prose markup (empty nodes, empty inline markup, underlined text).
export const richTextContentValidations = {
  INLINE_SHOULD_NOT_BE_EMPTY: 'INLINE_SHOULD_NOT_BE_EMPTY',
  INLINE_SHOULD_NOT_BE_UNDERLINED: 'INLINE_SHOULD_NOT_BE_UNDERLINED',
  NODE_SHOULD_NOT_BE_EMPTY: 'NODE_SHOULD_NOT_BE_EMPTY',
} as const;

/** Flat catalogue of every rule id, keyed by rule name — a convenience for consumers that need every rule regardless of component. */
export const validations = {
  ...headingValidations,
  ...paragraphValidations,
  ...linkValidations,
  ...imageValidations,
  ...tableValidations,
  ...definitionListValidations,
  ...richTextContentValidations,
} as const;

export const validationSeverity = {
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export const validatorEvents = {
  OPEN_IMAGE_DIALOG: 'clippy:open-image-dialog',
} as const;
