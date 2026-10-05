import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const headingMustNotBeEmpty = defineValidation({
  condition: hasTextContent,
  correction: {
    execute: (heading) => () => heading.remove(),
  },
  messages,
  rule: headingValidationRules.HEADING_MUST_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.HEADING,
  severity: validationSeverity.ERROR,
});
