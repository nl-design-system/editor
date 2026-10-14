import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  documentationId: 'a023d975-1365-4057-bb23-d4c23bb52784',
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
