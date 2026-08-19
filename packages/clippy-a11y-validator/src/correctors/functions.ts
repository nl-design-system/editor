import type { CorrectValidationFunction, ImageAltTextRequest } from '@/types';
import { validatorEvents } from '@/constants';
import { getParagraphLinesFromDOM, orderedListIndicator, unorderedListIndicator } from '@/helpers';

// Each `correct*` returns a deferred DOM mutation. Plain DOM only — the alt-text
// correction surfaces its request through a global event rather than a host callback.

// TODO: this placeholder is not localized
const DEFAULT_DEFINITION_TERM_LABEL = 'definition term';

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

// Select the range and move focus to it. Outside an editor the browser won't
// focus the contenteditable itself, so walk up to the nearest focusable ancestor.
const selectRange = (range: Range | undefined): void => {
  if (!range) return;

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

// Select the image, then dispatch a generic global event so a host can open its
// alt-text UI (prefilled src). No direct host reference needed.
export const correctImageMissingAltText =
  (node: HTMLImageElement, range: Range | undefined): CorrectValidationFunction =>
  () => {
    selectRange(range);
    const request: ImageAltTextRequest = { files: [{ name: node.alt, type: 'image/*', url: node.src }], replace: true };
    globalThis.dispatchEvent(new CustomEvent(validatorEvents.OPEN_IMAGE_DIALOG, { detail: request }));
  };

// Remove an empty node — but select table cells/captions instead of removing
// them, since deleting a cell would break the table structure.
export const correctEmptyNode =
  (node: Element, nodeType: string, range: Range | undefined): CorrectValidationFunction =>
  () => {
    if (nodeType === 'tableCell' || nodeType === 'tableHeader' || nodeType === 'tableCaption') {
      selectRange(range);
    } else {
      node.remove();
    }
  };

export const correctEmptyMark =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.remove();
  };

// Select the generic link text so the user can rewrite it.
export const correctGenericLinkText =
  (range: Range | undefined): CorrectValidationFunction =>
  () => {
    selectRange(range);
  };

// Unwrap the <u>, keeping its text.
export const correctUnderlinedMark =
  (node: Element): CorrectValidationFunction =>
  () => {
    unwrapElement(node);
  };

export const correctEmptyHeading =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.remove();
  };

// Strip bold/italic from a heading.
export const correctHeadingWithFormatting =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.querySelectorAll('strong, b, em, i').forEach(unwrapElement);
  };

// Unwrap the bold marks wrapping a whole paragraph.
export const correctEntirelyBoldParagraph =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.querySelectorAll('strong, b').forEach(unwrapElement);
  };

// Fill the first empty <dt> with the placeholder label.
export const correctDefinitionListMissingTerm =
  (node: Element, termLabel: string = DEFAULT_DEFINITION_TERM_LABEL): CorrectValidationFunction =>
  () => {
    const emptyDt = Array.from(node.querySelectorAll('dt')).find((dt) => !dt.textContent?.trim());
    if (emptyDt) emptyDt.textContent = termLabel;
  };

// Fill an empty term with the placeholder label.
export const correctDefinitionTermMissingDescription =
  (node: Element, termLabel: string = DEFAULT_DEFINITION_TERM_LABEL): CorrectValidationFunction =>
  () => {
    node.textContent = termLabel;
  };

// ── Document correctors ───────────────────────────────────────────────────────

export const correctHeadingLevel =
  (heading: Element, targetLevel: number): CorrectValidationFunction =>
  () => {
    changeTagName(heading, `h${targetLevel}`);
  };

export const correctConvertToList =
  (paragraph: Element, isOrdered: boolean): CorrectValidationFunction =>
  () => {
    convertParagraphsToList(paragraph, isOrdered);
  };

export const correctDuplicateHeadingOne =
  (h1: Element): CorrectValidationFunction =>
  () => {
    changeTagName(h1, 'h2');
  };

export const correctMissingTopLevelHeading =
  (target: Element): CorrectValidationFunction =>
  () => {
    changeTagName(target, 'h1');
  };

// Retag to one level below the nearest preceding heading (derived at correct-time).
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

// Convert the first row's <td> cells to <th>.
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

// Append an empty row matching the first row's cell count.
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
