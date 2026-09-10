import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { hasFilledDescription, isEmptyTerm, ownTerms } from '../utils.ts';
import { messages } from './messages.ts';

const emptyTermsWithoutDescription = (list: HTMLDListElement): HTMLElement[] =>
  ownTerms(list).filter((term) => isEmptyTerm(term) && !hasFilledDescription(term));

export const descriptionTermShouldNotBeEmpty = defineValidation({
  condition: (list) => emptyTermsWithoutDescription(list).length === 0,
  correct: (list) => () => emptyTermsWithoutDescription(list).forEach((term) => term.remove()),
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.INFO,
});
