import type { Mark } from 'prosemirror-model';

export const getNodeBoundingBox = (element: Element): { top: number; height: number } | null => {
  if (element instanceof HTMLElement) {
    console.log(element.getBoundingClientRect());
    // TODO: Detached DOM does not provide offsetTop/offsetHeight. Use TipTap anyway?
    return { height: element.offsetHeight, top: element.offsetTop };
  }

  return null;
};

export const isBold = (value: Mark): boolean => value.type.name === 'bold';
export const isItalic = (value: Mark): boolean => value.type.name === 'italic';
