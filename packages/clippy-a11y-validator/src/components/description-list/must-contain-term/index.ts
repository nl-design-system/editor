import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { isEmptyOrWhitespace } from '../../../utils/text.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/** Terms belonging to this list rather than to a nested one. */
const ownTerms = (list: HTMLDListElement): HTMLElement[] =>
  [...list.querySelectorAll<HTMLElement>(selectors.DESCRIPTION_TERM)].filter(
    (term) => term.closest(selectors.DESCRIPTION_LIST) === list,
  );

const hasText = (element: HTMLElement): boolean => !isEmptyOrWhitespace(element.textContent ?? '');

export const descriptionListMustContainTerm = defineValidation({
  condition: (list) => {
    const terms = ownTerms(list);

    return terms.length === 0 || terms.some(hasText);
  },
  // Marks the term as still to be written, rather than inventing copy for it.
  correct: (list) => () => {
    const empty = ownTerms(list).find((term) => !hasText(term));
    if (empty) empty.textContent = '...';
  },
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_LIST_MUST_CONTAIN_TERM,
  scope: 'block',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.ERROR,
});
