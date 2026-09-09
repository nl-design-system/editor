import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { emphasisValidationRules, emphasisVariant } from '../constants.ts';
import { messages } from './messages.ts';

export const emphasisShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  correct: (emphasis) => () => emphasis.remove(),
  messages,
  payload: (emphasis) => ({ variant: emphasisVariant(emphasis) }),
  rule: emphasisValidationRules.EMPHASIS_SHOULD_NOT_BE_EMPTY,
  scope: 'inline',
  selector: selectors.EMPHASIS,
  severity: validationSeverity.WARNING,
});
