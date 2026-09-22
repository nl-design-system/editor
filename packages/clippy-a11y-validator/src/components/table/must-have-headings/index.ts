import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName } from '../../../utils/dom.ts';
import { tableValidationRules } from '../constants.ts';
import { hasHeaderColumn, hasHeaderRow, tableRows } from '../utils.ts';
import { messages } from './messages.ts';

export const tableMustHaveHeadings = defineValidation({
  condition: (table) => tableRows(table).length === 0 || hasHeaderRow(table) || hasHeaderColumn(table),
  correct: (table) => () => {
    const [firstRow] = tableRows(table);
    if (!firstRow) return;
    // `changeTagName` swaps each cell in place, so the live collection keeps its length while iterating.
    for (const cell of firstRow.children) changeTagName(cell, 'th');
  },
  messages,
  rule: tableValidationRules.TABLE_MUST_HAVE_HEADINGS,
  scope: 'element',
  selector: selectors.TABLE,
  severity: validationSeverity.WARNING,
});
