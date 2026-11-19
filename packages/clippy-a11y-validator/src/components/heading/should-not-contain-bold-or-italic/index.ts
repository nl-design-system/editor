import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { containsEmphasis } from '../utils.ts';
import { messages } from './messages.ts';

export const headingShouldNotContainBoldOrItalic = defineValidation({
  condition: not(containsEmphasis),
  corrections: [
    {
      execute: (heading) => () =>
        heading.querySelectorAll(`${selectors.BOLD}, ${selectors.ITALIC}`).forEach(unwrapElement),
    },
  ],
  documentationId: 'e012b43e-e5bc-415e-b520-40ee857b7c9d',
  messages,
  rule: headingValidationRules.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC,
  scope: 'element',
  selector: selectors.HEADING,
  severity: validationSeverity.INFO,
});
