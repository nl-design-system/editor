import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName } from '../../../utils/dom.ts';
import { tableValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

const rows = (table: HTMLTableElement): HTMLTableRowElement[] => [
  ...table.querySelectorAll<HTMLTableRowElement>(selectors.TABLE_ROW),
];

const hasHeaderRow = (table: HTMLTableElement): boolean => {
  const [firstRow] = rows(table);

  return firstRow !== undefined && [...firstRow.children].every((cell) => cell.tagName === 'TH');
};

const hasHeaderColumn = (table: HTMLTableElement): boolean =>
  rows(table).every((row) => row.firstElementChild?.tagName === 'TH');

export const tableMustHaveHeadings = defineValidation({
  condition: (table) => rows(table).length === 0 || hasHeaderRow(table) || hasHeaderColumn(table),
  correct: (table) => () => {
    const [firstRow] = rows(table);
    if (!firstRow) return;
    // Snapshot the children: `changeTagName` replaces each cell, which mutates the live collection.
    for (const cell of [...firstRow.children]) changeTagName(cell, 'th');
  },
  messages,
  rule: tableValidationRules.TABLE_MUST_HAVE_HEADINGS,
  scope: 'block',
  selector: selectors.TABLE,
  severity: validationSeverity.WARNING,
});
