// Rule ids and severities are owned by the standalone validator package so the
// editor UI and the static-analysis tool can never structurally drift apart.
// Rules are grouped there by NL Design System component; `validations` is the flat
// catalogue of every rule id, which is what the editor's lookup tables key off.
export {
  definitionListValidations,
  headingValidations,
  imageValidations,
  linkValidations,
  paragraphValidations,
  richTextContentValidations,
  tableValidations,
  validations,
  validationSeverity,
} from '@nl-design-system-community/clippy-a11y-validator';

export const validationInteractionMode = {
  DRAWER: 'drawer',
  LIST: 'list',
  READONLY: 'readonly',
} as const;
