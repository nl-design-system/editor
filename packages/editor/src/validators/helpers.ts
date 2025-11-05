import type { Editor } from '@tiptap/core';

export const getNodeBoundingBox = (editor: Editor, pos: number): { top: number; height: number } | null => {
  const domNode = editor.view.nodeDOM(pos);
  if (domNode instanceof HTMLElement) {
    return { height: domNode.offsetHeight, top: domNode.offsetTop };
  }
  return null;
};
