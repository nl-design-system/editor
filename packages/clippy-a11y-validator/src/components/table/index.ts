import type { ContentValidator } from '@/types';
import { tableValidations, validationSeverity } from '@/constants';
import { correctTableMissingHeadings, correctTableMissingRows } from './corrector';
import { hasSingleRow, lacksTableHeaders } from './rules';

const tableMustHaveHeadings: ContentValidator = (_dom, node) => {
  if (!lacksTableHeaders(node)) return null;
  return {
    correct: correctTableMissingHeadings(node as HTMLTableElement),
    element: node,
    scope: 'block',
    severity: validationSeverity.WARNING,
  };
};

const tableMustHaveMultipleRows: ContentValidator = (_dom, node) => {
  if (!hasSingleRow(node)) return null;
  return {
    correct: correctTableMissingRows(node as HTMLTableElement),
    element: node,
    scope: 'block',
    severity: validationSeverity.WARNING,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

/** Build the table validators for one run. No rule here words its own `solution` yet. */
export const tableContentValidators = (): Record<string, ContentValidator> => ({
  [tableValidations.TABLE_MUST_HAVE_HEADINGS]: tableMustHaveHeadings,
  [tableValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: tableMustHaveMultipleRows,
});
