export { debouncedValidate, runValidation } from '../validations/index';
export type { Violation, ViolationsMap } from '../types/validation';
// Re-exported so a host can name the validations to run, and write its own, without also
// depending on the validator package directly.
export {
  coreValidationRules,
  coreValidations,
  defineValidation,
  validationSeverity,
} from '@nl-design-system-community/clippy-a11y-validator';
export type {
  CoreValidationRule,
  Validation,
  ValidationSeverity,
  ViolationCorrection,
} from '@nl-design-system-community/clippy-a11y-validator';
