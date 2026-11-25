import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { ownTerms } from '../utils.ts';
import { messages } from './messages.ts';

export const descriptionListMustContainTerm = defineValidation({
  condition: (list) => {
    const terms = ownTerms(list);

    return terms.length === 0 || terms.some((term) => hasTextContent(term));
  },
  // Marks the term as still to be written, rather than inventing copy for it.
  corrections: [
    {
      execute: (list) => () => {
        const empty = ownTerms(list).find((term) => !hasTextContent(term));
        if (empty) empty.textContent = '...';
      },
      label: { en: 'Add placeholder term', nl: 'Tijdelijke term toevoegen' },
      solutionId: '28c47937-b5bd-4993-9f0a-023fc0af52ee',
    },
  ],
  documentationId: '5ee9f34a-f0ae-43cf-a99f-08d69ebae5b6',
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_LIST_MUST_CONTAIN_TERM,
  scope: 'element',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.ERROR,
});
