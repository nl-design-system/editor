import type { Selector } from './types/selector.ts';
import type { ValidationContext } from './types/validation.ts';

export const matchingElements = (roots: readonly ParentNode[], selector: Selector): HTMLElement[] =>
  roots.flatMap((root) => [...root.querySelectorAll(selector)].filter((element) => element instanceof HTMLElement));

export const pageContext =
  (roots: readonly ParentNode[]) =>
  (element: Element): ValidationContext => ({
    following: (selector) => {
      const run: HTMLElement[] = [];

      for (
        let sibling = element.nextElementSibling;
        sibling instanceof HTMLElement && sibling.matches(selector);
        sibling = sibling.nextElementSibling
      ) {
        run.push(sibling);
      }

      return run;
    },
    previous: (selector) => {
      const page = matchingElements(roots, '*');
      const position = page.findIndex((candidate) => candidate === element);

      return (
        page
          .slice(0, Math.max(position, 0))
          .findLast((candidate) => !candidate.contains(element) && candidate.matches(selector)) ?? null
      );
    },
  });
