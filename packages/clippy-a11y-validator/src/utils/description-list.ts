import { selectors } from '../consts/selectors.ts';
import { ownDescendants } from './dom.ts';

/** Terms belonging to this list rather than to a nested one. */
export const ownTerms = (list: HTMLDListElement): HTMLElement[] =>
  ownDescendants(list, selectors.DESCRIPTION_TERM, selectors.DESCRIPTION_LIST);
