const EMPTY_STR_REGEX = /^\s*$/;
export const isEmptyOrWhitespace = (text: string): boolean => EMPTY_STR_REGEX.test(text);

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
