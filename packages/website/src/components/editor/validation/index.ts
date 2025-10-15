import { type Editor, Extension } from '@tiptap/core';
import type { ValidationError } from '../types/validation.ts';

class ValidationOptions {}

const validateDocument = (editor: Editor) => {
  console.time('validation');
  const $headings = editor.$nodes('heading');
  if ($headings?.length) {
    for (const { pos } of $headings) {
      const dom = editor.view.domAtPos(pos);
      if (dom.node instanceof HTMLElement) {
        const payload: ValidationError = {
          id: pos,
          offsetHeight: dom.node.offsetHeight,
          offsetTop: dom.node.offsetTop,
          string: 'Mock heading validation error',
          text: dom.node.innerText,
        };
        window.dispatchEvent(new CustomEvent('VALIDATION_ERROR', { detail: payload }));
      }
    }
  }
  console.timeEnd('validation');
  return [];
};

export default Extension.create<ValidationOptions>({
  name: 'validation',

  // onCreate({ editor }) {
  //   validateDocument(editor);
  // },

  onUpdate({ editor }) {
    validateDocument(editor);
  },
});
