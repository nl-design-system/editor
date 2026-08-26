import type { CorrectValidationFunction } from '@/types';
import { unwrapElement } from '@/dom';
import { getParagraphLinesFromDOM, orderedListIndicator, unorderedListIndicator } from '@/helpers';
import { BOLD_SELECTOR } from './rules';

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

// Unwrap the bold marks wrapping a whole paragraph.
export const correctEntirelyBoldParagraph =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.querySelectorAll(BOLD_SELECTOR).forEach(unwrapElement);
  };

export const correctConvertToList =
  (paragraph: Element, isOrdered: boolean): CorrectValidationFunction =>
  () => {
    convertParagraphsToList(paragraph, isOrdered);
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
