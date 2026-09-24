// Rule keys and severities are owned by the validator package; only the editor's own UI mode lives here.
export { validationSeverity } from '@nl-design-system-community/clippy-a11y-validator';

export const validationInteractionMode = {
  DRAWER: 'drawer',
  LIST: 'list',
  READONLY: 'readonly',
} as const;
