import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { emptyTermsWithoutDescription } from '../utils.ts';
import { messages } from './messages.ts';

export const descriptionTermShouldNotBeEmpty = defineValidation({
  condition: (list) => emptyTermsWithoutDescription(list).length === 0,
  corrections: [
    {
      execute: (list) => () => emptyTermsWithoutDescription(list).forEach((term) => term.remove()),
      label: { en: 'Remove empty terms', nl: 'Lege termen verwijderen' },
      solutionId: 'adc9814f-48f3-43f9-934f-d7e12a4b77a5',
    },
  ],
  documentationId: '17fb0798-7a0a-4900-b963-1cbb77cdcc7b',
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.DESCRIPTION_LIST,
  severity: validationSeverity.INFO,
});
