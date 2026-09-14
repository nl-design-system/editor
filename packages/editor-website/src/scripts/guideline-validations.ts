import type { Context } from '@nl-design-system-community/editor';
import { coreValidations, type Validation } from '@nl-design-system-community/clippy-a11y-validator';

/**
 * The validation each guideline example demonstrates. Every example shows one mistake, so it runs
 * only the rule that catches it — otherwise the unrelated problems in the surrounding markup would
 * be flagged too and the example would stop making its point.
 *
 * Kept in page order rather than keyed by id, so it reads alongside the markup.
 * Both the Dutch and the English guideline page use these ids, so both import this module.
 */
const GUIDELINE_VALIDATIONS: ReadonlyArray<readonly [id: string, validations: readonly Validation[]]> = [
  ['editor-1', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]],
  [
    'editor-2',
    [coreValidations.PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING, coreValidations.LINK_SHOULD_NOT_BE_EMPTY],
  ],
  ['editor-3', [coreValidations.PARAGRAPH_SHOULD_NOT_CONTAIN_UNDERLINED_TEXT]],
  ['editor-4', [coreValidations.UNORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY]],
  ['editor-5', [coreValidations.ORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY]],
  ['editor-6', [coreValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]],
  ['editor-7', [coreValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]],
  ['editor-8', [coreValidations.DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY, coreValidations.DESCRIPTION_SHOULD_NOT_BE_EMPTY]],
  ['editor-9', [coreValidations.TABLE_CELL_SHOULD_NOT_BE_EMPTY]],
  ['editor-10', [coreValidations.IMAGE_MUST_HAVE_ALT_TEXT]],
  ['editor-11', [coreValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]],
  ['editor-12', [coreValidations.HEADING_LEVEL_MUST_NOT_SKIP]],
  ['editor-13', [coreValidations.TABLE_MUST_HAVE_HEADINGS]],
  ['editor-14', [coreValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]],
  ['editor-15', [coreValidations.HEADING_LEVEL_ONE_MUST_BE_UNIQUE]],
  ['editor-16', [coreValidations.HEADING_MUST_START_AT_LEVEL_ONE]],
  ['editor-17', [coreValidations.DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION]],
  ['editor-18', [coreValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]],
  ['editor-19', [coreValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]],
  ['editor-20', [coreValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]],
  ['editor-21', [coreValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]],
];

for (const [id, validations] of GUIDELINE_VALIDATIONS) {
  const editor = document.getElementById(id) as Context | null;
  if (editor) editor.validations = validations;
}
