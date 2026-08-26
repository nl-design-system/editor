// ── Static validation entry point (AxeBuilder-style) ─────────────────────────────
export { ClippyValidator, toKebabId } from './validator';
export {
  SEVERITY_ORDER,
  assertNoValidationItems,
  countBySeverity,
  formatValidationItems,
  hasSeverityAtLeast,
} from './reporter';

// ── Low-level detection API (framework-agnostic) ───────────────────────────────
export {
  runValidation,
  getActiveValidators,
  collectContentValidations,
  collectDocumentValidations,
  runValidators,
} from './validators';
export { blockValidatorMap } from './validators/block';
export { inlineValidatorMap } from './validators/inline';
export {
  documentValidatorObject,
  documentMustHaveCorrectHeadingOrder,
  documentMustHaveSingleHeadingOne,
  documentMustHaveTopLevelHeadingOne,
} from './validators/document';

export {
  blockValidations,
  documentValidations,
  inlineValidations,
  validationSeverity,
  validatorEvents,
} from './constants';
export {
  isEmptyOrWhitespace,
  getElementRange,
  getParagraphLinesFromDOM,
  orderedListIndicator,
  unorderedListIndicator,
  walkElements,
} from './helpers';
export { validationMessages } from './messages';

// ── Editor/browser adapter (Range-keyed map + corrections) ─────────────────────
export { buildValidationMap } from './validation-map';

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  ValidationReport,
  ContentValidator,
  CorrectValidationFunction,
  DocumentValidator,
  HeadingLevel,
  ImageAltTextRequest,
  SolutionPayload,
  ValidationMapResult,
  ValidationResult,
  ValidationScope,
  ValidationSeverity,
  ValidatorSettings,
  ValidationItem,
  ValidationItemNode,
} from './types';
export type { ValidationKey, ValidationMessage } from './messages';
