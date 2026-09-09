export { selectors, validationSeverity } from './consts/index.ts';
export { defineValidation } from './define-validation.ts';
export { coreValidationRules, coreValidations } from './components/index.ts';
export type { CoreValidationRule } from './components/index.ts';
export { containsEmphasis, hasAltText, hasTextContent, isEntirelyBold, resemblesListItem } from './conditions/index.ts';
export { and, not, or } from './utils/combinators.ts';
export {
  changeTagName,
  hasHeadingLength,
  headingLevel,
  precedingHeading,
  precedingMatch,
  textLines,
  trimmedText,
  unwrapElement,
  visibleTextNodes,
} from './utils/dom.ts';
export { isEmptyOrWhitespace } from './utils/text.ts';
export { Validator } from './validator.ts';
export type { ValidateOptions, ValidatorOptions } from './validator.ts';
export type { Locale, ResolvedMessages, ValidationMessages, ValidationMessagesByLocale } from './types/messages.ts';
export type { CoreSelector, ElementFor, Selector } from './types/selector.ts';
export type {
  CorrectValidationFunction,
  ValidationCondition,
  Validation,
  ValidationDefinition,
  ValidationPayload,
  ValidationScope,
  ValidationSeverity,
  Violation,
} from './types/validation.ts';
