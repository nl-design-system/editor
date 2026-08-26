import type { CorrectValidationFunction } from '@/types';

// Convert the first row's <td> cells to <th>.
export const correctTableMissingHeadings =
  (table: HTMLTableElement): CorrectValidationFunction =>
  () => {
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;
    for (const cell of firstRow.children) {
      if (cell.tagName === 'TH') return;
      const th = document.createElement('th');
      th.innerHTML = cell.innerHTML;
      for (const attr of cell.attributes) {
        th.setAttribute(attr.name, attr.value);
      }
      cell.replaceWith(th);
    }
  };

// Append an empty row matching the first row's cell count.
export const correctTableMissingRows =
  (table: HTMLTableElement): CorrectValidationFunction =>
  () => {
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;
    const tbody = table.querySelector('tbody') ?? table;
    const newRow = document.createElement('tr');
    Array.from({ length: firstRow.children.length }, () => newRow.appendChild(document.createElement('td')));
    tbody.appendChild(newRow);
  };
