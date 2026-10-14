import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not, or } from '../../../utils/combinators.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { resemblesHeading } from '../should-not-resemble-heading/index.ts';
import { isEntirelyBold } from '../utils.ts';
import { messages } from './messages.ts';

const isNotEntirelyBold = not(isEntirelyBold);

/** A bold paragraph that reads as a heading is left to `PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING`. */
export const paragraphShouldNotBeEntirelyBold = defineValidation({
  condition: or(isNotEntirelyBold, resemblesHeading),
  correction: {
    execute: (paragraph) => () => paragraph.querySelectorAll(selectors.BOLD).forEach(unwrapElement),
  },
  documentationId: 'd9c53eaf-16dd-42eb-bcc4-7d9f97283309',
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
  scope: 'element',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
