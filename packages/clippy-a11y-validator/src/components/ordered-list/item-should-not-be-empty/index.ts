import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { orderedListValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const orderedListItemShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  corrections: [
    {
      execute: (item) => () => item.remove(),
      label: { en: 'Remove empty list item', nl: 'Leeg lijst-item verwijderen' },
      solutionId: 'b3e08e74-4aef-474f-abd6-6068ecbf7e72',
    },
  ],
  documentationId: 'd7c09976-3560-4e91-adcb-f2f97221cf65',
  messages,
  rule: orderedListValidationRules.ORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.ORDERED_LIST_ITEM,
  severity: validationSeverity.INFO,
});
