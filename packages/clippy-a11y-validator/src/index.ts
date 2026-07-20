// ── Static-analysis entry point (AxeBuilder-style) ─────────────────────────────
export { ClippyValidations, toKebabId } from './analyze';
export { SEVERITY_ORDER, assertNoViolations, countBySeverity, formatViolations, hasSeverityAtLeast } from './reporter';

// ── Low-level detection API (framework-agnostic) ───────────────────────────────
export { runValidation, getActiveValidators } from './validators';
export { blockValidatorMap } from './validators/block';
export { inlineValidatorMap } from './validators/inline';
export {
  documentValidatorObject,
  documentMustHaveCorrectHeadingOrder,
  documentMustHaveSingleHeadingOne,
  documentMustHaveTopLevelHeadingOne,
} from './validators/document';

export { blockValidations, documentValidations, inlineValidations, validationSeverity } from './constants';
export { isEmptyOrWhitespace, getParagraphLinesFromDOM, orderedListIndicator, unorderedListIndicator } from './helpers';
export { validationMessages } from './messages';

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  AnalysisResult,
  ContentValidator,
  DocumentValidator,
  HeadingLevel,
  TipPayload,
  ValidationResult,
  ValidationScope,
  ValidationSeverity,
  ValidatorSettings,
  Violation,
  ViolationNode,
} from './types';
export type { ValidationKey, ValidationMessage } from './messages';
