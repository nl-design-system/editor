import { isEmptyOrWhitespace } from '@/helpers';

/** An image with no alt attribute, or one holding only whitespace. */
export const isMissingAltText = (element: Element): boolean => {
  if (element.tagName !== 'IMG') return false;

  const { alt } = element as HTMLImageElement;
  return !alt || isEmptyOrWhitespace(alt);
};
