import type { ContentValidator } from '@/types';
import { tableValidations, validationSeverity } from '@/constants';
import { correctTableMissingHeadings, correctTableMissingRows } from '@/correctors';

const tableMustHaveHeadings: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'TABLE') return null;
  const firstRow = node.querySelector('tr');
  if (!firstRow) return null;
  const hasHeaderRow = Array.from(firstRow.children).every((cell) => cell.tagName === 'TH');
  const hasHeaderColumn =
    !hasHeaderRow && Array.from(node.querySelectorAll('tr')).every((row) => row.firstElementChild?.tagName === 'TH');
  if (hasHeaderRow || hasHeaderColumn) return null;
  return {
    correct: correctTableMissingHeadings(node as HTMLTableElement),
    element: node,
    scope: 'block',
    severity: validationSeverity.WARNING,
  };
};

const tableMustHaveMultipleRows: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'TABLE') return null;
  if (node.querySelectorAll('tr').length >= 2) return null;
  return {
    correct: correctTableMissingRows(node as HTMLTableElement),
    element: node,
    scope: 'block',
    severity: validationSeverity.WARNING,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

export const tableContentValidators: Record<string, ContentValidator> = {
  [tableValidations.TABLE_MUST_HAVE_HEADINGS]: tableMustHaveHeadings,
  [tableValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: tableMustHaveMultipleRows,
};
