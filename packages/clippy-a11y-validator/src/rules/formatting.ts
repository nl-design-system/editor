import type { ValidationRule } from '../types/validation.ts';
import { selectors } from '../consts/selectors.ts';
import { not } from '../utils/combinators.ts';
import { visibleTextNodes } from '../utils/dom.ts';

const isEntirelyBold: ValidationRule = (element) => {
  const nodes = visibleTextNodes(element);
  if (nodes.length === 0) return false;

  return nodes.every((node) => {
    const bold = node.parentElement?.closest(selectors.BOLD);
    return bold !== null && bold !== undefined && element.contains(bold);
  });
};

export const isNotEntirelyBold: ValidationRule = not(isEntirelyBold);
