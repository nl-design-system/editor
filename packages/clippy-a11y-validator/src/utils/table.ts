import { selectors } from '../consts/selectors.ts';

export const tableRows = (table: HTMLTableElement): HTMLTableRowElement[] => [
  ...table.querySelectorAll<HTMLTableRowElement>(selectors.TABLE_ROW),
];

/** True when the first row consists entirely of header cells, which labels the columns. */
export const hasHeaderRow = (table: HTMLTableElement): boolean => {
  const [firstRow] = tableRows(table);

  return firstRow !== undefined && [...firstRow.children].every((cell) => cell.matches(selectors.TABLE_HEADER));
};

/** True when every row opens with a header cell, which labels the rows. */
export const hasHeaderColumn = (table: HTMLTableElement): boolean =>
  tableRows(table).every((row) => row.firstElementChild?.matches(selectors.TABLE_HEADER) === true);
