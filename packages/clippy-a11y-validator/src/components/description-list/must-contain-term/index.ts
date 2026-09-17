import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { ownTerms } from '../../../utils/description-list.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const descriptionListMustContainTerm = defineValidation({
  condition: (list, root) => {
    const terms = ownTerms(list);

    return terms.length === 0 || terms.some((term) => hasTextContent(term, root));
  },
  // Marks the term as still to be written, rather than inventing copy for it.
  correct: (list, root) => () => {
    const empty = ownTerms(list).find((term) => !hasTextContent(term, root));
    if (empty) empty.textContent = '...';
  },
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_LIST_MUST_CONTAIN_TERM,
  scope: 'block',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.ERROR,
});
