import { isEmptyOrWhitespace } from '../../../helpers.ts';
import { isEntirelyBold } from '../rules.ts';

export const isEntirelyBoldParagraph = (paragraph: HTMLParagraphElement): boolean => {
  if (isEmptyOrWhitespace(paragraph.textContent ?? '')) return false;
  return isEntirelyBold(paragraph);
};
