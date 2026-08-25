const EMPTY_STR_REGEX = /^\s*$/;
export const isEmptyOrWhitespace = (text: string): boolean => EMPTY_STR_REGEX.test(text);

/** Build a DOM `Range` selecting the whole element, or `undefined` if it can't be created. */
export const getElementRange = (element: Element): Range | undefined => {
  try {
    const range = element.ownerDocument.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
};

/**
 * Depth-first pre-order traversal over every descendant element of `root`
 * (`root` itself is not visited). Reusable walker for element-scoped passes.
 */
export const walkElements = (root: Element, visit: (element: Element) => void): void => {
  const walk = (element: Element): void => {
    visit(element);
    for (const child of element.children) walk(child);
  };
  for (const child of root.children) walk(child);
};

/** Matches a 2-character ordered-list prefix such as `"1."`, `"2)"`, `"3 "`. */
export const orderedListIndicator = /^\d+[.)\]/ ]$/;
/** Matches an unordered-list bullet prefix such as `"- "`, `"• "`, `"* "`. */
export const unorderedListIndicator = /^\s*([•\-*+])\s+/;

/** Split a paragraph element into its `<br>`-separated text lines. */
export const getParagraphLinesFromDOM = (paragraph: Element): string[] => {
  const lines: string[] = [];
  let current = '';
  for (const node of paragraph.childNodes) {
    if (node instanceof Element && node.tagName === 'BR') {
      if (current.trim().length > 0) lines.push(current);
      current = '';
    } else {
      current += node.textContent ?? '';
    }
  }
  if (current.trim().length > 0) lines.push(current);
  return lines;
};
