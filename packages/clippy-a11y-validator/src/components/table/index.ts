import type { Validation } from '../../types/validation.ts';
import { tableCaptionShouldNotBeEmpty } from './caption-should-not-be-empty/index.ts';
import { tableCellShouldNotBeEmpty } from './cell-should-not-be-empty/index.ts';
import { tableValidationRules } from './constants.ts';
import { tableMustHaveHeadings } from './must-have-headings/index.ts';
import { tableMustHaveMultipleRows } from './must-have-multiple-rows/index.ts';

export type TableValidationRule = keyof typeof tableValidationRules;

export const tableValidations = {
  [tableValidationRules.TABLE_CAPTION_SHOULD_NOT_BE_EMPTY]: tableCaptionShouldNotBeEmpty,
  [tableValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY]: tableCellShouldNotBeEmpty,
  [tableValidationRules.TABLE_MUST_HAVE_HEADINGS]: tableMustHaveHeadings,
  [tableValidationRules.TABLE_MUST_HAVE_MULTIPLE_ROWS]: tableMustHaveMultipleRows,
} satisfies Record<TableValidationRule, Validation>;
