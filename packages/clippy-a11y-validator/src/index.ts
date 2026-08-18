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
  contentValidators,
  treeValidators,
  collectContentValidations,
  collectTreeValidations,
  runValidators,
} from './validators';

// ── Per-component validators ───────────────────────────────────────────────────
export {
  headingContentValidators,
  headingTreeValidators,
  headingMustHaveCorrectOrder,
  headingOneMustBeUnique,
  headingOneMustBeFirst,
} from './validators/heading';
export { paragraphContentValidators, paragraphMustUseSemanticList } from './validators/paragraph';
export { linkContentValidators } from './validators/link';
export { imageContentValidators } from './validators/image';
export { tableContentValidators } from './validators/table';
export { definitionListContentValidators } from './validators/definition-list';
export { richTextContentValidators } from './validators/rich-text-content';

// ── Rule ids, grouped by NL Design System component ────────────────────────────
export {
  headingValidations,
  paragraphValidations,
  linkValidations,
  imageValidations,
  tableValidations,
  definitionListValidations,
  richTextContentValidations,
  validations,
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
  HeadingLevel,
  ImageAltTextRequest,
  SolutionPayload,
  TreeValidator,
  ValidationMapResult,
  ValidationResult,
  ValidationScope,
  ValidationSeverity,
  ValidatorSettings,
  ValidationItem,
  ValidationItemNode,
} from './types';
export type { ValidationKey, ValidationMessage } from './messages';
