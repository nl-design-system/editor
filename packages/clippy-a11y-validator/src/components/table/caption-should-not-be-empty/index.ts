import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { tableValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * No `correct`: an empty caption still names the table for assistive technology once filled in, so
 * removing it is the wrong fix. The editor puts the caret in the caption instead.
 */
export const tableCaptionShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  messages,
  rule: tableValidationRules.TABLE_CAPTION_SHOULD_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.TABLE_CAPTION,
  severity: validationSeverity.INFO,
});
