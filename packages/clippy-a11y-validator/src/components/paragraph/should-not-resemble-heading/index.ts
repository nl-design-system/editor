import type { ValidationCondition } from '../../../types/validation.ts';
import { isEntirelyBold } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { hasHeadingLength, headingLevel, precedingHeading, trimmedText } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

const MAX_HEADING_LEVEL = 6;

/** Short, entirely bold text reads as a heading rather than as prose. */
export const resemblesHeading: ValidationCondition = (paragraph, root) =>
  isEntirelyBold(paragraph, root) && hasHeadingLength(paragraph);

/** A heading one level below the nearest preceding heading, so the paragraph slots into the outline. */
const targetLevel = (paragraph: HTMLElement, root: ParentNode): number => {
  const preceding = precedingHeading(paragraph, root);

  return preceding === null ? 1 : Math.min(headingLevel(preceding) + 1, MAX_HEADING_LEVEL);
};

export const paragraphShouldNotResembleHeading = defineValidation({
  condition: not(resemblesHeading),
  correct: (paragraph, root) => () => {
    const heading = paragraph.ownerDocument.createElement(`h${targetLevel(paragraph, root)}`);
    heading.textContent = trimmedText(paragraph);
    paragraph.replaceWith(heading);
  },
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
  scope: 'block',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
