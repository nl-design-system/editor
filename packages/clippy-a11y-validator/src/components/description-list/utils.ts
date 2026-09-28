import { selectors } from '../../consts/selectors.ts';
import { hasTextContent } from '../../utils/content.ts';
import { ownDescendants } from '../../utils/dom.ts';

/** Terms belonging to this list rather than to a nested one. */
export const ownTerms = (list: HTMLDListElement): HTMLElement[] =>
  ownDescendants(list, selectors.DESCRIPTION_TERM, selectors.DESCRIPTION_LIST);

const descriptionFor = (term: HTMLElement): HTMLElement | null => {
  const next = term.nextElementSibling;

  return next instanceof HTMLElement && next.matches(selectors.DESCRIPTION_DETAILS) ? next : null;
};

const isEmptyTerm = (term: HTMLElement): boolean => !hasTextContent(term);

const hasFilledDescription = (term: HTMLElement): boolean => {
  const description = descriptionFor(term);

  return description !== null && hasTextContent(description);
};

export const emptyTermsWithDescription = (list: HTMLDListElement): HTMLElement[] =>
  ownTerms(list).filter((term) => isEmptyTerm(term) && hasFilledDescription(term));

export const emptyTermsWithoutDescription = (list: HTMLDListElement): HTMLElement[] =>
  ownTerms(list).filter((term) => isEmptyTerm(term) && !hasFilledDescription(term));
