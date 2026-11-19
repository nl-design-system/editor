import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { unorderedListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const unorderedListItemShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  corrections: [
    {
      execute: (item) => () => item.remove(),
      label: { en: 'Remove empty list item', nl: 'Leeg lijst-item verwijderen' },
    },
  ],
  documentationId: 'bfba7c3e-c172-43bd-9c45-e4e1699e3b8d',
  messages,
  rule: unorderedListValidationRules.UNORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.UNORDERED_LIST_ITEM,
  severity: validationSeverity.INFO,
});
