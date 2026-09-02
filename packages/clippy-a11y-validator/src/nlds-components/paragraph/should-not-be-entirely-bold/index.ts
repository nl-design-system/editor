import type { Validator } from '../../../types.ts';
import { validationSeverity } from '../../../constants.ts';
import { hasTextContent } from '../../../helpers.ts';
import { paragraphValidations } from '../constants.ts';
import { correctEntirelyBoldParagraph } from './corrector.ts';
import { isNotEntirelyBold } from './rules.ts';

export const paragraphShouldNotBeEntirelyBold: Validator = {
  conditions: [hasTextContent],
  correct: correctEntirelyBoldParagraph,
  rules: [isNotEntirelyBold],
  scope: 'block',
  selector: 'p',
  severity: validationSeverity.WARNING,
  validatorKey: paragraphValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
};
