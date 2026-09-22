// https://nldesignsystem.nl/definition-list
// The folder and the rule keys follow the HTML spec, which calls `dl` a description list; NL Design
// System documents the same component as a definition list, which is where the link above points.
export const descriptionListValidationRules = {
  DESCRIPTION_LIST_MUST_CONTAIN_TERM: 'DESCRIPTION_LIST_MUST_CONTAIN_TERM',
  DESCRIPTION_SHOULD_NOT_BE_EMPTY: 'DESCRIPTION_SHOULD_NOT_BE_EMPTY',
  DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION: 'DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION',
  DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY: 'DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY',
} as const;
