import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
