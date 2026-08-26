import { isEmptyOrWhitespace } from '@/helpers';

/** The `<dt>` elements belonging to this list rather than to a nested one. */
const ownTerms = (list: Element): Element[] =>
  Array.from(list.querySelectorAll('dt')).filter((term) => term.closest('dl') === list);

/** An empty term paired with a filled description — the description has no label. */
export const isEmptyTermWithDescription = (element: Element): boolean => {
  if (element.tagName !== 'DT') return false;
  if (!isEmptyOrWhitespace(element.textContent ?? '')) return false;

  const description = element.nextElementSibling;
  if (description?.tagName !== 'DD') return false;

  return !isEmptyOrWhitespace(description.textContent ?? '');
};

/** A definition list whose every own term is empty, so nothing is defined. */
export const hasOnlyEmptyTerms = (element: Element): boolean => {
  if (element.tagName !== 'DL') return false;

  const terms = ownTerms(element);
  if (terms.length === 0) return false;

  return terms.every((term) => isEmptyOrWhitespace(term.textContent ?? ''));
};
