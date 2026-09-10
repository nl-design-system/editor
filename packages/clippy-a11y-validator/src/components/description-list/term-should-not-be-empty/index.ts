import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { emptyTerms, hasFilledDescription } from '../terms.ts';
import { messages } from './messages.ts';

const emptyTermsWithoutDescription = (list: HTMLElement): HTMLElement[] =>
  emptyTerms(list).filter((term) => !hasFilledDescription(term));

export const descriptionTermShouldNotBeEmpty = defineValidation({
  condition: (list) => emptyTermsWithoutDescription(list).length === 0,
  correct: (list) => () => {
    for (const term of emptyTermsWithoutDescription(list)) term.remove();
  },
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.INFO,
});
