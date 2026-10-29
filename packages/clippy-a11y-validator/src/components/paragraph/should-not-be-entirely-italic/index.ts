import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { isEntirelyItalic } from '../utils.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotBeEntirelyItalic = defineValidation({
  condition: not(isEntirelyItalic),
  correction: {
    execute: (paragraph) => () => paragraph.querySelectorAll(selectors.ITALIC).forEach(unwrapElement),
  },
  documentationId: 'aeb01c78-8633-47bc-8fff-7aa1eec10130',
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_ITALIC,
  scope: 'element',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
