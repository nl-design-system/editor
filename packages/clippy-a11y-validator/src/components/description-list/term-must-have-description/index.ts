import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { isEmptyOrWhitespace } from '../../../utils/text.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/** A description with content but no term of its own leaves the pair unreadable. */
export const descriptionTermMustHaveDescription = defineValidation({
  condition: (term, root) => {
    if (hasTextContent(term, root)) return true;

    const description = term.nextElementSibling;

    return description?.tagName !== 'DD' || isEmptyOrWhitespace(description.textContent ?? '');
  },
  // Marks the term as still to be written, rather than inventing copy for it.
  correct: (term) => () => {
    term.textContent = '...';
  },
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION,
  scope: 'block',
  selector: selectors.DESCRIPTION_TERM,
  severity: validationSeverity.ERROR,
});
