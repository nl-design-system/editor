import type { ContentValidator } from '@/types/validation.ts';
import { blockValidations, validationSeverity } from '@/constants';
import { getParagraphLinesFromDOM, orderedListIndicator, unorderedListIndicator } from '@/correctors/helpers.ts';
import {
  correctConvertToList,
  correctDefinitionListMissingTerm,
  correctDefinitionTermMissingDescription,
  correctEmptyHeading,
  correctEmptyNode,
  correctHeadingResemblingParagraph,
  correctHeadingWithFormatting,
  correctImageMissingAltText,
  correctTableMissingHeadings,
  correctTableMissingRows,
} from '@/correctors/index.ts';
import { getElementRange, isEmptyOrWhitespace } from '@/validators/helpers.ts';

// ── DOM utilities ─────────────────────────────────────────────────────────────

// ── Tag → semantic-type mappings ──────────────────────────────────────────────

/** Maps HTML tag names to the ProseMirror node-type name used in tipPayload. */
const BLOCK_NODE_TYPES: Partial<Record<string, string>> = {
  caption: 'tableCaption',
  dd: 'definitionDescription',
  dt: 'definitionTerm',
  li: 'listItem',
  p: 'paragraph',
  td: 'tableCell',
  th: 'tableHeader',
};

// ── List helpers ──────────────────────────────────────────────────────────────

const decrementPrefix = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

const getPrefix = (text: string): string => text.substring(0, 2);

// ── Element validators ────────────────────────────────────────────────────────

const definitionDescriptionMustFollowTerm: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'DT') return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  const dd = node.nextElementSibling;
  if (!dd || dd.tagName !== 'DD') return null;
  if (isEmptyOrWhitespace(dd.textContent ?? '')) return null;
  return {
    correct: correctDefinitionTermMissingDescription(node),
    range: getElementRange(node),
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

const descriptionListMustContainTerm: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'DL') return null;
  const terms = Array.from(node.querySelectorAll('dt')).filter((dt) => dt.closest('dl') === node);
  if (terms.length === 0) return null;
  if (terms.some((dt) => !isEmptyOrWhitespace(dt.textContent ?? ''))) return null;
  return {
    correct: correctDefinitionListMissingTerm(node),
    range: getElementRange(node),
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

const headingMustNotBeEmpty: ContentValidator = (_dom, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: correctEmptyHeading(node),
    range: getElementRange(node),
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

const headingShouldNotContainBoldOrItalic: ContentValidator = (_dom, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!node.querySelector('strong, b, em, i')) return null;
  return {
    correct: correctHeadingWithFormatting(node),
    range: getElementRange(node),
    scope: 'block',
    severity: validationSeverity.INFO,
  };
};

const imageMustHaveAltText: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'IMG') return null;
  const alt = (node as HTMLImageElement).alt;
  if (alt && !isEmptyOrWhitespace(alt)) return null;
  const range = getElementRange(node);
  return {
    correct: correctImageMissingAltText(node as HTMLImageElement, range),
    range,
    scope: 'block',
    severity: validationSeverity.INFO,
  };
};

const nodeShouldNotBeEmpty: ContentValidator = (_dom, node) => {
  const tag = node.tagName.toLowerCase();
  const nodeType = BLOCK_NODE_TYPES[tag];
  if (!nodeType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  const range = getElementRange(node);
  return {
    correct: correctEmptyNode(node, nodeType, range),
    range,
    scope: 'block',
    severity: validationSeverity.INFO,
    tipPayload: { nodeType },
  };
};

const paragraphShouldNotResembleHeading: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'P') return null;
  const text = node.textContent?.trim() ?? '';
  if (isEmptyOrWhitespace(text) || text.length > 60) return null;
  const nonEmptyChildren = Array.from(node.childNodes).filter(
    (n) => n.nodeType !== Node.TEXT_NODE || (n.textContent?.trim().length ?? 0) > 0,
  );
  if (nonEmptyChildren.length === 0) return null;
  const allBold = nonEmptyChildren.every((n) => n instanceof Element && (n.tagName === 'STRONG' || n.tagName === 'B'));
  if (!allBold) return null;
  return {
    correct: correctHeadingResemblingParagraph(node, text),
    range: getElementRange(node),
    scope: 'block',
    severity: validationSeverity.INFO,
  };
};

export const paragraphMustUseSemanticList: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'P') return null;

  const text = node.textContent ?? '';
  const firstPrefix = getPrefix(text);
  const isOrdered = orderedListIndicator.test(firstPrefix);
  const isUnordered = unorderedListIndicator.test(firstPrefix);

  if (!isOrdered && !isUnordered) return null;

  // Check if the next sibling paragraph continues the list pattern
  const nextSibling = node.nextElementSibling;
  if (nextSibling?.tagName === 'P') {
    const secondPrefix = getPrefix(nextSibling.textContent ?? '');
    if (decrementPrefix(secondPrefix) === firstPrefix) {
      return {
        correct: correctConvertToList(node, isOrdered),
        range: getElementRange(node),
        scope: 'block',
        severity: validationSeverity.INFO,
        tipPayload: { prefix: firstPrefix.trim() },
      };
    }
  }

  // Check <br>-separated lines within the paragraph
  const lines = getParagraphLinesFromDOM(node);
  if (lines.length > 1 && firstPrefix === decrementPrefix(getPrefix(lines[1] ?? ''))) {
    return {
      correct: correctConvertToList(node, isOrdered),
      range: getElementRange(node),
      scope: 'block',
      severity: validationSeverity.INFO,
      tipPayload: { prefix: firstPrefix.trim() },
    };
  }

  return null;
};

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
    range: getElementRange(node),
    scope: 'block',
    severity: validationSeverity.WARNING,
  };
};

const tableMustHaveMultipleRows: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'TABLE') return null;
  if (node.querySelectorAll('tr').length >= 2) return null;
  return {
    correct: correctTableMissingRows(node as HTMLTableElement),
    range: getElementRange(node),
    scope: 'block',
    severity: validationSeverity.WARNING,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

type BlockValidationKey = (typeof blockValidations)[keyof typeof blockValidations];

export const blockValidatorMap: { [K in BlockValidationKey]: ContentValidator } = {
  [blockValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: definitionDescriptionMustFollowTerm,
  [blockValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: descriptionListMustContainTerm,
  [blockValidations.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: headingShouldNotContainBoldOrItalic,
  [blockValidations.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText,
  [blockValidations.NODE_SHOULD_NOT_BE_EMPTY]: nodeShouldNotBeEmpty,
  [blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: paragraphShouldNotResembleHeading,
  [blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: paragraphMustUseSemanticList,
  [blockValidations.TABLE_MUST_HAVE_HEADINGS]: tableMustHaveHeadings,
  [blockValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: tableMustHaveMultipleRows,
};
