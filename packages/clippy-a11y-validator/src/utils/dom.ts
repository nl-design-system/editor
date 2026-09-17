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

export const precedingMatch = (element: Element, root: ParentNode, selector: string): HTMLElement | null => {
  const preceding = [...root.querySelectorAll<HTMLElement>(selector)].filter(
    (candidate) =>
      candidate !== element &&
      !candidate.contains(element) &&
      (element.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_PRECEDING) !== 0,
  );

  return preceding.at(-1) ?? null;
};

/**
 * Descendants matching `selector` that belong to `element` itself rather than to a nested `container`,
 * so a rule about a list does not trip over the contents of a list inside it.
 */
export const ownDescendants = (element: Element, selector: string, container: string): HTMLElement[] =>
  [...element.querySelectorAll<HTMLElement>(selector)].filter((candidate) => candidate.closest(container) === element);

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
