import { hasTextContent } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { tableValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * No `correct`: removing a cell would leave the row shorter than the rest of the table. The editor puts
 * the caret in the cell instead, which needs an editing surface this package does not have.
 */
export const tableCellShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  messages,
  rule: tableValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY,
  scope: 'block',
  selector: selectors.TABLE_CELL,
  severity: validationSeverity.INFO,
});
