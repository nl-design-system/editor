import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotContainEmptyFormatting = defineValidation({
  condition: hasTextContent,
  correct: (paragraph) => () => paragraph.remove(),
  messages,
  payload: (paragraph) => ({ tag: paragraph.tagName.toLowerCase() }),
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING,
  scope: 'element',
  selector: selectors.PARAGRAPH_FORMATTING,
  severity: validationSeverity.WARNING,
});
