import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { hasFilledDescription, isEmptyTerm, ownTerms } from '../utils.ts';
import { messages } from './messages.ts';

const unnamedPairs = (list: HTMLDListElement): HTMLElement[] =>
  ownTerms(list).filter((term) => isEmptyTerm(term) && hasFilledDescription(term));

export const descriptionTermMustHaveDescription = defineValidation({
  condition: (list) => unnamedPairs(list).length === 0,
  // Marks the terms as still to be written, rather than inventing copy for them.
  correct: (list) => () =>
    unnamedPairs(list).forEach((term) => {
      term.textContent = '...';
    }),
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION,
  scope: 'element',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.ERROR,
});
