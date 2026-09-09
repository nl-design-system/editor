import { hasAltText } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { imageValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * No `correct`: only the author knows what the image conveys. The editor opens its image dialog here,
 * which needs an editing surface this package does not have.
 */
export const imageMustHaveAltText = defineValidation({
  condition: hasAltText,
  messages,
  rule: imageValidationRules.IMAGE_MUST_HAVE_ALT_TEXT,
  scope: 'block',
  selector: selectors.IMAGE,
  severity: validationSeverity.INFO,
});
