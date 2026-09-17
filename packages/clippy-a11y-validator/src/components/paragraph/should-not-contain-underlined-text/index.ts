import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/** Underlined text reads as a link, so a `u` element is never acceptable and the condition never holds. */
export const paragraphShouldNotContainUnderlinedText = defineValidation({
  condition: () => false,
  correct: (underline) => () => unwrapElement(underline),
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_UNDERLINED_TEXT,
  scope: 'inline',
  selector: selectors.PARAGRAPH_UNDERLINE,
  severity: validationSeverity.INFO,
});
