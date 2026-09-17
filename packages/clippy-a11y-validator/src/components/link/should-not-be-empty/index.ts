import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { linkValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const linkShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  correct: (link) => () => link.remove(),
  messages,
  rule: linkValidationRules.LINK_SHOULD_NOT_BE_EMPTY,
  scope: 'inline',
  selector: selectors.LINK,
  severity: validationSeverity.WARNING,
});
