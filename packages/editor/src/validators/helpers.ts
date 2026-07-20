export const getElementRange = (element: Element): Range | undefined => {
  try {
    const range = document.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
};
