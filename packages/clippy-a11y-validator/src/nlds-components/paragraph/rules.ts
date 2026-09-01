const BOLD_TAGS = new Set(['B', 'STRONG']);

export const BOLD_SELECTOR = 'strong, b';

const visibleChildren = (element: Element): ChildNode[] =>
  Array.from(element.childNodes).filter(
    (node) => node.nodeType !== Node.TEXT_NODE || (node.textContent?.trim().length ?? 0) > 0,
  );

export const isEntirelyBold = (element: Element): boolean => {
  const children = visibleChildren(element);
  if (children.length === 0) return false;
  return children.every((node) => node instanceof Element && BOLD_TAGS.has(node.tagName));
};
