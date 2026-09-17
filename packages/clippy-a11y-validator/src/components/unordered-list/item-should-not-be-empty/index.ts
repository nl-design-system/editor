import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { unorderedListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const unorderedListItemShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  correct: (item) => () => item.remove(),
  messages,
  rule: unorderedListValidationRules.UNORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.UNORDERED_LIST_ITEM,
  severity: validationSeverity.INFO,
});
