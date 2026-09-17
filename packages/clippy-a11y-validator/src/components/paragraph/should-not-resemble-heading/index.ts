import type { ValidationCondition } from '../../../types/validation.ts';
import { isEntirelyBold } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { trimmedText } from '../../../utils/dom.ts';
import { expectedHeadingLevel, hasHeadingLength } from '../../../utils/heading.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/** Short, entirely bold text reads as a heading rather than as prose. */
export const resemblesHeading: ValidationCondition = (paragraph, root) =>
  isEntirelyBold(paragraph, root) && hasHeadingLength(paragraph);

export const paragraphShouldNotResembleHeading = defineValidation({
  condition: not(resemblesHeading),
  correct: (paragraph, root) => () => {
    const heading = paragraph.ownerDocument.createElement(`h${expectedHeadingLevel(paragraph, root)}`);
    heading.textContent = trimmedText(paragraph);
    paragraph.replaceWith(heading);
  },
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
  scope: 'block',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
