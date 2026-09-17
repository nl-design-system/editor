import type { ValidationCondition } from '../types/validation.ts';
import { textLines } from '../utils/dom.ts';
import { decrementPrefix, isOrderedPrefix, isUnorderedPrefix, listPrefix } from '../utils/list.ts';

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
