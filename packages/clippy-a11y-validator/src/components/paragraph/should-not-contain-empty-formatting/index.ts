import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotContainEmptyFormatting = defineValidation({
  condition: hasTextContent,
  correct: (formatting) => () => formatting.remove(),
  messages,
  payload: (formatting) => ({ tag: formatting.tagName.toLowerCase() }),
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING,
  scope: 'inline',
  selector: selectors.PARAGRAPH_FORMATTING,
  severity: validationSeverity.WARNING,
});
