import { msg } from '@lit/localize';
import type { CorrectValidationFunction } from '@/types/validation';
import { CustomEvents } from '@/events';
import { getParagraphLinesFromDOM, orderedListIndicator, unorderedListIndicator } from './helpers';

// ── DOM helpers ───────────────────────────────────────────────────────────────

/** Unwrap an element: replace it with its children in-place. */
const unwrapElement = (element: Element): void => {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  element.remove();
};

/**
 * Select a Range in the browser's selection and ensure keyboard focus moves to
 * the element that contains the range.  When operating outside a TipTap editor
 * (e.g. standalone / readonly mode) the browser does not automatically move
 * focus to the contenteditable container, so we walk up the ancestor chain to
 * find the nearest focusable element and call `.focus()` explicitly.
 */
const selectRange = (range: Range | undefined): void => {
  if (!range) return;

  // Move keyboard focus to the nearest contenteditable ancestor (TipTap or
  // standalone), falling back to the direct parent element.
  const startNode = range.startContainer;
  const startElement = startNode instanceof HTMLElement ? startNode : startNode.parentElement;
  const focusTarget =
    startElement?.closest<HTMLElement>('[contenteditable]') ??
    startElement?.closest<HTMLElement>('[tabindex]') ??
    startElement;
  focusTarget?.focus();

  const selection = globalThis.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
};

/** Change the tag name of an element while preserving attributes and inner HTML. */
const changeTagName = (element: Element, newTag: string): void => {
  const newEl = document.createElement(newTag);
  for (const attr of element.attributes) {
    newEl.setAttribute(attr.name, attr.value);
  }
  newEl.innerHTML = element.innerHTML;
  element.parentNode?.replaceChild(newEl, element);
};

const ORDERED_LIST_PREFIX_PATTERN = /^\d+[.)\]/ ]-?\s*/;
const UNORDERED_LIST_PREFIX_PATTERN = /^\s*[•\-*+]\s+/;

/** Strip the list-item prefix (e.g. "1. ", "1 - ", "- ") from a line of text. */
const stripListPrefix = (text: string, isOrdered: boolean): string => {
  const pattern = isOrdered ? ORDERED_LIST_PREFIX_PATTERN : UNORDERED_LIST_PREFIX_PATTERN;
  return text.replace(pattern, '');
};

/**
 * Convert a list-like paragraph (and any consecutive sibling list paragraphs)
 * into a proper <ul> or <ol> element using only DOM APIs.
 */
const convertParagraphsToList = (startParagraph: Element, isOrdered: boolean): void => {
  const parent = startParagraph.parentNode;
  if (!parent) return;

  const listTag = isOrdered ? 'ol' : 'ul';
  const list = document.createElement(listTag);

  const toReplace: Element[] = [startParagraph];
  let next = startParagraph.nextElementSibling;
  while (next?.tagName === 'P') {
    const nextPrefix = (next.textContent ?? '').substring(0, 2);
    if (!orderedListIndicator.test(nextPrefix) && !unorderedListIndicator.test(nextPrefix)) break;
    toReplace.push(next);
    next = next.nextElementSibling;
  }

  for (const paragraph of toReplace) {
    for (const line of getParagraphLinesFromDOM(paragraph)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const li = document.createElement('li');
      li.textContent = stripListPrefix(trimmed, isOrdered);
      list.appendChild(li);
    }
  }

  startParagraph.before(list, startParagraph);
  for (const paragraph of toReplace) {
    paragraph.remove();
  }
};

// ── Content correctors ────────────────────────────────────────────────────────

/**
 * Selects the image node and opens the image dialog so the user can supply
 * alt text. The existing src and (empty) alt are pre-filled in the dialog.
 */
export const correctImageMissingAltText =
  (node: HTMLImageElement, range: Range | undefined): CorrectValidationFunction =>
  () => {
    selectRange(range);
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
        detail: { files: [{ name: node.alt, type: 'image/*', url: node.src }], replace: true },
      }),
    );
  };

/**
 * Removes an empty node from the document.
 * For table cells/captions the cursor is placed inside instead because
 * deleting a cell would break the table structure.
 */
export const correctEmptyNode =
  (node: Element, nodeType: string, range: Range | undefined): CorrectValidationFunction =>
  () => {
    if (nodeType === 'tableCell' || nodeType === 'tableHeader' || nodeType === 'tableCaption') {
      selectRange(range);
    } else {
      node.remove();
    }
  };

/**
 * Removes an empty inline mark element from the document.
 */
export const correctEmptyMark =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.remove();
  };

