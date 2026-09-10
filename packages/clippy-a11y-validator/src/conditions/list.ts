import type { PageValidationCondition } from '../types/validation.ts';
import { textLines } from '../utils/dom.ts';
import { decrementPrefix, isOrderedPrefix, isUnorderedPrefix, listPrefix } from '../utils/list.ts';

export const resemblesListItem: PageValidationCondition = (element, { following }) => {
  const firstPrefix = listPrefix(element.textContent ?? '');
  if (!isOrderedPrefix(firstPrefix) && !isUnorderedPrefix(firstPrefix)) return false;

  const [next] = following(element.localName);
  if (next !== undefined && decrementPrefix(listPrefix(next.textContent ?? '')) === firstPrefix) return true;

  const lines = textLines(element);

  return lines.length > 1 && decrementPrefix(listPrefix(lines[1] ?? '')) === firstPrefix;
};
