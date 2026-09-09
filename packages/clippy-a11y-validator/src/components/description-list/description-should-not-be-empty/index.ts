import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { descriptionListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const descriptionShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  correct: (description) => () => description.remove(),
  messages,
  rule: descriptionListValidationRules.DESCRIPTION_SHOULD_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.DESCRIPTION_DETAILS,
  severity: validationSeverity.INFO,
});
