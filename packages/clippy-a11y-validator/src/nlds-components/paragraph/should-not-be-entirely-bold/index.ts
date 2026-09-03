import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { isNotEntirelyBold } from '../../../rules/index.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationKeys } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotBeEntirelyBold = defineValidation({
  correct: (paragraph) => () => paragraph.querySelectorAll(selectors.BOLD).forEach(unwrapElement),
  key: paragraphValidationKeys.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
  messages,
  rule: isNotEntirelyBold,
  scope: 'block',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
