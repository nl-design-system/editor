import type { Element } from 'ckeditor5';

// Walk all descendant elements recursively, necessary for content validations
export const walkElements = (element: Element, result: Element[] = []): Element[] => {
  for (const child of element.getChildren()) {
    if (child.is('element')) {
      result.push(child);
      walkElements(child, result);
    }
  }
  return result;
};

// Extracts heading level model names from CKEditor ('heading1', 'heading2', etc).
export const getHeadingLevel = (elementName: string): number | null => {
  const match = /^heading(\d+)$/.exec(elementName);
  return match ? parseInt(match[1], 10) : null;
};
