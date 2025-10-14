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
          offsetTop: dom.node.offsetTop,
          string: 'This is a mock validation error',
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
