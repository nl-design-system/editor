import type { ValidationCondition } from '../../../types/validation.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { trimmedText } from '../../../utils/dom.ts';
import { expectedHeadingLevel, hasHeadingLength } from '../../heading/utils.ts';
import { paragraphValidationRules } from '../constants.ts';
import { isEntirelyBold } from '../utils.ts';
import { messages } from './messages.ts';

/** Short, entirely bold text reads as a heading rather than as prose. */
export const resemblesHeading: ValidationCondition = (paragraph) =>
  isEntirelyBold(paragraph) && hasHeadingLength(paragraph);

export const paragraphShouldNotResembleHeading = defineValidation({
  condition: not(resemblesHeading),
  correct: (paragraph, context) => () => {
    const heading = paragraph.ownerDocument.createElement(`h${expectedHeadingLevel(context)}`);
    heading.textContent = trimmedText(paragraph);
    paragraph.replaceWith(heading);
  },
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
  scope: 'page',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
