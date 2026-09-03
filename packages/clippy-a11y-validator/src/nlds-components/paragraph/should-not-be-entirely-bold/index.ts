import { isNotEntirelyBold } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotBeEntirelyBold = defineValidation({
  condition: isNotEntirelyBold,
  correct: (paragraph) => () => paragraph.querySelectorAll(selectors.BOLD).forEach(unwrapElement),
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
  scope: 'block',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
