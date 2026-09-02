const EMPTY_STR_REGEX = /^\s*$/;
export const isEmptyOrWhitespace = (text: string): boolean => EMPTY_STR_REGEX.test(text);

export const hasTextContent = (element: Element): boolean => !isEmptyOrWhitespace(element.textContent ?? '');

export const unwrapElement = (element: Element): void => {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  parent.removeChild(element);
};
