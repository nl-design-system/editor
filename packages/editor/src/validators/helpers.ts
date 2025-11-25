import type { Editor } from '@tiptap/core';

export const getNodeBoundingBox = (editor: Editor, pos: number): { top: number; height: number } | null => {
  const domNode = editor.view.nodeDOM(pos);
  if (domNode instanceof HTMLElement) {
    return { height: domNode.offsetHeight, top: domNode.offsetTop };
  }

  if (domNode instanceof Text) {
    const range = document.createRange();
    range.selectNodeContents(domNode);
    const rect = range.getBoundingClientRect();
    const editorRect = editor.view.dom.getBoundingClientRect();

    return {
      height: rect.height,
      top: rect.top - editorRect.top + editor.view.dom.scrollTop,
    };
  }

  return null;
};
