import type { Fragment } from './types/fragment.ts';
import type { Selector } from './types/selector.ts';
import type { ValidationContext } from './types/validation.ts';

export const matchingElements = (documentContent: readonly Fragment[], selector: Selector): HTMLElement[] =>
  documentContent.flatMap((fragment) =>
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

/** Answers the lookups a document validation reads the document through. One instance per pass. */
export class DocumentContext {
  readonly #documentContent: readonly Fragment[];

  constructor(documentContent: readonly Fragment[]) {
    this.#documentContent = documentContent;
  }

  for(element: HTMLElement): ValidationContext {
    return {
      precedingMatches: (selector) => this.#documentMatches(element, selector, 'before'),
      precedingSiblingMatches: (selector) => siblingMatches(element, selector, 'before'),
      subsequentMatches: (selector) => this.#documentMatches(element, selector, 'after'),
      subsequentSiblingMatches: (selector) => siblingMatches(element, selector, 'after'),
    };
  }

  #documentMatches(element: HTMLElement, selector: Selector, direction: Direction): HTMLElement[] {
    const elements = matchingElements(this.#documentContent, '*');
    const position = elements.indexOf(element);
    if (position === -1) return [];

    const side = direction === 'before' ? elements.slice(0, position).reverse() : elements.slice(position + 1);

    return side.filter(
      (candidate) => candidate.matches(selector) && !candidate.contains(element) && !element.contains(candidate),
    );
  }
}
