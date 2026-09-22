import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { tableValidationRules } from '../constants.ts';
import { tableRows } from '../utils.ts';
import { messages } from './messages.ts';

const MINIMUM_ROWS = 2;

export const tableMustHaveMultipleRows = defineValidation({
  condition: (table) => tableRows(table).length >= MINIMUM_ROWS,
  correct: (table) => () => {
    const [firstRow] = tableRows(table);
    if (!firstRow) return;

    const row = table.ownerDocument.createElement('tr');
    row.append(...Array.from(firstRow.children, () => table.ownerDocument.createElement('td')));

    (table.querySelector('tbody') ?? table).append(row);
  },
  messages,
  rule: tableValidationRules.TABLE_MUST_HAVE_MULTIPLE_ROWS,
  scope: 'element',
  selector: selectors.TABLE,
  severity: validationSeverity.WARNING,
});
