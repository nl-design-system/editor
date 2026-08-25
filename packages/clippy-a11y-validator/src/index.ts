// ── Static-analysis entry point (AxeBuilder-style) ─────────────────────────────
export { ClippyValidations, toKebabId } from './analyze';
export { SEVERITY_ORDER, assertNoViolations, countBySeverity, formatViolations, hasSeverityAtLeast } from './reporter';

// ── Low-level detection API (framework-agnostic) ───────────────────────────────
export {
  runValidation,
  getActiveValidators,
  collectContentValidations,
  collectDocumentValidations,
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
  AnalysisResult,
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
  Violation,
  ViolationNode,
} from './types';
export type { ValidationKey, ValidationMessage } from './messages';
