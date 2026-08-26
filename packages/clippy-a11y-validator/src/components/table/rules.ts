export const isTable = (element: Element): boolean => element.tagName === 'TABLE';

/** The first row consists entirely of `<th>` cells. */
export const hasHeaderRow = (table: Element): boolean => {
  const firstRow = table.querySelector('tr');
  return firstRow !== null && Array.from(firstRow.children).every((cell) => cell.tagName === 'TH');
};

/** Every row opens with a `<th>` cell. */
export const hasHeaderColumn = (table: Element): boolean =>
  Array.from(table.querySelectorAll('tr')).every((row) => row.firstElementChild?.tagName === 'TH');

/**
 * A populated table with neither a header row nor a header column, leaving
 * screen readers without labels to announce cells against. An empty table is
 * exempt — there is nothing to label yet.
 */
export const lacksTableHeaders = (element: Element): boolean => {
  if (!isTable(element)) return false;
  if (element.querySelector('tr') === null) return false;
  return !hasHeaderRow(element) && !hasHeaderColumn(element);
};

/** A table of a single row, which carries no data beyond its headers. */
export const hasSingleRow = (element: Element): boolean =>
  isTable(element) && element.querySelectorAll('tr').length < 2;
