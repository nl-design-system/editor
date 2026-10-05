import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { tableValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * No `correction`: an empty caption still names the table for assistive technology once filled in, so
 * removing it is the wrong fix, and only the author can provide the text.
 */
export const tableCaptionShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  messages,
  rule: tableValidationRules.TABLE_CAPTION_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.TABLE_CAPTION,
  severity: validationSeverity.INFO,
});
