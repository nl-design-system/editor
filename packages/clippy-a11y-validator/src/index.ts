export { selectors, validationSeverity } from './consts/index.ts';
export { defineValidation } from './define-validation.ts';
export { coreValidationRules, coreValidations } from './components/index.ts';
export type { CoreValidationRule } from './components/index.ts';
export { hasTextContent } from './utils/content.ts';
export { hasAltText } from './components/image/utils.ts';
export { isEntirelyBold, resemblesListItem } from './components/paragraph/utils.ts';
export { and, not, or } from './utils/combinators.ts';
export {
  changeTagName,
  ownDescendants,
  precedingMatch,
  textLines,
  trimmedText,
  unwrapElement,
  visibleTextNodes,
} from './utils/dom.ts';
export {
  containsEmphasis,
  expectedHeadingLevel,
  hasHeadingLength,
  headingLevel,
  precedingHeading,
} from './components/heading/utils.ts';
export { hasHeaderColumn, hasHeaderRow, tableRows } from './components/table/utils.ts';
export { isEmptyOrWhitespace } from './utils/text.ts';
export { Validator } from './validator.ts';
export type { ValidatorConstructorOptions, ValidatorRunOptions } from './validator.ts';
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
