import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const descriptionShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  corrections: [
    {
      execute: (description) => () => description.remove(),
      label: { en: 'Remove empty description', nl: 'Lege beschrijving verwijderen' },
      solutionId: 'd6dd1429-6250-449b-8c14-f85729278d43',
    },
  ],
  documentationId: 'd43d4831-2d06-460a-980d-d52f4b18e3b6',
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.DESCRIPTION_DETAILS,
  severity: validationSeverity.INFO,
});
