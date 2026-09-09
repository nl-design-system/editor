import { selectors } from '../consts/selectors.ts';
import { isEmptyOrWhitespace } from './text.ts';

export const visibleTextNodes = (element: Element): Text[] => {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!isEmptyOrWhitespace(node.data)) nodes.push(node);
  }

  return nodes;
};

export const trimmedText = (element: Element): string => element.textContent?.trim() ?? '';

/** Whether the text of an element is short enough to pass for a heading. Length is likely to become configurable */
const MAX_HEADING_LENGTH = 60;
export const hasHeadingLength = (element: Element): boolean => trimmedText(element).length <= MAX_HEADING_LENGTH;

export const unwrapElement = (element: Element): void => {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  element.remove();
};

export const changeTagName = (element: Element, tagName: string): void => {
  const replacement = element.ownerDocument.createElement(tagName);
  for (const { name, value } of element.attributes) replacement.setAttribute(name, value);
  replacement.replaceChildren(...element.childNodes);
  element.replaceWith(replacement);
};

export const headingLevel = (element: Element): number => Number.parseInt(element.tagName.slice(1), 10);

export const precedingMatch = (element: Element, root: ParentNode, selector: string): HTMLElement | null => {
  const preceding = [...root.querySelectorAll<HTMLElement>(selector)].filter(
    (candidate) =>
      candidate !== element &&
      !candidate.contains(element) &&
      (element.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_PRECEDING) !== 0,
  );

  return preceding.at(-1) ?? null;
};

export const precedingHeading = (element: Element, root: ParentNode): HTMLElement | null =>
  precedingMatch(element, root, selectors.HEADING);

/** Splits an element into its `<br>`-separated text lines. */
export const textLines = (element: Element): string[] => {
  const lines: string[] = [];
  let current = '';

  for (const node of element.childNodes) {
    if (node instanceof Element && node.tagName === 'BR') {
      if (!isEmptyOrWhitespace(current)) lines.push(current);
      current = '';
    } else {
      current += node.textContent ?? '';
    }
  }

  if (!isEmptyOrWhitespace(current)) lines.push(current);

  return lines;
};
