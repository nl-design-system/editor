export function traverseUpDOM(startElement: Element | null, assert: (element: Element) => boolean): Element | null {
  let element: Element | null = startElement;

  while (element) {
    if (assert(element)) {
      return element;
    }

    const root = element.getRootNode() as ShadowRoot | Document;
    if (root instanceof ShadowRoot) {
      element = root.host;
    } else {
      element = element.parentElement;
    }
  }

  return null;
}

export function findNearestAncestorAttribute(startElement: Element | null, attributeName: string): string | null {
  const element = traverseUpDOM(startElement, (el) => el.hasAttribute(attributeName));

  return element?.getAttribute(attributeName) ?? null;
}
