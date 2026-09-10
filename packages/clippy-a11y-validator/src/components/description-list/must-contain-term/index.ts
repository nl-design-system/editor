import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { emptyTerms, ownTerms } from '../terms.ts';
import { messages } from './messages.ts';

export const descriptionListMustContainTerm = defineValidation({
  condition: (list) => {
    const terms = ownTerms(list);

    return terms.length === 0 || emptyTerms(list).length < terms.length;
  },
  // Marks the term as still to be written, rather than inventing copy for it.
  correct: (list) => () => {
    const [empty] = emptyTerms(list);
    if (empty) empty.textContent = '...';
  },
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_LIST_MUST_CONTAIN_TERM,
  scope: 'element',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.ERROR,
});
