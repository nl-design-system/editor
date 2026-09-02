import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { isNotEntirelyBold } from '../../../rules/index.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationCodes } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotBeEntirelyBold = defineValidation({
  code: paragraphValidationCodes.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
  correct: (paragraph) => () => paragraph.querySelectorAll(selectors.BOLD).forEach(unwrapElement),
  messages,
  rule: isNotEntirelyBold,
  scope: 'block',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
