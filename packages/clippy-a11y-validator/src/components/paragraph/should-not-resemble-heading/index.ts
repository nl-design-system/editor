import type { ValidationCondition } from '../../../types/validation.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { hasHeadingLength } from '../../heading/utils.ts';
import { paragraphValidationRules } from '../constants.ts';
import { isEntirelyBold, replaceWithHeading } from '../utils.ts';
import { messages } from './messages.ts';

/** Short, entirely bold text reads as a heading rather than as prose. */
export const resemblesHeading: ValidationCondition = (paragraph) =>
  isEntirelyBold(paragraph) && hasHeadingLength(paragraph);

export const paragraphShouldNotResembleHeading = defineValidation({
  condition: not(resemblesHeading),
  corrections: [
    {
      execute: (paragraph, context) => () => replaceWithHeading(paragraph, context),
    },
  ],
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
  scope: 'document',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
