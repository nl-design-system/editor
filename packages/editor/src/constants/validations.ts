// Rule keys and severities stay with the validator package, which consumers import from directly;
// only the editor's own UI mode lives here.
export const validationInteractionMode = {
  LIST: 'list',
  READONLY: 'readonly',
  SIDEBAR: 'sidebar',
} as const;
