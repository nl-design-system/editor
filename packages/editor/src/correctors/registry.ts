import type { ValidationResult as DetectionResult } from '@nl-design-system-community/clippy-a11y-validator';
import type { CorrectValidationFunction } from '@/types/validation';
import { blockValidations, documentValidations, inlineValidations } from '@/constants';
import {
  correctConvertToList,
  correctDefinitionListMissingTerm,
  correctDefinitionTermMissingDescription,
  correctDuplicateHeadingOne,
  correctEmptyHeading,
  correctEmptyMark,
  correctEmptyNode,
  correctGenericLinkText,
  correctHeadingLevel,
  correctHeadingResemblingParagraph,
  correctHeadingWithFormatting,
  correctImageMissingAltText,
  correctMissingTopLevelHeading,
  correctTableMissingHeadings,
  correctTableMissingRows,
  correctUnderlinedMark,
} from '@/correctors';

type CorrectorBuilder = (
  element: Element,
  tipPayload: DetectionResult['tipPayload'],
  range: Range | undefined,
) => CorrectValidationFunction | undefined;

/**
 * Maps a validator rule key to the interactive correction it should offer.
 *
 * Detection (in `@nl-design-system-community/clippy-a11y-validator`) is
 * intentionally free of editor concerns, so the `correct` action is re-attached
 * here from the detected `element` plus the structured `tipPayload` the
 * validator emitted (e.g. `targetLevel`, `isOrdered`, `nodeType`).
 */
const correctorBuilders: Record<string, CorrectorBuilder> = {
  [blockValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: (element) =>
    correctDefinitionTermMissingDescription(element),
  [blockValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: (element) => correctDefinitionListMissingTerm(element),
  [blockValidations.HEADING_MUST_NOT_BE_EMPTY]: (element) => correctEmptyHeading(element),
  [blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: (element) => correctHeadingWithFormatting(element),
  [blockValidations.IMAGE_MUST_HAVE_ALT_TEXT]: (element, _tip, range) =>
    correctImageMissingAltText(element as HTMLImageElement, range),
  [blockValidations.NODE_SHOULD_NOT_BE_EMPTY]: (element, tip, range) => {
    const nodeType = tip?.['nodeType'];
    if (typeof nodeType !== 'string') return undefined;
    return correctEmptyNode(element, nodeType, range);
  },
  [blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: (element) =>
    correctHeadingResemblingParagraph(element, element.textContent?.trim() ?? ''),
  [blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: (element, tip) =>
    correctConvertToList(element, tip?.['isOrdered'] === true),
  [blockValidations.TABLE_MUST_HAVE_HEADINGS]: (element) => correctTableMissingHeadings(element as HTMLTableElement),
  [blockValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: (element) => correctTableMissingRows(element as HTMLTableElement),

  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: (element, tip) => {
    const targetLevel = tip?.['targetLevel'];
    if (typeof targetLevel !== 'number') return undefined;
    return correctHeadingLevel(element, targetLevel);
  },
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: (element) => correctDuplicateHeadingOne(element),
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: (element) => correctMissingTopLevelHeading(element),

  [inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY]: (element) => correctEmptyMark(element),
  [inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: (element) => correctUnderlinedMark(element),
  [inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: (_element, _tip, range) => correctGenericLinkText(range),
};

/** Builds the interactive `correct` action for a detection result, if one exists for its rule. */
export const buildCorrector = (
  result: DetectionResult,
  range: Range | undefined,
): CorrectValidationFunction | undefined => {
  if (!result.validatorKey) return undefined;
  const builder = correctorBuilders[result.validatorKey];
  return builder?.(result.element, result.tipPayload, range);
};
