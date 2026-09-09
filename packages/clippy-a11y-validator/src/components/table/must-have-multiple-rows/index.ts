import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { tableValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

const MINIMUM_ROWS = 2;

export const tableMustHaveMultipleRows = defineValidation({
  condition: (table) => table.querySelectorAll(selectors.TABLE_ROW).length >= MINIMUM_ROWS,
  correct: (table) => () => {
    const firstRow = table.querySelector(selectors.TABLE_ROW);
    if (!firstRow) return;

    const row = table.ownerDocument.createElement('tr');
    for (let index = 0; index < firstRow.children.length; index += 1) {
      row.append(table.ownerDocument.createElement('td'));
    }

    (table.querySelector('tbody') ?? table).append(row);
  },
  messages,
  rule: tableValidationRules.TABLE_MUST_HAVE_MULTIPLE_ROWS,
  scope: 'block',
  selector: selectors.TABLE,
  severity: validationSeverity.WARNING,
});
