import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName } from '../../../utils/dom.ts';
import { tableValidationRules } from '../constants.ts';
import { hasHeaderColumn, hasHeaderRow, tableRows } from '../utils.ts';
import { messages } from './messages.ts';

export const tableMustHaveHeadings = defineValidation({
  condition: (table) => tableRows(table).length === 0 || hasHeaderRow(table) || hasHeaderColumn(table),
  corrections: [
    {
      execute: (table) => () => {
        const [firstRow] = tableRows(table);
        if (!firstRow) return;
        // `changeTagName` swaps each cell in place, so the live collection keeps its length while iterating.
        for (const cell of firstRow.children) changeTagName(cell, 'th');
      },
      label: { en: 'Make first row a header row', nl: 'Eerste rij omzetten naar koprij' },
      solutionId: '91905c23-3668-49a3-8cc0-856dc8ddf42e',
    },
  ],
  documentationId: 'ce51022e-eff9-454c-97ec-9c19ff86c18b',
  messages,
  rule: tableValidationRules.TABLE_MUST_HAVE_HEADINGS,
  scope: 'element',
  selector: selectors.TABLE,
  severity: validationSeverity.WARNING,
});
