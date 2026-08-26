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
  collectTreeValidations,
  runValidators,
} from './detection';
export { contentValidators, treeValidators } from './components';

// ── Per-component validators ───────────────────────────────────────────────────
export {
  headingContentValidators,
  headingTreeValidators,
  headingMustHaveCorrectOrder,
  headingOneMustBeUnique,
  headingOneMustBeFirst,
} from './components/heading';
export { paragraphContentValidators, paragraphMustUseSemanticList } from './components/paragraph';
export { linkContentValidators } from './components/link';
export { imageContentValidators } from './components/image';
export { tableContentValidators } from './components/table';
export { definitionListContentValidators } from './components/definition-list';
export { richTextContentValidators } from './components/rich-text-content';

// ── Per-component rules (pure predicates, reusable in custom validators) ───────
export {
  findHeadingOrderOffenses,
  findMisplacedTopLevelHeading,
  findRepeatedHeadingOnes,
  hasFormattingInsideHeading,
  headingLevelOf,
  isEmptyHeading,
  isHeading,
} from './components/heading/rules';
export {
  detectListLikeParagraph,
  isEntirelyBoldParagraph,
  isParagraph,
  resemblesHeading,
} from './components/paragraph/rules';
export { hasGenericLinkText } from './components/link/rules';
export { isMissingAltText } from './components/image/rules';
export { hasHeaderColumn, hasHeaderRow, hasSingleRow, isTable, lacksTableHeaders } from './components/table/rules';
export { hasOnlyEmptyTerms, isEmptyTermWithDescription } from './components/definition-list/rules';
export { emptyBlockNodeType, emptyInlineType, isUnderlined } from './components/rich-text-content/rules';

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
export { validationKeys, validationMessages } from './messages';

// ── Translations (rosetta) ─────────────────────────────────────────────────────
export { DEFAULT_LOCALE, translator, validationContext } from './i18n';
export { en } from './locales/en';
export { nl } from './locales/nl';

// ── Editor/browser adapter (Range-keyed map + corrections) ─────────────────────
export { buildValidationMap } from './validation-map';

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  ValidationReport,
  ContentValidator,
  CorrectValidationFunction,
  HeadingLevel,
  ImageAltTextRequest,
  TreeValidator,
  ValidationMapResult,
  ValidationResult,
  ValidationContext,
  ValidationScope,
  ValidationSeverity,
  ValidatorSettings,
  ValidationItem,
  ValidationItemNode,
  Locale,
  ValidationTranslations,
  Solution,
  SolutionParams,
  Translate,
} from './types';
export type { HeadingOrderOffense, HeadingOrderProblem } from './components/heading/rules';
export type { ListLikeParagraph } from './components/paragraph/rules';
export type { ValidationKey, ValidationMessage } from './messages';
