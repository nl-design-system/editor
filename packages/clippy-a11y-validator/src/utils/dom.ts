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

export const unwrapElement = (element: Element): void => {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  parent.removeChild(element);
};
