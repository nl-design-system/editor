import type { ValidationResult } from '../../../types.ts';
import { validationSeverity } from '../../../constants.ts';
import { paragraphValidations } from '../constants.ts';
import { correctEntirelyBoldParagraph } from './corrector.ts';
import { isEntirelyBoldParagraph } from './rules.ts';

export const paragraphShouldNotBeEntirelyBold = (element: HTMLParagraphElement): ValidationResult | null => {
  if (!isEntirelyBoldParagraph(element)) return null;
  return {
    correct: correctEntirelyBoldParagraph(element),
    element,
    scope: 'block',
    severity: validationSeverity.WARNING,
    validatorKey: paragraphValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
  };
};
