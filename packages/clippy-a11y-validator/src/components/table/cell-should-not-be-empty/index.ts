import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { tableValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * No `correction`: removing the cell would leave the row shorter than the rest of the table, and only
 * the author can decide its content.
 */
export const tableCellShouldNotBeEmpty = defineValidation({
  condition: hasTextContent,
  messages,
  rule: tableValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.TABLE_CELL,
  severity: validationSeverity.INFO,
});
