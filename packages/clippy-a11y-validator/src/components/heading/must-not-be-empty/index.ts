import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const headingMustNotBeEmpty = defineValidation({
  condition: hasTextContent,
  correct: (heading) => () => heading.remove(),
  messages,
  rule: headingValidationRules.HEADING_MUST_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.HEADING,
  severity: validationSeverity.ERROR,
});
