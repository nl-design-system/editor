import type { ValidationCondition } from '../../../types/validation.ts';
import { isEntirelyBold } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { hasHeadingLength, nextHeadingLevel, trimmedText } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const resemblesHeading: ValidationCondition = (paragraph) =>
  isEntirelyBold(paragraph) && hasHeadingLength(paragraph);

export const paragraphShouldNotResembleHeading = defineValidation({
  condition: not(resemblesHeading),
  correct:
    (paragraph, { precedingMatches }) =>
    () => {
      const heading = paragraph.ownerDocument.createElement(
        `h${nextHeadingLevel(precedingMatches(selectors.HEADING)[0] ?? null)}`,
      );
      heading.textContent = trimmedText(paragraph);
      paragraph.replaceWith(heading);
    },
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
  scope: 'page',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
