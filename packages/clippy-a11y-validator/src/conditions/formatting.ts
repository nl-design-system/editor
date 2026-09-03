import type { ValidationCondition } from '../types/validation.ts';
import { selectors } from '../consts/selectors.ts';
import { not } from '../utils/combinators.ts';
import { visibleTextNodes } from '../utils/dom.ts';

const isEntirelyBold: ValidationCondition = (element) => {
  const nodes = visibleTextNodes(element);
  if (nodes.length === 0) return false;

  return nodes.every((node) => {
    const bold = node.parentElement?.closest(selectors.BOLD);
    return bold !== null && bold !== undefined && element.contains(bold);
  });
};

export const isNotEntirelyBold: ValidationCondition = not(isEntirelyBold);
