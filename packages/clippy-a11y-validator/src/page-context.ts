import type { Fragment } from './types/fragment.ts';
import type { Selector } from './types/selector.ts';
import type { ValidationContext } from './types/validation.ts';

export const matchingElements = (pageContent: readonly Fragment[], selector: Selector): HTMLElement[] =>
  pageContent.flatMap((fragment) =>
    [...fragment.querySelectorAll(selector)].filter((element) => element instanceof HTMLElement),
  );

type Direction = 'after' | 'before';

const siblingMatches = (element: HTMLElement, selector: Selector, direction: Direction): HTMLElement[] => {
  const next = direction === 'before' ? 'previousElementSibling' : 'nextElementSibling';
  const matches: HTMLElement[] = [];
  let sibling = element[next];

  while (sibling instanceof HTMLElement && sibling.matches(selector)) {
    matches.push(sibling);
    sibling = sibling[next];
  }

  return matches;
};

/** Answers the lookups a page validation reads the page through. One instance per pass. */
export class PageContext {
  readonly #pageContent: readonly Fragment[];

  constructor(pageContent: readonly Fragment[]) {
    this.#pageContent = pageContent;
  }

  for(element: HTMLElement): ValidationContext {
    return {
      precedingMatches: (selector) => this.#pageMatches(element, selector, 'before'),
      precedingSiblingMatches: (selector) => siblingMatches(element, selector, 'before'),
      subsequentMatches: (selector) => this.#pageMatches(element, selector, 'after'),
      subsequentSiblingMatches: (selector) => siblingMatches(element, selector, 'after'),
    };
  }

  #pageMatches(element: HTMLElement, selector: Selector, direction: Direction): HTMLElement[] {
    const page = matchingElements(this.#pageContent, '*');
    const position = page.indexOf(element);
    if (position === -1) return [];

    const side = direction === 'before' ? page.slice(0, position).reverse() : page.slice(position + 1);

    return side.filter(
      (candidate) => candidate.matches(selector) && !candidate.contains(element) && !element.contains(candidate),
    );
  }
}
