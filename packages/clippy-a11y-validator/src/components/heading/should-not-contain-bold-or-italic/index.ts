import { containsEmphasis } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const headingShouldNotContainBoldOrItalic = defineValidation({
  condition: not(containsEmphasis),
  correct: (heading) => () => heading.querySelectorAll(`${selectors.BOLD}, ${selectors.ITALIC}`).forEach(unwrapElement),
  messages,
  rule: headingValidationRules.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC,
  scope: 'block',
  selector: selectors.HEADING,
  severity: validationSeverity.INFO,
});
