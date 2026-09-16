import type { Selector } from './types/selector.ts';
import type { ValidationContext } from './types/validation.ts';

export const matchingElements = (roots: readonly ParentNode[], selector: Selector): HTMLElement[] =>
  roots.flatMap((root) => [...root.querySelectorAll(selector)].filter((element) => element instanceof HTMLElement));

type Direction = 'after' | 'before';

const siblingMatches = (element: HTMLElement, direction: Direction, selector: Selector): HTMLElement[] => {
  const step = (from: Element): Element | null =>
    direction === 'before' ? from.previousElementSibling : from.nextElementSibling;
  const run: HTMLElement[] = [];

  for (
    let sibling = step(element);
    sibling instanceof HTMLElement && sibling.matches(selector);
    sibling = step(sibling)
  ) {
    run.push(sibling);
  }

  return run;
};

const pageMatches = (
  roots: readonly ParentNode[],
  element: HTMLElement,
  direction: Direction,
  selector: Selector,
): HTMLElement[] => {
  const page = matchingElements(roots, '*');
  const position = page.indexOf(element);
  if (position === -1) return [];

  const side = direction === 'before' ? page.slice(0, position).reverse() : page.slice(position + 1);

  return side.filter(
    // exclude ancestors (before direction), descendants (after direction) and non-matching elements
    (candidate) => !candidate.contains(element) && !element.contains(candidate) && candidate.matches(selector),
  );
};

export const pageContext =
  (roots: readonly ParentNode[]) =>
  (element: HTMLElement): ValidationContext => ({
    /** Every earlier match in the page, nearest first, excluding the element's ancestors. */
    precedingMatches: (selector) => pageMatches(roots, element, 'before', selector),
    /** The unbroken run of matching previous siblings, nearest first, stopping at the first non-match. */
    precedingSiblingMatches: (selector) => siblingMatches(element, 'before', selector),
    /** Every later match in the page, nearest first, excluding the element's descendants. */
    subsequentMatches: (selector) => pageMatches(roots, element, 'after', selector),
    /** The unbroken run of matching next siblings, nearest first, stopping at the first non-match. */
    subsequentSiblingMatches: (selector) => siblingMatches(element, 'after', selector),
  });
