const EMPTY_STR_REGEX = /^\s*$/;
export const isEmptyOrWhitespace = (text: string): boolean => EMPTY_STR_REGEX.test(text);

export const getElementRange = (element: Element): Range | undefined => {
  try {
    const range = document.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
};
