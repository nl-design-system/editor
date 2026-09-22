import type { ValidationCondition } from '../../types/validation.ts';
import { selectors } from '../../consts/selectors.ts';
import { textLines, visibleTextNodes } from '../../utils/dom.ts';
import { isEmptyOrWhitespace } from '../../utils/text.ts';
import { orderedListRegex } from '../ordered-list/index.ts';
import { unorderedListRegex } from '../unordered-list/index.ts';

const PREFIX_LENGTH = 2;

export const listPrefix = (text: string): string => text.substring(0, PREFIX_LENGTH);

export const isOrderedPrefix = (prefix: string): boolean => orderedListRegex.test(prefix);

export const isUnorderedPrefix = (prefix: string): boolean => unorderedListRegex.test(prefix);

/**
 * A hand-numbered list continues when the next line's marker is one higher, so decrementing the second
 * marker should reproduce the first. Bullet markers do not count, so they are returned unchanged.
 */
export const decrementPrefix = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

export const isOrderedListItem = (element: Element): boolean => isOrderedPrefix(listPrefix(element.textContent ?? ''));

export const stripListPrefix = (text: string, isOrdered: boolean): string =>
  text.replace(isOrdered ? orderedListRegex : unorderedListRegex, '');

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

/**
 * True when the element opens a hand-written list: it starts with a list marker and the sequence continues,
 * either in the next sibling of the same kind or on a `<br>`-separated second line.
 */
export const resemblesListItem: ValidationCondition = (element) => {
  const firstPrefix = listPrefix(element.textContent ?? '');
  if (!isOrderedPrefix(firstPrefix) && !isUnorderedPrefix(firstPrefix)) return false;

  const next = element.nextElementSibling;
  if (next?.tagName === element.tagName && decrementPrefix(listPrefix(next.textContent ?? '')) === firstPrefix) {
    return true;
  }

  const lines = textLines(element);

  return lines.length > 1 && decrementPrefix(listPrefix(lines[1] ?? '')) === firstPrefix;
};

export const isEntirelyBold: ValidationCondition = (element) => {
  const nodes = visibleTextNodes(element);
  if (nodes.length === 0) return false;

  return nodes.every((node) => {
    const bold = node.parentElement?.closest(selectors.BOLD);
    return bold !== null && bold !== undefined && element.contains(bold);
  });
};
