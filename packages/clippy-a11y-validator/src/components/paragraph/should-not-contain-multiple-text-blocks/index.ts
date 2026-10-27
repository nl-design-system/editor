import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { paragraphValidationRules } from '../constants.ts';
import { textBlocks } from '../utils.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotContainMultipleTextBlocks = defineValidation({
  condition: (paragraph) => textBlocks(paragraph).length <= 1,
  documentationId: '70e82a45-5dad-4615-b1b2-cc4c6b6a7e89',
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_MULTIPLE_TEXT_BLOCKS,
  scope: 'element',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
