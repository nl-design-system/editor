import type { Level } from '@tiptap/extension-heading';
import type { EditorSettings } from '@/types/settings.ts';
import type { CorrectValidationFunction, DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { documentValidations, validationSeverity } from '@/constants';
import {
  correctConvertToList,
  correctDuplicateHeadingOne,
  correctHeadingLevel,
  correctHeadingResemblingParagraph,
  correctTableMissingHeadings,
  correctTableMissingRows,
} from '@/correctors';
import { orderedListIndicator, unorderedListIndicator } from '@/correctors/helpers.ts';

// ── DOM utilities ─────────────────────────────────────────────────────────────

/** Parse an HTML string into a wrapper element, or return the element as-is. */
const parseContent = (content: string | HTMLElement): HTMLElement => {
  if (typeof content === 'string') {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div;
  }
  return content;
};

/**
 * Create a DOM Range covering `element`.
 * Returns `undefined` when the element is not attached to the live document
 * (e.g. during standalone HTML-string validation).
 */
const getElementRange = (element: Element): Range | undefined => {
  try {
    const range = document.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
};

/**
 * Build a `correct` callback for a block-level element.
 * Resolves the ProseMirror position at call time via `editor.view.posAtDOM`
 * so it stays accurate even after the document has changed.
 */
const correctBlock = (
  element: Element,
  factory: (pos: number) => CorrectValidationFunction,
): CorrectValidationFunction => {
  return (editor) => {
    try {
      const pos = editor.view.posAtDOM(element, 0) - 1;
      factory(pos)(editor);
    } catch {
      /* element may have been removed before correction ran */
    }
  };
};

/**
 * Like `correctBlock`, but additionally supplies the ProseMirror `nodeSize`
 * derived from the live element – needed by correctors that build text
 * selections spanning the entire node content.
 */
const correctBlockWithSize = (
  element: Element,
  factory: (pos: number, nodeSize: number) => CorrectValidationFunction,
): CorrectValidationFunction => {
  return (editor) => {
    try {
      const contentStart = editor.view.posAtDOM(element, 0);
      const contentEnd = editor.view.posAtDOM(element, element.childNodes.length);
      const pos = contentStart - 1;
      const nodeSize = contentEnd - contentStart + 2;
      factory(pos, nodeSize)(editor);
    } catch {
      /* element may have been removed before correction ran */
    }
  };
};

// ── Paragraph-line helpers ────────────────────────────────────────────────────

/** Split a `<p>` element into its `<br>`-separated lines. */
const getParagraphLinesFromDOM = (paragraph: Element): string[] => {
  const lines: string[] = [];
  let currentLine = '';
  for (const node of Array.from(paragraph.childNodes)) {
    if (node instanceof Element && node.tagName === 'BR') {
      if (currentLine.trim().length > 0) lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += node.textContent ?? '';
    }
  }
  if (currentLine.trim().length > 0) lines.push(currentLine);
  return lines;
};

/** Decrement the leading numeric prefix of a list-item marker for
 *  consecutive-list-detection ("2" → "1", "2." → "1.", etc.). */
const decrementPrefix = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

// ── Document validators ───────────────────────────────────────────────────────

export const documentMustHaveCorrectHeadingOrder = (
  content: string | HTMLElement,
  settings?: EditorSettings,
): ValidationResult[] => {
  const root = parseContent(content);
  const errors: ValidationResult[] = [];
  const { topHeadingLevel = 1 } = settings ?? {};
  let precedingHeadingLevel = topHeadingLevel;

  root.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const headingLevel = parseInt(heading.tagName.slice(1), 10) as Level;

    if (headingLevel < topHeadingLevel) {
      errors.push({
        correct: correctHeadingLevel(heading, topHeadingLevel as Level),
        range: getElementRange(heading),
        scope: 'element',
        severity: validationSeverity.ERROR,
        tipPayload: { headingLevel, precedingHeadingLevel, topHeadingLevel },
      });
    }

    if (headingLevel > precedingHeadingLevel + 1) {
      errors.push({
        correct: correctHeadingLevel(heading, (precedingHeadingLevel + 1) as Level),
        range: getElementRange(heading),
        scope: 'element',
        severity: validationSeverity.WARNING,
        tipPayload: { headingLevel, precedingHeadingLevel, topHeadingLevel },
      });
    }

    precedingHeadingLevel = headingLevel;
  });

  return errors;
};

export const documentMustHaveSemanticLists = (content: string | HTMLElement): ValidationResult[] => {
  const root = parseContent(content);
  const errors: ValidationResult[] = [];
  const allParagraphs = Array.from(root.querySelectorAll('p'));

  for (const [index, paragraph] of allParagraphs.entries()) {
    const text = paragraph.textContent ?? '';
    const firstPrefix = text.substring(0, 2);
    const isOrdered = orderedListIndicator.test(firstPrefix);
    const isUnordered = unorderedListIndicator.test(firstPrefix);

    if (!isOrdered && !isUnordered) continue;

    const tipPayload = { prefix: firstPrefix.trim() };
    const buildCorrect = correctBlock(paragraph, (pos) => correctConvertToList(pos, isOrdered));

    // Check consecutive paragraphs (in document/querySelectorAll order).
    const nextParagraph = allParagraphs[index + 1];
    if (nextParagraph) {
      const secondPrefix = (nextParagraph.textContent ?? '').substring(0, 2);
      if (decrementPrefix(secondPrefix) === firstPrefix) {
        errors.push({
          correct: buildCorrect,
          range: getElementRange(paragraph),
          scope: 'element',
          severity: validationSeverity.INFO,
          tipPayload,
        });
        continue;
      }
    }

    // Check multi-line paragraphs separated by hard breaks.
    const lines = getParagraphLinesFromDOM(paragraph);
    if (lines.length > 1 && firstPrefix === decrementPrefix(lines[1].substring(0, 2))) {
      errors.push({
        correct: buildCorrect,
        range: getElementRange(paragraph),
        scope: 'element',
        severity: validationSeverity.INFO,
        tipPayload,
      });
    }
  }

  return errors;
};

