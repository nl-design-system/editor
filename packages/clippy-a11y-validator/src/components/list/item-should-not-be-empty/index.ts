import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { listValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const listItemShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  correct: (item) => () => item.remove(),
  messages,
  rule: listValidationRules.LIST_ITEM_SHOULD_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.LIST_ITEM,
  severity: validationSeverity.INFO,
});
