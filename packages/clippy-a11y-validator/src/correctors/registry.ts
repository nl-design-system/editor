import type { CorrectValidationFunction, ImageAltTextRequest, SolutionPayload, ValidationResult } from '../types';
import { blockValidations, documentValidations, inlineValidations } from '../constants';
import {
  correctConvertToList,
  correctDefinitionListMissingTerm,
  correctDefinitionTermMissingDescription,
  correctDuplicateHeadingOne,
  correctEmptyHeading,
  correctEmptyMark,
  correctEmptyNode,
  correctEntirelyBoldParagraph,
  correctGenericLinkText,
  correctHeadingLevel,
  correctHeadingResemblingParagraph,
  correctHeadingWithFormatting,
  correctImageMissingAltText,
  correctMissingTopLevelHeading,
  correctTableMissingHeadings,
  correctTableMissingRows,
  correctUnderlinedMark,
} from './functions';

const DEFAULT_DEFINITION_TERM_LABEL = 'definition term';

// Host behaviours the built-in corrections need but can't provide themselves.
export type CorrectionHost = {
  onRequestAltText?: (request: ImageAltTextRequest) => void;
  definitionTermLabel?: string;
};

// Builds the deferred fix for one detected issue from its element + payload.
export type Correction = (
  element: Element,
  solutionPayload: SolutionPayload | undefined,
  host: CorrectionHost,
) => CorrectValidationFunction | undefined;

const elementRange = (element: Element): Range | undefined => {
  try {
    const range = element.ownerDocument.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
};

// Built-in rule → correction map. Extend via `extendCorrections(...)` or a plain
// `new Map([...baseCorrections, ...custom])`.
export const baseCorrections: ReadonlyMap<string, Correction> = new Map<string, Correction>([
  [
    blockValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM,
    (el, _payload, host) =>
      correctDefinitionTermMissingDescription(el, host.definitionTermLabel ?? DEFAULT_DEFINITION_TERM_LABEL),
  ],
  [
    blockValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM,
    (el, _payload, host) =>
      correctDefinitionListMissingTerm(el, host.definitionTermLabel ?? DEFAULT_DEFINITION_TERM_LABEL),
  ],
  [blockValidations.HEADING_MUST_NOT_BE_EMPTY, (el) => correctEmptyHeading(el)],
  [blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC, (el) => correctHeadingWithFormatting(el)],
  [
    blockValidations.IMAGE_MUST_HAVE_ALT_TEXT,
    (el, _payload, host) =>
      host.onRequestAltText
        ? correctImageMissingAltText(el as HTMLImageElement, elementRange(el), host.onRequestAltText)
        : undefined,
  ],
  [
    blockValidations.NODE_SHOULD_NOT_BE_EMPTY,
    (el, payload) => {
      const nodeType = payload?.['nodeType'];
      return typeof nodeType === 'string' ? correctEmptyNode(el, nodeType, elementRange(el)) : undefined;
    },
  ],
  [blockValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD, (el) => correctEntirelyBoldParagraph(el)],
  [
    blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
    (el) => correctHeadingResemblingParagraph(el, el.textContent?.trim() ?? ''),
  ],
  [
    blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST,
    (el, payload) => correctConvertToList(el, payload?.['isOrdered'] === true),
  ],
  [blockValidations.TABLE_MUST_HAVE_HEADINGS, (el) => correctTableMissingHeadings(el as HTMLTableElement)],
  [blockValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS, (el) => correctTableMissingRows(el as HTMLTableElement)],

  [
    documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER,
    (el, payload) => {
      const targetLevel = payload?.['targetLevel'];
      return typeof targetLevel === 'number' ? correctHeadingLevel(el, targetLevel) : undefined;
    },
  ],
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE, (el) => correctDuplicateHeadingOne(el)],
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE, (el) => correctMissingTopLevelHeading(el)],

  [inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY, (el) => correctEmptyMark(el)],
  [inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED, (el) => correctUnderlinedMark(el)],
  [inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC, (el) => correctGenericLinkText(elementRange(el))],
]);

// Merge custom corrections onto the base set (custom keys win).
export const extendCorrections = (...custom: Iterable<readonly [string, Correction]>[]): Map<string, Correction> =>
  new Map<string, Correction>([...baseCorrections, ...custom.flatMap((entries) => [...entries])]);

// Appends the interactive fix for a detection result, if one is registered for its rule.
export const buildCorrection = (
  result: Pick<ValidationResult, 'validatorKey' | 'element' | 'solutionPayload'>,
  host: CorrectionHost = {},
  corrections: ReadonlyMap<string, Correction> = baseCorrections,
): CorrectValidationFunction | undefined =>
  result.validatorKey
    ? corrections.get(result.validatorKey)?.(result.element, result.solutionPayload, host)
    : undefined;