export const documentMustHaveSingleHeadingOne = (content: string | HTMLElement): ValidationResult[] => {
  const root = parseContent(content);
  const h1Elements = Array.from(root.querySelectorAll('h1'));

  if (h1Elements.length <= 1) return [];

  return h1Elements.slice(1).map((heading) => ({
    correct: correctBlock(heading, (pos) => correctDuplicateHeadingOne(pos)),
    range: getElementRange(heading),
    scope: 'element',
    severity: validationSeverity.ERROR,
  }));
};

export const documentMustHaveTopLevelHeadingOne = (
  content: string | HTMLElement,
  settings?: EditorSettings,
): ValidationResult[] => {
  const root = parseContent(content);
  const topHeadingLevel = settings?.topHeadingLevel ?? 1;

  if (topHeadingLevel !== 1) return [];

  const firstChild = root.firstElementChild;
  if (firstChild?.tagName === 'H1') return [];

  return [
    {
      correct: (editor) => {
        try {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = editor.getHTML();
          const firstEl = wrapper.firstElementChild;
          if (firstEl) {
            const h1 = document.createElement('h1');
            h1.innerHTML = firstEl.innerHTML;
            firstEl.replaceWith(h1);
          }
          editor.chain().focus().setContent(wrapper.innerHTML).run();
        } catch {
          /* noop */
        }
      },
      range: getElementRange(firstChild ?? root),
      scope: 'element',
      severity: validationSeverity.INFO,
    },
  ];
};

const documentShouldNotHaveHeadingResemblingParagraphs = (content: string | HTMLElement): ValidationResult[] => {
  const root = parseContent(content);
  const errors: ValidationResult[] = [];

  for (const paragraph of Array.from(root.querySelectorAll('p'))) {
    // Must be a direct child of the document root (not inside a list, table, etc.).
    if (paragraph.parentElement !== root) continue;

    const textLength = (paragraph.textContent ?? '').trim().length;
    if (textLength === 0 || textLength > 60) continue;

    // All child nodes must be whitespace text nodes or plain <strong> elements
    // (no nested marks) — mirrors the ProseMirror "all marks are bold" check.
    const childNodes = Array.from(paragraph.childNodes);
    if (childNodes.length === 0) continue;

    const allBold = childNodes.every((child) => {
      if (child.nodeType === Node.TEXT_NODE) return /^\s*$/.test(child.textContent ?? '');
      return child instanceof Element && child.tagName === 'STRONG' && child.children.length === 0;
    });

    if (!allBold) continue;

    errors.push({
      correct: correctBlockWithSize(paragraph, (pos, nodeSize) => correctHeadingResemblingParagraph(pos, nodeSize)),
      range: getElementRange(paragraph),
      scope: 'element',
      severity: validationSeverity.INFO,
    });
  }

  return errors;
};

export const documentMustHaveTableWithHeadings = (content: string | HTMLElement): ValidationResult[] => {
  const root = parseContent(content);
  const errors: ValidationResult[] = [];

  for (const table of Array.from(root.querySelectorAll('table'))) {
    const firstRow = table.querySelector('tr');
    let hasHeaderRow = false;
    let hasHeaderColumn = false;

    if (firstRow) {
      const cells = Array.from(firstRow.children);
      hasHeaderRow = cells.length > 0 && cells.every((cell) => cell.tagName === 'TH');
    }

    if (!hasHeaderRow) {
      const rows = Array.from(table.querySelectorAll('tr'));
      hasHeaderColumn = rows.length > 0 && rows.every((row) => row.firstElementChild?.tagName === 'TH');
    }

    if (!hasHeaderRow && !hasHeaderColumn) {
      errors.push({
        correct: correctBlock(table, (pos) => correctTableMissingHeadings(pos)),
        range: getElementRange(table),
        scope: 'element',
        severity: validationSeverity.WARNING,
      });
    }
  }

  return errors;
};

export const documentMustHaveTableWithMultipleRows = (content: string | HTMLElement): ValidationResult[] => {
  const root = parseContent(content);
  const errors: ValidationResult[] = [];

  for (const table of Array.from(root.querySelectorAll('table'))) {
    const rowCount = table.querySelectorAll('tr').length;
    if (rowCount < 2) {
      errors.push({
        correct: correctBlock(table, (pos) => correctTableMissingRows(pos)),
        range: getElementRange(table),
        scope: 'element',
        severity: validationSeverity.WARNING,
      });
    }
  }

  return errors;
};

// ── Validator registry ────────────────────────────────────────────────────────

type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];

export const documentValidatorObject: { [K in DocumentValidationKey]: DocumentValidator } = {
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: documentMustHaveCorrectHeadingOrder,
  [documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS]: documentMustHaveSemanticLists,
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: documentMustHaveSingleHeadingOne,
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_HEADINGS]: documentMustHaveTableWithHeadings,
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_MULTIPLE_ROWS]: documentMustHaveTableWithMultipleRows,
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: documentMustHaveTopLevelHeadingOne,
  [documentValidations.DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS]:
    documentShouldNotHaveHeadingResemblingParagraphs,
};

export default documentValidatorObject;
