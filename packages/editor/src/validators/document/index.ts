import type { Level } from '@tiptap/extension-heading';
import type { EditorSettings } from '@/types/settings.ts';
import type { DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { documentValidations, validationSeverity } from '@/constants';
import { orderedListIndicator, unorderedListIndicator } from '@/correctors/helpers.ts';

// ── DOM utilities ─────────────────────────────────────────────────────────────

const getElementRange = (element: Element): Range | undefined => {
  try {
    const range = document.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
};

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

const decrement = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

// ── Document validators ───────────────────────────────────────────────────────

export const documentMustHaveCorrectHeadingOrder = (
  dom: HTMLElement,
  settings?: EditorSettings,
): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  const { topHeadingLevel = 1 } = settings ?? {};
  let precedingHeadingLevel = topHeadingLevel;

  dom.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const headingLevel = parseInt(heading.tagName.slice(1), 10) as Level;

    if (headingLevel < topHeadingLevel) {
      errors.push({
        correct: () => {},
        range: getElementRange(heading),
        scope: 'element',
        severity: validationSeverity.ERROR,
        tipPayload: { headingLevel, precedingHeadingLevel, topHeadingLevel },
      });
    }

    if (headingLevel > precedingHeadingLevel + 1) {
      errors.push({
        correct: () => {},
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

export const documentMustHaveSemanticLists = (dom: HTMLElement): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  const paragraphs = Array.from(dom.querySelectorAll('p'));

  for (const [index, paragraph] of paragraphs.entries()) {
    const text = paragraph.textContent ?? '';
    const firstPrefix = text.substring(0, 2);
    const isOrdered = orderedListIndicator.test(firstPrefix);
    const isUnordered = unorderedListIndicator.test(firstPrefix);

    if (!isOrdered && !isUnordered) continue;

    const nextParagraph = paragraphs[index + 1];
    if (nextParagraph) {
      const secondPrefix = (nextParagraph.textContent ?? '').substring(0, 2);
      if (decrement(secondPrefix) === firstPrefix) {
        errors.push({
          correct: () => {},
          range: getElementRange(paragraph),
          scope: 'element',
          severity: validationSeverity.INFO,
          tipPayload: { prefix: firstPrefix.trim() },
        });
        continue;
      }
    }

    const lines = getParagraphLinesFromDOM(paragraph);
    if (lines.length > 1 && firstPrefix === decrement(lines[1]?.substring(0, 2) ?? '')) {
      errors.push({
        correct: () => {},
        range: getElementRange(paragraph),
        scope: 'element',
        severity: validationSeverity.INFO,
        tipPayload: { prefix: firstPrefix.trim() },
      });
    }
  }

  return errors;
};

export const documentMustHaveSingleHeadingOne = (dom: HTMLElement): ValidationResult[] => {
  const h1s = Array.from(dom.querySelectorAll<HTMLHeadingElement>('h1'));
  if (h1s.length <= 1) return [];

  return h1s.slice(1).map((h1) => ({
    correct: () => {},
    range: getElementRange(h1),
    scope: 'element' as const,
    severity: validationSeverity.ERROR,
  }));
};

export const documentMustHaveTopLevelHeadingOne = (dom: HTMLElement, settings?: EditorSettings): ValidationResult[] => {
  const topHeadingLevel = settings?.topHeadingLevel ?? 1;
  if (topHeadingLevel !== 1) return [];

  const firstChild = dom.firstElementChild;
  if (firstChild?.tagName === 'H1') return [];

  const target = firstChild ?? dom;
  return [
    {
      correct: () => {},
      range: getElementRange(target),
      scope: 'element',
      severity: validationSeverity.INFO,
    },
  ];
};

const documentShouldNotHaveHeadingResemblingParagraphs = (dom: HTMLElement): ValidationResult[] => {
  const errors: ValidationResult[] = [];

  for (const child of dom.children) {
    if (child.tagName !== 'P') continue;
    const text = child.textContent?.trim() ?? '';
    if (text.length === 0 || text.length > 60) continue;

    const nonEmptyChildren = Array.from(child.childNodes).filter(
      (n) => n.nodeType !== Node.TEXT_NODE || (n.textContent?.trim().length ?? 0) > 0,
    );
    if (nonEmptyChildren.length === 0) continue;

    const allBold = nonEmptyChildren.every(
      (n) => n instanceof Element && (n.tagName === 'STRONG' || n.tagName === 'B'),
    );
    if (!allBold) continue;

    errors.push({
      correct: () => {},
      range: getElementRange(child),
      scope: 'element',
      severity: validationSeverity.INFO,
    });
  }

  return errors;
};

export const documentMustHaveTableWithHeadings = (dom: HTMLElement): ValidationResult[] => {
  const errors: ValidationResult[] = [];

  dom.querySelectorAll('table').forEach((table) => {
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;

    const hasHeaderRow = Array.from(firstRow.children).every((cell) => cell.tagName === 'TH');
    const hasHeaderColumn =
      !hasHeaderRow && Array.from(table.querySelectorAll('tr')).every((row) => row.firstElementChild?.tagName === 'TH');

    if (!hasHeaderRow && !hasHeaderColumn) {
      errors.push({
        correct: () => {},
        range: getElementRange(table),
        scope: 'element',
        severity: validationSeverity.WARNING,
      });
    }
  });

  return errors;
};

export const documentMustHaveTableWithMultipleRows = (dom: HTMLElement): ValidationResult[] => {
  const errors: ValidationResult[] = [];

  dom.querySelectorAll('table').forEach((table) => {
    if (table.querySelectorAll('tr').length < 2) {
      errors.push({
        correct: () => {},
        range: getElementRange(table),
        scope: 'element',
        severity: validationSeverity.WARNING,
      });
    }
  });

  return errors;
};

// ── Validator map ─────────────────────────────────────────────────────────────

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
