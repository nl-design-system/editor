import { textLines } from './dom.ts';
import { isEmptyOrWhitespace } from './text.ts';

/** A hand-numbered marker: `1.`, `2)`, `3]`, `4/` or `5 `. Tested against the first two characters of a line. */
const ORDERED_INDICATOR = /^\d+[.)\]/ ]$/;

/** A bullet marker: `•`, `-`, `*` or `+` followed by whitespace. */
const UNORDERED_INDICATOR = /^\s*([•\-*+])\s+/;

const ORDERED_PREFIX = /^\d+[.)\]/ ]-?\s*/;

const UNORDERED_PREFIX = /^\s*[•\-*+]\s+/;

const PREFIX_LENGTH = 2;

export const listPrefix = (text: string): string => text.substring(0, PREFIX_LENGTH);

export const isOrderedPrefix = (prefix: string): boolean => ORDERED_INDICATOR.test(prefix);

export const isUnorderedPrefix = (prefix: string): boolean => UNORDERED_INDICATOR.test(prefix);

/**
 * A hand-numbered list continues when the next line's marker is one higher, so decrementing the second
 * marker should reproduce the first. Bullet markers do not count, so they are returned unchanged.
 */
export const decrementPrefix = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

export const isOrderedListItem = (element: Element): boolean => isOrderedPrefix(listPrefix(element.textContent ?? ''));

export const stripListPrefix = (text: string, isOrdered: boolean): string =>
  text.replace(isOrdered ? ORDERED_PREFIX : UNORDERED_PREFIX, '');

/**
 * Replaces a run of list-like paragraphs, starting at `startParagraph`, with a single `ul` or `ol`.
 * Every `<br>`-separated line becomes its own list item with the marker stripped.
 */
export const convertParagraphsToList = (startParagraph: Element, isOrdered: boolean): void => {
  const parent = startParagraph.parentNode;
  if (!parent) return;

  const list = startParagraph.ownerDocument.createElement(isOrdered ? 'ol' : 'ul');
  const paragraphs: Element[] = [startParagraph];

  let next = startParagraph.nextElementSibling;
  while (next?.tagName === startParagraph.tagName) {
    const prefix = listPrefix(next.textContent ?? '');
    if (!isOrderedPrefix(prefix) && !isUnorderedPrefix(prefix)) break;
    paragraphs.push(next);
    next = next.nextElementSibling;
  }

  for (const paragraph of paragraphs) {
    for (const line of textLines(paragraph)) {
      if (isEmptyOrWhitespace(line)) continue;
      const item = list.ownerDocument.createElement('li');
      item.textContent = stripListPrefix(line.trim(), isOrdered);
      list.append(item);
    }
  }

  startParagraph.before(list);
  for (const paragraph of paragraphs) paragraph.remove();
};
