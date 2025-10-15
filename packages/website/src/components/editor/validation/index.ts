import { type Editor, Extension } from '@tiptap/core';
import type { ValidationError } from '../types/validation.ts';
import { CustomEvents } from '../events';

class ValidationOptions {}

const validateDocument = (editor: Editor) => {
  console.time('validation');
  const $headings = editor.$nodes('heading');
  if ($headings?.length) {
    for (const { pos } of $headings) {
      const { node } = editor.view.domAtPos(pos);
      if (node instanceof HTMLElement) {
        const payload: ValidationError = {
          id: pos,
          offsetHeight: node.offsetHeight,
          offsetTop: node.offsetTop,
          string: 'Mock heading validation error',
          text: node.innerText,
        };
        window.dispatchEvent(new CustomEvent(CustomEvents.VALIDATION_ERROR, { detail: payload }));
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
