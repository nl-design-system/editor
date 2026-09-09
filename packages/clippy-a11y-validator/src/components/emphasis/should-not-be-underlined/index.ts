import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { emphasisValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/** Underlined text reads as a link, so a `u` element is never acceptable and the condition never holds. */
export const emphasisShouldNotBeUnderlined = defineValidation({
  condition: () => false,
  correct: (underline) => () => unwrapElement(underline),
  messages,
  rule: emphasisValidationRules.EMPHASIS_SHOULD_NOT_BE_UNDERLINED,
  scope: 'inline',
  selector: selectors.UNDERLINE,
  severity: validationSeverity.INFO,
});
