import type { ContentValidator } from '@/types/validation.ts';
import { elementValidations, validationSeverity } from '@/constants';
import { orderedListIndicator, unorderedListIndicator } from '@/correctors/helpers.ts';
import { isEmptyOrWhitespace } from '@/validators/helpers.ts';

// ── DOM utilities ─────────────────────────────────────────────────────────────

export const getElementRange = (element: Element): Range | undefined => {
  try {
    const range = document.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
};

// ── Tag → semantic-type mappings ──────────────────────────────────────────────

/** Maps HTML tag names to the ProseMirror node-type name used in tipPayload. */
export const BLOCK_NODE_TYPES: Partial<Record<string, string>> = {
  caption: 'tableCaption',
  dd: 'definitionDescription',
  dt: 'definitionTerm',
  li: 'listItem',
  p: 'paragraph',
  td: 'tableCell',
  th: 'tableHeader',
};

// ── List helpers ──────────────────────────────────────────────────────────────

/** Split a <p> element into its <br>-separated lines. */
const getParagraphLinesFromDOM = (paragraph: Element): string[] => {
  const lines: string[] = [];
  let current = '';
  for (const node of paragraph.childNodes) {
    if (node instanceof Element && node.tagName === 'BR') {
      if (current.trim().length > 0) lines.push(current);
      current = '';
    } else {
      current += node.textContent ?? '';
    }
  }
  if (current.trim().length > 0) lines.push(current);
  return lines;
};

const decrementPrefix = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

const getPrefix = (text: string): string => text.substring(0, 2);

// ── Element validators ────────────────────────────────────────────────────────

const definitionDescriptionMustFollowTerm: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'DT') return null;
  if (node.nextElementSibling?.tagName === 'DD') return null;
  return { correct: () => {}, range: getElementRange(node), scope: 'element', severity: validationSeverity.ERROR };
};

const descriptionListMustContainTerm: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'DL') return null;
  if (node.querySelector('dt')) return null;
  return { correct: () => {}, range: getElementRange(node), scope: 'element', severity: validationSeverity.ERROR };
};

const headingMustNotBeEmpty: ContentValidator = (_dom, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return { correct: () => {}, range: getElementRange(node), scope: 'element', severity: validationSeverity.ERROR };
};

const headingShouldNotContainBoldOrItalic: ContentValidator = (_dom, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!node.querySelector('strong, b, em, i')) return null;
  return { correct: () => {}, range: getElementRange(node), scope: 'element', severity: validationSeverity.INFO };
};

const imageMustHaveAltText: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'IMG') return null;
  const alt = (node as HTMLImageElement).alt;
  if (alt && !isEmptyOrWhitespace(alt)) return null;
  return { correct: () => {}, range: getElementRange(node), scope: 'element', severity: validationSeverity.INFO };
};

const nodeShouldNotBeEmpty: ContentValidator = (_dom, node) => {
  const tag = node.tagName.toLowerCase();
  const nodeType = BLOCK_NODE_TYPES[tag];
  if (!nodeType) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: () => {},
    range: getElementRange(node),
    scope: 'element',
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
  return { correct: () => {}, range: getElementRange(node), scope: 'element', severity: validationSeverity.INFO };
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
        correct: () => {},
        range: getElementRange(node),
        scope: 'element',
        severity: validationSeverity.INFO,
        tipPayload: { prefix: firstPrefix.trim() },
      };
    }
  }

  // Check <br>-separated lines within the paragraph
  const lines = getParagraphLinesFromDOM(node);
  if (lines.length > 1 && firstPrefix === decrementPrefix(getPrefix(lines[1] ?? ''))) {
    return {
      correct: () => {},
      range: getElementRange(node),
      scope: 'element',
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
  return { correct: () => {}, range: getElementRange(node), scope: 'element', severity: validationSeverity.WARNING };
};

const tableMustHaveMultipleRows: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'TABLE') return null;
  if (node.querySelectorAll('tr').length >= 2) return null;
  return { correct: () => {}, range: getElementRange(node), scope: 'element', severity: validationSeverity.WARNING };
};

// ── Validator map ─────────────────────────────────────────────────────────────

type ElementValidationKey = (typeof elementValidations)[keyof typeof elementValidations];

export const elementValidatorMap: { [K in ElementValidationKey]: ContentValidator } = {
  [elementValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: definitionDescriptionMustFollowTerm,
  [elementValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: descriptionListMustContainTerm,
  [elementValidations.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [elementValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: headingShouldNotContainBoldOrItalic,
  [elementValidations.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText,
  [elementValidations.NODE_SHOULD_NOT_BE_EMPTY]: nodeShouldNotBeEmpty,
  [elementValidations.PARAGRAPH_MUST_USE_SEMANTIC_LIST]: paragraphMustUseSemanticList,
  [elementValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: paragraphShouldNotResembleHeading,
  [elementValidations.TABLE_MUST_HAVE_HEADINGS]: tableMustHaveHeadings,
  [elementValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: tableMustHaveMultipleRows,
};
