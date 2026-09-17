import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { orderedListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const orderedListItemShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  correct: (item) => () => item.remove(),
  messages,
  rule: orderedListValidationRules.ORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.ORDERED_LIST_ITEM,
  severity: validationSeverity.INFO,
});
