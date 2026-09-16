import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { emptyTerms, hasFilledDescription } from '../terms.ts';
import { messages } from './messages.ts';

const emptyTermsWithDescription = (list: HTMLElement): HTMLElement[] => emptyTerms(list).filter(hasFilledDescription);

export const descriptionTermMustHaveDescription = defineValidation({
  condition: (list) => emptyTermsWithDescription(list).length === 0,
  correct: (list) => () => {
    for (const term of emptyTermsWithDescription(list)) term.textContent = '...';
  },
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION,
  scope: 'element',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.ERROR,
});
