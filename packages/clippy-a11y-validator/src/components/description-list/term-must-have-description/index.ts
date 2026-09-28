import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { emptyTermsWithDescription } from '../utils.ts';
import { messages } from './messages.ts';

export const descriptionTermMustHaveDescription = defineValidation({
  condition: (list) => emptyTermsWithDescription(list).length === 0,
  // Marks the terms as still to be written, rather than inventing copy for them.
  correct: (list) => () =>
    emptyTermsWithDescription(list).forEach((term) => {
      term.textContent = '...';
    }),
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION,
  scope: 'element',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.ERROR,
});
