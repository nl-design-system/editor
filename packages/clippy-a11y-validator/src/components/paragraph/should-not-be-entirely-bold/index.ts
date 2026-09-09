import { isEntirelyBold } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not, or } from '../../../utils/combinators.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { resemblesHeading } from '../should-not-resemble-heading/index.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotBeEntirelyBold = defineValidation({
  condition: or(not(isEntirelyBold), resemblesHeading),
  correct: (paragraph) => () => paragraph.querySelectorAll(selectors.BOLD).forEach(unwrapElement),
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
  scope: 'block',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
