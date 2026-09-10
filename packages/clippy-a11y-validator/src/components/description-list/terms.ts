import { hasTextContent } from '../../conditions/index.ts';
import { selectors } from '../../consts/index.ts';

export const ownTerms = (list: HTMLElement): HTMLElement[] =>
  [...list.querySelectorAll<HTMLElement>(selectors.DESCRIPTION_TERM)].filter(
    (term) => term.closest(selectors.DESCRIPTION_LIST) === list,
  );

export const emptyTerms = (list: HTMLElement): HTMLElement[] => ownTerms(list).filter((term) => !hasTextContent(term));

export const hasFilledDescription = (term: HTMLElement): boolean => {
  const description = term.nextElementSibling;

  return description instanceof HTMLElement && description.tagName === 'DD' && hasTextContent(description);
};
