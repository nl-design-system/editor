import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { isEmptyOrWhitespace } from '../../../utils/text.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * Deliberately silent when the term has a description with content: that is
 * `DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION`, which fills the term in rather than removing it. Letting both
 * rules fire would offer the author two opposite fixes for one term, and `--fix` would apply both.
 */
export const descriptionTermShouldNotBeEmpty = defineValidation({
  condition: (term, root) => {
    if (hasTextContent(term, root)) return true;

    const description = term.nextElementSibling;

    return description?.tagName === 'DD' && !isEmptyOrWhitespace(description.textContent ?? '');
  },
  correct: (term) => () => term.remove(),
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.DESCRIPTION_TERM,
  severity: validationSeverity.INFO,
});