/**
 * Selects the generic link text so the user can replace it with something
 * more descriptive.
 */
export const correctGenericLinkText =
  (range: Range | undefined): CorrectValidationFunction =>
  () => {
    selectRange(range);
  };

/**
 * Removes the underline mark by unwrapping the <u> element in-place.
 */
export const correctUnderlinedMark =
  (node: Element): CorrectValidationFunction =>
  () => {
    unwrapElement(node);
  };

/**
 * Deletes an empty heading node.
 */
export const correctEmptyHeading =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.remove();
  };

/**
 * Removes bold and italic marks from the content of a heading node.
 */
export const correctHeadingWithFormatting =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.querySelectorAll('strong, b, em, i').forEach(unwrapElement);
  };

/**
 * Removes the bold marks that wrap the entire content of a paragraph node.
 */
export const correctEntirelyBoldParagraph =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.querySelectorAll('strong, b').forEach(unwrapElement);
  };

/**
 * Fills the first empty definition term in a definition list with a placeholder.
 */
export const correctDefinitionListMissingTerm =
  (node: Element): CorrectValidationFunction =>
  () => {
    const emptyDt = Array.from(node.querySelectorAll('dt')).find((dt) => !dt.textContent?.trim());
    if (emptyDt) emptyDt.textContent = msg('definition term');
  };

/**
 * Fills an empty definition term with a placeholder so the description has a matching term.
 */
export const correctDefinitionTermMissingDescription =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.textContent = msg('definition term');
  };

// ── Document correctors ───────────────────────────────────────────────────────

/**
 * Corrects a heading's level to `targetLevel` by replacing the element tag.
 * Used for both "exceeds top level" and "skipped heading level" violations.
 */
export const correctHeadingLevel =
  (heading: Element, targetLevel: number): CorrectValidationFunction =>
  () => {
    changeTagName(heading, `h${targetLevel}`);
  };

/**
 * Converts a sequence of list-like paragraphs starting at `startParagraph`
 * into a proper ordered or unordered list node.
 */
export const correctConvertToList =
  (paragraph: Element, isOrdered: boolean): CorrectValidationFunction =>
  () => {
    convertParagraphsToList(paragraph, isOrdered);
  };

/**
 * Demotes a duplicate <h1> to <h2>.
 */
export const correctDuplicateHeadingOne =
  (h1: Element): CorrectValidationFunction =>
  () => {
    changeTagName(h1, 'h2');
  };

/**
 * Promotes the first block in the document to <h1> when the document
 * is expected to start with a top-level heading.
 */
export const correctMissingTopLevelHeading =
  (target: Element): CorrectValidationFunction =>
  () => {
    changeTagName(target, 'h1');
  };

/**
 * Converts a fully-bold short paragraph into the appropriate heading level,
 * stripping the bold and italic marks from the converted heading.
 * The target level is derived at correct-time by inspecting the nearest
 * preceding heading sibling.
 */
export const correctHeadingResemblingParagraph =
  (child: Element, text: string): CorrectValidationFunction =>
  () => {
    let precedingLevel = 1;
    let sibling = child.previousElementSibling;
    while (sibling) {
      const match = /^H([1-6])$/.exec(sibling.tagName);
      if (match) {
        precedingLevel = Number.parseInt(match[1], 10);
        break;
      }
      sibling = sibling.previousElementSibling;
    }
    const targetLevel = Math.min(precedingLevel + 1, 6);
    const newHeading = document.createElement(`h${targetLevel}`);
    newHeading.textContent = text;
    child.replaceWith(newHeading);
  };

/**
 * Adds a header row to a table that has neither a header row nor a header
 * column by converting the first row's <td> cells to <th>.
 */
export const correctTableMissingHeadings =
  (table: HTMLTableElement): CorrectValidationFunction =>
  () => {
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;
    for (const cell of firstRow.children) {
      if (cell.tagName === 'TH') return;
      const th = document.createElement('th');
      th.innerHTML = cell.innerHTML;
      for (const attr of cell.attributes) {
        th.setAttribute(attr.name, attr.value);
      }
      cell.replaceWith(th);
    }
  };

/**
 * Adds a new empty row after the first row of a table that contains only
 * a single row.
 */
export const correctTableMissingRows =
  (table: HTMLTableElement): CorrectValidationFunction =>
  () => {
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;
    const tbody = table.querySelector('tbody') ?? table;
    const newRow = document.createElement('tr');
    Array.from({ length: firstRow.children.length }, () => newRow.appendChild(document.createElement('td')));
    tbody.appendChild(newRow);
  };
