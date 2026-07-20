// Rule keys and severities are owned by the standalone validator package so the
// editor UI and the static-analysis tool can never structurally drift apart.
export {
  blockValidations,
  documentValidations,
  inlineValidations,
  validationSeverity,
} from '@nl-design-system-community/clippy-a11y-validator';

export const validationInteractionMode = {
  DRAWER: 'drawer',
  LIST: 'list',
  READONLY: 'readonly',
} as const;
